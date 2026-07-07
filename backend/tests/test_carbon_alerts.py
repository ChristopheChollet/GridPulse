from app.services.carbon_alerts import should_fire_alert


def test_should_fire_on_first_reading_above_threshold():
    assert should_fire_alert(210.0, None, 200.0) is True


def test_should_not_fire_when_still_above_threshold():
    assert should_fire_alert(210.0, 205.0, 200.0) is False


def test_should_fire_on_crossing_up():
    assert should_fire_alert(205.0, 195.0, 200.0) is True


def test_should_not_fire_below_threshold():
    assert should_fire_alert(150.0, 180.0, 200.0) is False
