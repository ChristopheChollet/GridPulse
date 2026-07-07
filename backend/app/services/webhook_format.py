"""Format webhook payloads for Slack, Discord, or generic URLs."""

from __future__ import annotations

from typing import Any
from urllib.parse import urlparse


def build_webhook_body(
    webhook_url: str,
    text: str,
    raw: dict[str, Any],
) -> dict[str, Any]:
    try:
        host = urlparse(webhook_url).hostname or ""
    except Exception:  # noqa: BLE001
        return raw

    if "slack.com" in host:
        return {"text": text}
    if "discord.com" in host:
        return {"content": text}
    return raw


def format_gridpulse_carbon_alert_text(payload: dict[str, Any]) -> str:
    latest = payload.get("carbon_gco2_kwh")
    threshold = payload.get("threshold_gco2_kwh")
    previous = payload.get("previous_gco2_kwh")
    zone = payload.get("zone", "FR")
    recorded_at = payload.get("recorded_at", "—")

    lines = [
        f"*GridPulse* — seuil carbone dépassé ({zone})",
        f"Actuel : *{latest}* gCO₂/kWh (seuil {threshold})",
    ]
    if previous is not None:
        lines.append(f"Avant : {previous} gCO₂/kWh")
    lines.append(f"Mesure : {recorded_at}")
    return "\n".join(lines)
