"""Orchestrates ingestion into Supabase."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.config import get_settings
from app.db.client import get_supabase
from app.ingest import electricity_maps, rte
from app.services.carbon_alerts import evaluate_carbon_alert


def _log_ingest_run(result: "IngestResult") -> None:
    try:
        client = get_supabase()
        client.table("ingest_runs").insert(
            {
                "mix_upserted": result.mix_upserted,
                "carbon_upserted": result.carbon_upserted,
                "errors": result.errors,
                "success": len(result.errors) == 0,
            }
        ).execute()
    except Exception:  # noqa: BLE001
        pass  # table may not exist yet on fresh installs


@dataclass
class IngestResult:
    mix_upserted: int
    carbon_upserted: int
    errors: list[str]
    alert: dict[str, Any] | None = None

    def to_dict(self) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "mix_upserted": self.mix_upserted,
            "carbon_upserted": self.carbon_upserted,
            "errors": self.errors,
        }
        if self.alert is not None:
            payload["alert"] = self.alert
        return payload


def _upsert_rows(table: str, rows: list[dict[str, Any]], on_conflict: str) -> int:
    if not rows:
        return 0
    client = get_supabase()
    client.table(table).upsert(rows, on_conflict=on_conflict).execute()
    return len(rows)


async def run_ingestion() -> IngestResult:
    settings = get_settings()
    errors: list[str] = []
    mix_count = 0
    carbon_count = 0

    try:
        mix_points = await rte.fetch_recent_mix(limit=48)
        mix_rows = [p.to_row() for p in mix_points]
        mix_count = _upsert_rows("grid_mix_points", mix_rows, "recorded_at,source")
    except Exception as exc:  # noqa: BLE001
        errors.append(f"rte: {exc}")

    token = settings.get("electricity_maps_token")
    if token:
        try:
            carbon_points = await electricity_maps.fetch_carbon_history(str(token))
            carbon_rows = [p.to_row() for p in carbon_points]
            carbon_count = _upsert_rows(
                "carbon_intensity_points",
                carbon_rows,
                "recorded_at,zone,source",
            )
        except Exception as exc:  # noqa: BLE001
            errors.append(f"electricity_maps: {exc}")
    else:
        errors.append("electricity_maps: ELECTRICITY_MAPS_TOKEN not set")

    result = IngestResult(
        mix_upserted=mix_count,
        carbon_upserted=carbon_count,
        errors=errors,
    )

    if carbon_count > 0:
        try:
            result.alert = await evaluate_carbon_alert()
        except Exception as exc:  # noqa: BLE001
            errors.append(f"alert: {exc}")

    _log_ingest_run(result)
    return result
