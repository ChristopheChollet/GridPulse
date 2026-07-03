"""RTE Eco2Mix ingestion via ODRE open data mirror."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

import httpx

ODRE_DATASET_URL = (
    "https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets/"
    "eco2mix-national-tr/records"
)


@dataclass
class GridMixPoint:
    recorded_at: datetime
    nuclear_pct: float
    wind_pct: float
    solar_pct: float
    hydro_pct: float
    gas_pct: float
    coal_pct: float
    other_pct: float
    consumption_mw: float | None

    def to_row(self) -> dict[str, Any]:
        return {
            "recorded_at": self.recorded_at.isoformat(),
            "nuclear_pct": self.nuclear_pct,
            "wind_pct": self.wind_pct,
            "solar_pct": self.solar_pct,
            "hydro_pct": self.hydro_pct,
            "gas_pct": self.gas_pct,
            "coal_pct": self.coal_pct,
            "other_pct": self.other_pct,
            "consumption_mw": self.consumption_mw,
            "source": "rte",
        }


def _pct(value: float | None, total: float) -> float:
    if value is None or total <= 0:
        return 0.0
    return round((value / total) * 100, 2)


def parse_odre_record(record: dict[str, Any]) -> GridMixPoint:
    fields = record.get("record", record)
    if "fields" in fields:
        fields = fields["fields"]

    raw_time = fields.get("date_heure") or fields.get("date")
    if not raw_time:
        raise ValueError("Missing date_heure in RTE record")

    recorded_at = datetime.fromisoformat(raw_time.replace("Z", "+00:00"))
    if recorded_at.tzinfo is None:
        recorded_at = recorded_at.replace(tzinfo=timezone.utc)

    nuc = float(fields.get("nucleaire") or 0)
    wind = float(fields.get("eolien") or 0)
    solar = float(fields.get("solaire") or 0)
    hydro = float(fields.get("hydraulique") or 0)
    gas = float(fields.get("gaz") or 0)
    coal = float(fields.get("charbon") or 0)
    fioul = float(fields.get("fioul") or 0)
    bio = float(fields.get("bioenergies") or 0)
    other = float(fields.get("autres") or 0)
    total = nuc + wind + solar + hydro + gas + coal + fioul + bio + other

    consumption = fields.get("consommation")
    consumption_mw = float(consumption) if consumption is not None else None

    return GridMixPoint(
        recorded_at=recorded_at,
        nuclear_pct=_pct(nuc, total),
        wind_pct=_pct(wind, total),
        solar_pct=_pct(solar, total),
        hydro_pct=_pct(hydro, total),
        gas_pct=_pct(gas + fioul, total),
        coal_pct=_pct(coal, total),
        other_pct=_pct(bio + other, total),
        consumption_mw=consumption_mw,
    )


async def fetch_recent_mix(limit: int = 48) -> list[GridMixPoint]:
    params = {
        "limit": limit,
        "order_by": "date_heure desc",
        "timezone": "Europe/Paris",
        "where": "nucleaire is not null",
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(ODRE_DATASET_URL, params=params)
        response.raise_for_status()
        payload = response.json()

    results: list[GridMixPoint] = []
    for item in payload.get("results", []):
        try:
            results.append(parse_odre_record(item))
        except (ValueError, TypeError):
            continue
    return results
