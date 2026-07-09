"""Carbon threshold alerts — webhook on crossing above configured gCO₂/kWh."""

from __future__ import annotations

from typing import Any

import httpx

from app.config import get_settings
from app.db.client import get_supabase
from app.services.webhook_format import build_webhook_body, format_gridpulse_carbon_alert_text

DEFAULT_THRESHOLD_GCO2 = 200.0


def should_fire_alert(
    latest: float,
    previous: float | None,
    threshold: float,
) -> bool:
    """Fire only when carbon crosses above threshold (avoids hourly spam)."""
    if latest <= threshold:
        return False
    if previous is None:
        return True
    return previous <= threshold


def _fetch_latest_carbon_rows(limit: int = 2) -> list[dict[str, Any]]:
    client = get_supabase()
    res = (
        client.table("carbon_intensity_points")
        .select("recorded_at,zone,carbon_gco2_kwh")
        .eq("zone", "FR")
        .order("recorded_at", desc=True)
        .limit(limit)
        .execute()
    )
    return res.data or []


def _persist_carbon_alert(payload: dict[str, Any], text: str) -> None:
    try:
        client = get_supabase()
        title = (
            f"Seuil carbone dépassé — {payload['carbon_gco2_kwh']:.0f} gCO₂/kWh"
        )
        client.table("meridian_alerts").insert(
            {
                "source": "gridpulse",
                "event_type": "carbon_threshold_exceeded",
                "title": title,
                "message": text,
                "payload": payload,
                "zone": payload.get("zone"),
                "carbon_gco2_kwh": payload.get("carbon_gco2_kwh"),
                "threshold_gco2_kwh": payload.get("threshold_gco2_kwh"),
            }
        ).execute()
    except Exception as exc:
        print(f"[gridpulse] persist meridian alert failed: {exc}")


async def post_webhook(url: str, text: str, raw: dict[str, Any]) -> None:
    body = build_webhook_body(url, text, raw)
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(url, json=body)
        resp.raise_for_status()


async def evaluate_carbon_alert() -> dict[str, Any] | None:
    settings = get_settings()
    webhook_url = (settings.get("alert_webhook_url") or "").strip()

    enabled = str(settings.get("alert_webhook_enabled") or "true").lower()
    if enabled in ("0", "false", "no"):
        return None

    try:
        threshold = float(
            settings.get("carbon_alert_threshold_gco2") or DEFAULT_THRESHOLD_GCO2,
        )
    except ValueError:
        threshold = DEFAULT_THRESHOLD_GCO2

    rows = _fetch_latest_carbon_rows(2)
    if not rows:
        return {"fired": False, "reason": "no_carbon_rows"}

    latest_row = rows[0]
    latest = float(latest_row["carbon_gco2_kwh"])
    previous = float(rows[1]["carbon_gco2_kwh"]) if len(rows) > 1 else None

    if not should_fire_alert(latest, previous, threshold):
        return {
            "fired": False,
            "carbon_gco2_kwh": latest,
            "threshold_gco2_kwh": threshold,
            "previous_gco2_kwh": previous,
        }

    payload = {
        "event": "carbon_threshold_exceeded",
        "zone": latest_row.get("zone", "FR"),
        "carbon_gco2_kwh": latest,
        "threshold_gco2_kwh": threshold,
        "recorded_at": latest_row.get("recorded_at"),
        "previous_gco2_kwh": previous,
        "service": "gridpulse",
    }

    text = format_gridpulse_carbon_alert_text(payload)
    _persist_carbon_alert(payload, text)

    if webhook_url:
        try:
            await post_webhook(webhook_url, text, payload)
        except Exception as exc:
            print(f"[gridpulse] alert webhook error: {exc}")

    return {"fired": True, **payload}
