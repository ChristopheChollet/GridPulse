from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Query

from app.db.client import get_supabase
from app.services.green_windows import compute_green_windows

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


@router.get("/green-windows")
def get_green_windows(
    hours: int = Query(default=24, ge=6, le=168),
    window: int = Query(default=6, ge=1, le=24),
) -> dict[str, Any]:
    client = get_supabase()
    since = _since(hours)
    mix_resp = (
        client.table("grid_mix_points")
        .select("*")
        .gte("recorded_at", since)
        .order("recorded_at", desc=False)
        .execute()
    )
    carbon_resp = (
        client.table("carbon_intensity_points")
        .select("*")
        .gte("recorded_at", since)
        .order("recorded_at", desc=False)
        .execute()
    )
    return compute_green_windows(
        mix_resp.data or [],
        carbon_resp.data or [],
        window_hours=window,
    )


@router.get("/status")
def get_status() -> dict[str, Any]:
    client = get_supabase()

    def _count(table: str) -> int:
        resp = client.table(table).select("id", count="exact").limit(1).execute()
        return resp.count or 0

    mix_latest = (
        client.table("grid_mix_points")
        .select("recorded_at")
        .order("recorded_at", desc=True)
        .limit(1)
        .execute()
    )
    carbon_latest = (
        client.table("carbon_intensity_points")
        .select("recorded_at")
        .order("recorded_at", desc=True)
        .limit(1)
        .execute()
    )
    run = None
    try:
        last_run = (
            client.table("ingest_runs")
            .select("*")
            .order("run_at", desc=True)
            .limit(1)
            .execute()
        )
        run = last_run.data[0] if last_run.data else None
    except Exception:  # noqa: BLE001
        pass

    return {
        "counts": {
            "grid_mix_points": _count("grid_mix_points"),
            "carbon_intensity_points": _count("carbon_intensity_points"),
            "forecasts": _count("forecasts"),
        },
        "latest_mix_at": mix_latest.data[0]["recorded_at"] if mix_latest.data else None,
        "latest_carbon_at": carbon_latest.data[0]["recorded_at"]
        if carbon_latest.data
        else None,
        "last_ingest": run,
    }
