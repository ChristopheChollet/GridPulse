import json
from pathlib import Path

from app.ingest.electricity_maps import parse_carbon_history
from app.ingest.rte import parse_odre_record

FIXTURES = Path(__file__).parent / "fixtures"


def test_parse_odre_record():
    payload = json.loads((FIXTURES / "rte_odre_sample.json").read_text())
    point = parse_odre_record(payload["results"][0])
    assert point.nuclear_pct > 0
    assert point.wind_pct > 0
    assert point.consumption_mw == 73500
    row = point.to_row()
    assert row["source"] == "rte"


def test_parse_carbon_history():
    payload = json.loads((FIXTURES / "electricity_maps_sample.json").read_text())
    points = parse_carbon_history(payload)
    assert len(points) == 2
    assert points[0].carbon_gco2_kwh == 42.5
    assert points[0].zone == "FR"
