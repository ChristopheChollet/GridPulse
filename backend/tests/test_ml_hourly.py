"""Tests for the ML hourly forecast — pure functions, no database required."""

from __future__ import annotations

import math
import random
from datetime import datetime, timedelta, timezone

from app.forecast.ml_hourly import (
    MODEL_NAME,
    backtest_hourly,
    build_hourly_forecast,
)


def _daily_cycle_history(days: int = 5, seed: int = 42) -> tuple[list[dict], datetime]:
    """Synthetic carbon series with a strong 24 h cycle + small noise.

    Min around 03:00 (nuclear/wind night), peak around 15:00 — deterministic.
    """
    rnd = random.Random(seed)
    end = datetime(2026, 7, 6, 0, 0, tzinfo=timezone.utc)
    start = end - timedelta(hours=days * 24)
    rows: list[dict] = []
    for i in range(days * 24):
        dt = start + timedelta(hours=i)
        base = 220.0 + 110.0 * math.sin(2.0 * math.pi * (dt.hour - 9) / 24.0)
        rows.append(
            {
                "recorded_at": dt.isoformat(),
                "carbon_gco2_kwh": round(base + rnd.uniform(-6.0, 6.0), 2),
            }
        )
    return rows, end


def test_forecast_has_12_rows_and_is_not_flat():
    history, now = _daily_cycle_history()
    fc = build_hourly_forecast(
        history, value_key="carbon_gco2_kwh", metric="carbon_intensity", now=now
    )

    assert fc.model == MODEL_NAME
    assert fc.fallback is False
    assert len(fc.rows) == 12

    values = [r["value"] for r in fc.rows]
    # A flat baseline would have spread ~0; the ML model must follow the cycle.
    assert max(values) - min(values) > 30
    # Rows are correctly labelled.
    assert all(r["model"] == MODEL_NAME for r in fc.rows)
    assert all(r["metric"] == "carbon_intensity" for r in fc.rows)


def test_ml_beats_flat_baseline_on_backtest():
    history, _ = _daily_cycle_history()
    result = backtest_hourly(history, value_key="carbon_gco2_kwh")

    assert result is not None
    assert result.n_test == 12
    # On a strongly cyclical series, the hour-of-day model must beat a flat mean.
    assert result.ml_mae < result.baseline_mae
    assert result.improvement_pct > 0


def test_fallback_to_mean_when_too_few_points():
    history = [
        {
            "recorded_at": datetime(2026, 7, 6, h, tzinfo=timezone.utc).isoformat(),
            "carbon_gco2_kwh": 100.0 + h,
        }
        for h in range(5)  # < MIN_POINTS
    ]
    now = datetime(2026, 7, 6, 5, tzinfo=timezone.utc)
    fc = build_hourly_forecast(
        history, value_key="carbon_gco2_kwh", metric="carbon_intensity", now=now
    )

    assert fc.fallback is True
    assert len(fc.rows) == 12
    # Flat fallback: every forecast equals the historical mean.
    values = {r["value"] for r in fc.rows}
    assert len(values) == 1
    assert abs(next(iter(values)) - fc.mean_value) < 1e-9


def test_backtest_returns_none_when_sparse():
    history = [
        {
            "recorded_at": datetime(2026, 7, 6, h, tzinfo=timezone.utc).isoformat(),
            "carbon_gco2_kwh": 100.0,
        }
        for h in range(6)
    ]
    assert backtest_hourly(history, value_key="carbon_gco2_kwh") is None
