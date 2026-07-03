import os
from pathlib import Path

from dotenv import load_dotenv

# Always load backend/.env regardless of cwd (uvicorn launch directory)
_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_ENV_PATH, override=True)


def get_settings() -> dict[str, str | None]:
    return {
        "supabase_url": os.getenv("SUPABASE_URL"),
        "supabase_service_role_key": os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        "electricity_maps_token": os.getenv("ELECTRICITY_MAPS_TOKEN"),
        "rte_api_key": os.getenv("RTE_API_KEY"),
        "ingest_secret": os.getenv("INGEST_SECRET", "dev-secret"),
        "cors_origins": os.getenv("CORS_ORIGINS", "http://localhost:3000"),
    }
