from app.services.webhook_format import build_webhook_body


def test_slack_webhook_body():
    body = build_webhook_body(
        "https://hooks.slack.com/services/T/B/x",
        "hello",
        {"event": "test"},
    )
    assert body == {"text": "hello"}


def test_discord_webhook_body():
    body = build_webhook_body(
        "https://discord.com/api/webhooks/1/abc",
        "hello",
        {"event": "test"},
    )
    assert body == {"content": "hello"}
