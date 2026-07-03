"""Simple moving-average forecast for carbon intensity."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from app.db.client import get_supabase

MODEL_NAME = "moving_avg_24h"
FORECAST_HOURS = 12
WINDOW_HOURS = 24


def _parse_ts(value: str) -> datetime:
    dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def compute_moving_average(values: list[float]) -> float:
    if not values:
        return 0.0
    return round(sum(values) / len(values), 2)


def run_carbon_forecast() -> dict[str, Any]:
    client = get_supabase()
    since = (datetime.now(timezone.utc) - timedelta(hours=WINDOW_HOURS)).isoformat()
    response = (
        client.table("carbon_intensity_points")
        .select("recorded_at,carbon_gco2_kwh")
        .gte("recorded_at", since)
        .order("recorded_at", desc=False)
        .execute()
    )
    rows = response.data or []
    values = [float(r["carbon_gco2_kwh"]) for r in rows]
    avg = compute_moving_average(values)

    now = datetime.now(timezone.utc)
    forecast_rows: list[dict[str, Any]] = []
    for hour in range(1, FORECAST_HOURS + 1):
        forecast_for = now + timedelta(hours=hour)
        forecast_rows.append(
            {
                "metric": "carbon_intensity",
                "forecast_for": forecast_for.isoformat(),
                "value": avg,
                "model": MODEL_NAME,
            }
        )

    if forecast_rows:
        client.table("forecasts").upsert(
            forecast_rows,
            on_conflict="metric,forecast_for,model",
        ).execute()

    renewable_avg = _forecast_renewable_share(client, since, now)
    return {
        "model": MODEL_NAME,
        "carbon_forecast_gco2_kwh": avg,
        "renewable_share_forecast_pct": renewable_avg,
        "points_written": len(forecast_rows) + (12 if renewable_avg is not None else 0),
    }


def _forecast_renewable_share(client, since: str, now: datetime) -> float | None:
    response = (
        client.table("grid_mix_points")
        .select("recorded_at,wind_pct,solar_pct,hydro_pct")
        .gte("recorded_at", since)
        .order("recorded_at", desc=False)
        .execute()
    )
    rows = response.data or []
    if not rows:
        return None

    shares = [
        float(r["wind_pct"]) + float(r["solar_pct"]) + float(r["hydro_pct"])
        for r in rows
    ]
    avg = compute_moving_average(shares)

    forecast_rows = []
    for hour in range(1, FORECAST_HOURS + 1):
        forecast_for = now + timedelta(hours=hour)
        forecast_rows.append(
            {
                "metric": "renewable_share",
                "forecast_for": forecast_for.isoformat(),
                "value": avg,
                "model": MODEL_NAME,
            }
        )
    client.table("forecasts").upsert(
        forecast_rows,
        on_conflict="metric,forecast_for,model",
    ).execute()
    return avg
