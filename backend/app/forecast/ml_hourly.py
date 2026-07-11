"""ML hourly forecast for carbon intensity and renewable share.

Improves on the flat moving-average baseline (`moving_avg_24h`) by learning the
daily cycle: a Ridge regression on Fourier features of the hour-of-day. Carbon
intensity has a strong 24 h pattern (solar midday, evening demand peak), so a
per-hour model beats a single flat average.

Design goals:
- **Explainable** — linear model on hour-of-day harmonics, not a black box.
- **Testable without a database** — the core (`build_hourly_forecast`,
  `backtest_hourly`) are pure functions over lists of rows.
- **Honest** — ships a `backtest_hourly` MAE vs. the baseline as a KPI.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Callable

from sklearn.linear_model import Ridge

from app.db.client import get_supabase

MODEL_NAME = "sklearn_hourly_v1"
BASELINE_MODEL = "moving_avg_24h"
FORECAST_HOURS = 12
HISTORY_HOURS = 168  # up to 7 days of context
MIN_POINTS = 24  # need ~1 day to learn a daily cycle, else fall back to the mean
HOLDOUT_HOURS = 12  # backtest horizon


def _parse_ts(value: str) -> datetime:
    dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def _hour_features(dt: datetime) -> list[float]:
    """Two Fourier harmonics of the hour-of-day → smooth daily shape."""
    h = dt.hour + dt.minute / 60.0
    two_pi = 2.0 * math.pi
    return [
        math.sin(two_pi * h / 24.0),
        math.cos(two_pi * h / 24.0),
        math.sin(2.0 * two_pi * h / 24.0),
        math.cos(2.0 * two_pi * h / 24.0),
    ]


def _pairs(
    history: list[dict[str, Any]], value_key: str, ts_key: str
) -> list[tuple[datetime, float]]:
    pairs: list[tuple[datetime, float]] = []
    for row in history:
        try:
            pairs.append((_parse_ts(row[ts_key]), float(row[value_key])))
        except (KeyError, TypeError, ValueError):
            continue
    pairs.sort(key=lambda p: p[0])
    return pairs


@dataclass
class HourlyForecast:
    model: str
    rows: list[dict[str, Any]]
    n_train: int
    fallback: bool
    mean_value: float


def build_hourly_forecast(
    history: list[dict[str, Any]],
    *,
    value_key: str,
    ts_key: str = "recorded_at",
    metric: str = "carbon_intensity",
    now: datetime | None = None,
    forecast_hours: int = FORECAST_HOURS,
    min_points: int = MIN_POINTS,
) -> HourlyForecast:
    """Fit the hour-of-day model and return `forecast_hours` future rows.

    Falls back to the historical mean (flat, like the baseline) when there is not
    enough history to learn a cycle.
    """
    now = now or datetime.now(timezone.utc)
    pairs = _pairs(history, value_key, ts_key)
    values = [v for _, v in pairs]
    mean_value = round(sum(values) / len(values), 4) if values else 0.0

    def _rows_for(predict: Callable[[datetime], float]) -> list[dict[str, Any]]:
        rows: list[dict[str, Any]] = []
        for hour in range(1, forecast_hours + 1):
            forecast_for = now + timedelta(hours=hour)
            rows.append(
                {
                    "metric": metric,
                    "forecast_for": forecast_for.isoformat(),
                    "value": round(float(predict(forecast_for)), 4),
                    "model": MODEL_NAME,
                }
            )
        return rows

    if len(pairs) < min_points:
        return HourlyForecast(
            model=MODEL_NAME,
            rows=_rows_for(lambda _dt: mean_value),
            n_train=len(pairs),
            fallback=True,
            mean_value=mean_value,
        )

    features = [_hour_features(dt) for dt, _ in pairs]
    model = Ridge(alpha=1.0)
    model.fit(features, values)

    def _predict(dt: datetime) -> float:
        return float(model.predict([_hour_features(dt)])[0])

    return HourlyForecast(
        model=MODEL_NAME,
        rows=_rows_for(_predict),
        n_train=len(pairs),
        fallback=False,
        mean_value=mean_value,
    )


@dataclass
class BacktestResult:
    ml_mae: float
    baseline_mae: float
    improvement_pct: float
    n_test: int


def backtest_hourly(
    history: list[dict[str, Any]],
    *,
    value_key: str,
    ts_key: str = "recorded_at",
    holdout_hours: int = HOLDOUT_HOURS,
    min_points: int = MIN_POINTS,
) -> BacktestResult | None:
    """Compare the ML model against the flat-mean baseline on a time holdout.

    Trains on all but the last `holdout_hours` points, predicts them, and returns
    the mean absolute error of each approach. Returns None when data is too sparse.
    """
    pairs = _pairs(history, value_key, ts_key)
    if len(pairs) < min_points + holdout_hours:
        return None

    train = pairs[:-holdout_hours]
    test = pairs[-holdout_hours:]
    train_values = [v for _, v in train]

    baseline_pred = sum(train_values) / len(train_values)
    model = Ridge(alpha=1.0)
    model.fit([_hour_features(dt) for dt, _ in train], train_values)

    ml_abs = 0.0
    baseline_abs = 0.0
    for dt, actual in test:
        ml_pred = float(model.predict([_hour_features(dt)])[0])
        ml_abs += abs(ml_pred - actual)
        baseline_abs += abs(baseline_pred - actual)

    n = len(test)
    ml_mae = ml_abs / n
    baseline_mae = baseline_abs / n
    improvement = (
        (baseline_mae - ml_mae) / baseline_mae * 100.0 if baseline_mae > 0 else 0.0
    )
    return BacktestResult(
        ml_mae=round(ml_mae, 4),
        baseline_mae=round(baseline_mae, 4),
        improvement_pct=round(improvement, 1),
        n_test=n,
    )


def _write_rows(client, rows: list[dict[str, Any]]) -> None:
    if rows:
        client.table("forecasts").upsert(
            rows, on_conflict="metric,forecast_for,model"
        ).execute()


def _fetch_carbon(client, since: str) -> list[dict[str, Any]]:
    resp = (
        client.table("carbon_intensity_points")
        .select("recorded_at,carbon_gco2_kwh")
        .gte("recorded_at", since)
        .order("recorded_at", desc=False)
        .execute()
    )
    return resp.data or []


def _fetch_renewable(client, since: str) -> list[dict[str, Any]]:
    resp = (
        client.table("grid_mix_points")
        .select("recorded_at,wind_pct,solar_pct,hydro_pct")
        .gte("recorded_at", since)
        .order("recorded_at", desc=False)
        .execute()
    )
    rows: list[dict[str, Any]] = []
    for r in resp.data or []:
        try:
            value = float(r["wind_pct"]) + float(r["solar_pct"]) + float(r["hydro_pct"])
        except (KeyError, TypeError, ValueError):
            continue
        rows.append({"recorded_at": r["recorded_at"], "value": round(value, 4)})
    return rows


def _summarize(
    metric: str, forecast: HourlyForecast, backtest: BacktestResult | None
) -> dict[str, Any]:
    summary: dict[str, Any] = {
        "metric": metric,
        "points_written": len(forecast.rows),
        "fallback": forecast.fallback,
        "n_train": forecast.n_train,
    }
    if backtest is not None:
        summary["backtest"] = {
            "ml_mae": backtest.ml_mae,
            "baseline_mae": backtest.baseline_mae,
            "improvement_pct": backtest.improvement_pct,
            "n_test": backtest.n_test,
        }
    return summary


def run_ml_carbon_forecast() -> dict[str, Any]:
    """Read history from Supabase, fit the ML model, and upsert forecasts.

    Mirrors `moving_avg.run_carbon_forecast` but writes under `sklearn_hourly_v1`
    and returns a backtest KPI (ML vs. baseline MAE).
    """
    client = get_supabase()
    now = datetime.now(timezone.utc)
    since = (now - timedelta(hours=HISTORY_HOURS)).isoformat()

    carbon = _fetch_carbon(client, since)
    carbon_forecast = build_hourly_forecast(
        carbon, value_key="carbon_gco2_kwh", metric="carbon_intensity", now=now
    )
    _write_rows(client, carbon_forecast.rows)
    carbon_backtest = backtest_hourly(carbon, value_key="carbon_gco2_kwh")

    renewable = _fetch_renewable(client, since)
    renewable_forecast = build_hourly_forecast(
        renewable, value_key="value", metric="renewable_share", now=now
    )
    _write_rows(client, renewable_forecast.rows)
    renewable_backtest = backtest_hourly(renewable, value_key="value")

    return {
        "model": MODEL_NAME,
        "carbon_intensity": _summarize(
            "carbon_intensity", carbon_forecast, carbon_backtest
        ),
        "renewable_share": _summarize(
            "renewable_share", renewable_forecast, renewable_backtest
        ),
    }
