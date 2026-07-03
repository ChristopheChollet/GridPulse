from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as data_router
from app.config import get_settings
from app.forecast.moving_avg import run_carbon_forecast
from app.ingest.runner import run_ingestion

app = FastAPI(
    title="GridPulse API",
    description="Ingestion RTE + Electricity Maps, forecasts and data API",
    version="0.1.0",
)

settings = get_settings()
origins = [o.strip() for o in str(settings["cors_origins"]).split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(data_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "gridpulse-api"}


@app.post("/ingest/run")
async def ingest_run(x_ingest_secret: str | None = Header(default=None)) -> dict:
    secret = settings.get("ingest_secret")
    if secret and x_ingest_secret != secret:
        raise HTTPException(status_code=401, detail="Invalid ingest secret")
    result = await run_ingestion()
    forecast = {}
    if result.carbon_upserted > 0 or result.mix_upserted > 0:
        try:
            forecast = run_carbon_forecast()
        except Exception as exc:  # noqa: BLE001
            result.errors.append(f"forecast: {exc}")
    return {"ingest": result.to_dict(), "forecast": forecast}


@app.post("/forecast/run")
def forecast_run(x_ingest_secret: str | None = Header(default=None)) -> dict:
    secret = settings.get("ingest_secret")
    if secret and x_ingest_secret != secret:
        raise HTTPException(status_code=401, detail="Invalid ingest secret")
    return run_carbon_forecast()
