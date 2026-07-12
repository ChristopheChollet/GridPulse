from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sentry_sdk

from app.api.routes import router as data_router
from app.config import get_settings
from app.forecast.ml_hourly import run_ml_carbon_forecast
from app.forecast.moving_avg import run_carbon_forecast
from app.ingest.runner import run_ingestion
from app.sentry_init import init_sentry

init_sentry()

app = FastAPI(
    title="GridPulse API",
    description="Ingestion RTE + Electricity Maps, forecasts and data API",
    version="0.1.0",
)

settings = get_settings()
origins = [o.strip() for o in str(settings["cors_origins"]).split(",") if o.strip()]


def _check_ingest_secret(provided: str | None) -> None:
    secret = (get_settings().get("ingest_secret") or "").strip()
    if not secret:
        return
    if (provided or "").strip() != secret:
        raise HTTPException(status_code=401, detail="Invalid ingest secret")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(data_router)


@app.get("/health")
def health() -> dict[str, str | bool]:
    s = get_settings()
    return {
        "status": "ok",
        "service": "gridpulse-api",
        "supabase_configured": bool(s.get("supabase_url") and s.get("supabase_service_role_key")),
        "electricity_maps_configured": bool(s.get("electricity_maps_token")),
    }


@app.post("/ingest/run")
async def ingest_run(x_ingest_secret: str | None = Header(default=None, alias="X-Ingest-Secret")) -> dict:
    _check_ingest_secret(x_ingest_secret)
    result = await run_ingestion()
    forecast: dict = {}
    if result.carbon_upserted > 0 or result.mix_upserted > 0:
        try:
            forecast = run_carbon_forecast()
        except Exception as exc:  # noqa: BLE001
            result.errors.append(f"forecast: {exc}")
            sentry_sdk.capture_exception(exc)
        try:
            forecast["ml"] = run_ml_carbon_forecast()
        except Exception as exc:  # noqa: BLE001
            result.errors.append(f"ml_forecast: {exc}")
            sentry_sdk.capture_exception(exc)
    return {"ingest": result.to_dict(), "forecast": forecast}


@app.post("/forecast/run")
def forecast_run(x_ingest_secret: str | None = Header(default=None, alias="X-Ingest-Secret")) -> dict:
    _check_ingest_secret(x_ingest_secret)
    baseline = run_carbon_forecast()
    ml: dict = {}
    try:
        ml = run_ml_carbon_forecast()
    except Exception as exc:  # noqa: BLE001
        ml = {"error": str(exc)}
        sentry_sdk.capture_exception(exc)
    # Additive: keep baseline keys at top level, ML nested under "ml".
    return {**baseline, "ml": ml}
