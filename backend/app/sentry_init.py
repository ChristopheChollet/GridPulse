import os

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration


def init_sentry() -> None:
    dsn = os.getenv("SENTRY_DSN", "").strip()
    if not dsn:
        return

    sentry_sdk.init(
        dsn=dsn,
        integrations=[FastApiIntegration()],
        environment=os.getenv("SENTRY_ENVIRONMENT", "production"),
        traces_sample_rate=0.1,
        enable_tracing=True,
    )
