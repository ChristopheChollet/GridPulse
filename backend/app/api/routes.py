from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, Query

from app.db.client import get_supabase

router = APIRouter(prefix="/api/v1", tags=["data"])


def _since(hours: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()


@router.get("/mix")
def get_mix(hours: int = Query(default=24, ge=1, le=168)) -> dict[str, Any]:
    client = get_supabase()
    response = (
        client.table("grid_mix_points")
        .select("*")
        .gte("recorded_at", _since(hours))
        .order("recorded_at", desc=False)
        .execute()
    )
    return {"points": response.data or [], "hours": hours}


@router.get("/carbon")
def get_carbon(hours: int = Query(default=24, ge=1, le=168)) -> dict[str, Any]:
    client = get_supabase()
    response = (
        client.table("carbon_intensity_points")
        .select("*")
        .gte("recorded_at", _since(hours))
        .order("recorded_at", desc=False)
        .execute()
    )
    return {"points": response.data or [], "hours": hours}


@router.get("/forecasts")
def get_forecasts(metric: str = Query(default="carbon_intensity")) -> dict[str, Any]:
    client = get_supabase()
    response = (
        client.table("forecasts")
        .select("*")
        .eq("metric", metric)
        .eq("model", "moving_avg_24h")
        .order("forecast_for", desc=False)
        .execute()
    )
    return {"forecasts": response.data or [], "metric": metric}


@router.get("/summary")
def get_summary() -> dict[str, Any]:
    client = get_supabase()

    mix_resp = (
        client.table("grid_mix_points")
        .select("*")
        .order("recorded_at", desc=True)
        .limit(1)
        .execute()
    )
    carbon_resp = (
        client.table("carbon_intensity_points")
        .select("*")
        .order("recorded_at", desc=True)
        .limit(1)
        .execute()
    )

    latest_mix = mix_resp.data[0] if mix_resp.data else None
    latest_carbon = carbon_resp.data[0] if carbon_resp.data else None

    renewable_pct = None
    if latest_mix:
        renewable_pct = round(
            float(latest_mix["wind_pct"])
            + float(latest_mix["solar_pct"])
            + float(latest_mix["hydro_pct"]),
            1,
        )

    return {
        "carbon_gco2_kwh": latest_carbon["carbon_gco2_kwh"] if latest_carbon else None,
        "carbon_recorded_at": latest_carbon["recorded_at"] if latest_carbon else None,
        "renewable_pct": renewable_pct,
        "consumption_mw": latest_mix["consumption_mw"] if latest_mix else None,
        "mix_recorded_at": latest_mix["recorded_at"] if latest_mix else None,
        "mix_breakdown": latest_mix,
    }
