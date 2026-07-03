"""Find low-carbon / high-renewable time windows."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def _parse_ts(value: str) -> datetime:
    dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def _hour_key(value: str) -> str:
    dt = _parse_ts(value).replace(minute=0, second=0, microsecond=0)
    return dt.isoformat()


def _score(carbon_gco2_kwh: float, renewable_pct: float) -> float:
    carbon_component = max(0.0, 100.0 - carbon_gco2_kwh / 3.0)
    return round(0.45 * renewable_pct + 0.55 * carbon_component, 2)


def compute_green_windows(
    mix_points: list[dict[str, Any]],
    carbon_points: list[dict[str, Any]],
    window_hours: int = 6,
) -> dict[str, Any]:
    mix_by_hour: dict[str, dict[str, Any]] = {}
    for row in mix_points:
        mix_by_hour[_hour_key(row["recorded_at"])] = row

    slots: list[dict[str, Any]] = []
    for carbon in carbon_points:
        hk = _hour_key(carbon["recorded_at"])
        mix = mix_by_hour.get(hk)
        renewable = 0.0
        if mix:
            renewable = (
                float(mix["wind_pct"])
                + float(mix["solar_pct"])
                + float(mix["hydro_pct"])
            )
        carbon_val = float(carbon["carbon_gco2_kwh"])
        slots.append(
            {
                "hour": hk,
                "carbon_gco2_kwh": carbon_val,
                "renewable_pct": round(renewable, 1),
                "score": _score(carbon_val, renewable),
            }
        )

    slots.sort(key=lambda s: s["hour"])

    best_window = None
    best_avg = -1.0
    if len(slots) >= window_hours:
        for i in range(len(slots) - window_hours + 1):
            window = slots[i : i + window_hours]
            avg_score = sum(s["score"] for s in window) / window_hours
            if avg_score > best_avg:
                best_avg = avg_score
                best_window = {
                    "start_at": window[0]["hour"],
                    "end_at": window[-1]["hour"],
                    "avg_carbon_gco2_kwh": round(
                        sum(s["carbon_gco2_kwh"] for s in window) / window_hours,
                        2,
                    ),
                    "avg_renewable_pct": round(
                        sum(s["renewable_pct"] for s in window) / window_hours,
                        1,
                    ),
                    "score": round(avg_score, 2),
                }

    return {
        "window_hours": window_hours,
        "best_window": best_window,
        "slots": slots[-48:],
        "hint": (
            "Fenêtre où le réseau est le plus « vert » sur la période analysée — "
            "indicateur pédagogique, pas recommandation opérationnelle."
        ),
    }
