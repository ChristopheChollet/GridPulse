from app.services.green_windows import compute_green_windows


def test_compute_green_windows_finds_best_six_hour_block():
    mix = [
        {
            "recorded_at": f"2026-07-03T{h:02d}:00:00+00:00",
            "wind_pct": 20,
            "solar_pct": 30 if h >= 10 else 5,
            "hydro_pct": 10,
        }
        for h in range(8, 20)
    ]
    carbon = [
        {
            "recorded_at": f"2026-07-03T{h:02d}:00:00+00:00",
            "carbon_gco2_kwh": 20 if h >= 10 else 80,
        }
        for h in range(8, 20)
    ]
    result = compute_green_windows(mix, carbon, window_hours=6)
    assert result["best_window"] is not None
    assert result["best_window"]["avg_carbon_gco2_kwh"] <= 30
