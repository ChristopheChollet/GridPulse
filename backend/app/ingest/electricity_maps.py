"""Electricity Maps carbon intensity ingestion."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

import httpx

API_BASE = "https://api.electricitymap.org/v3"


@dataclass
class CarbonIntensityPoint:
    recorded_at: datetime
    zone: str
    carbon_gco2_kwh: float
    fossil_fuel_pct: float | None

    def to_row(self) -> dict[str, Any]:
        return {
            "recorded_at": self.recorded_at.isoformat(),
            "zone": self.zone,
            "carbon_gco2_kwh": self.carbon_gco2_kwh,
            "fossil_fuel_pct": self.fossil_fuel_pct,
            "source": "electricity_maps",
        }


def _parse_datetime(value: str) -> datetime:
    dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def parse_carbon_history(payload: dict[str, Any], zone: str = "FR") -> list[CarbonIntensityPoint]:
    points: list[CarbonIntensityPoint] = []
    for entry in payload.get("history", []):
        intensity = entry.get("carbonIntensity")
        if intensity is None:
            continue
        fossil = entry.get("fossilFuelPercentage")
        points.append(
            CarbonIntensityPoint(
                recorded_at=_parse_datetime(entry["datetime"]),
                zone=zone,
                carbon_gco2_kwh=float(intensity),
                fossil_fuel_pct=float(fossil) if fossil is not None else None,
            )
        )
    return points


async def fetch_carbon_history(token: str, zone: str = "FR", hours: int = 24) -> list[CarbonIntensityPoint]:
    url = f"{API_BASE}/carbon-intensity/history"
    headers = {"auth-token": token}
    params = {"zone": zone, "hours": hours}
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url, headers=headers, params=params)
        response.raise_for_status()
        payload = response.json()
    return parse_carbon_history(payload, zone=zone)
