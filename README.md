# GridPulse

Tableau de bord **data** sur le mix électrique français et l'**intensité carbone** : ingestion automatique (RTE + Electricity Maps), historique, KPIs et prévision simple.

Complément Web2 de [GreenOps](https://github.com/ChristopheChollet/GreenOps) — même niche énergie/climat, sans blockchain.

> **Phrase entretien :** *« Je sais ship un produit SaaS métier **et** un pipeline data énergie avec visualisation et baseline de prévision. »*

## Architecture

```
RTE (ODRE open data) ──┐
                       ├── FastAPI (ingestion + forecast) ── Supabase ── Next.js dashboard
Electricity Maps ──────┘
```

| Couche | Stack |
|--------|--------|
| Frontend | Next.js 16, TypeScript, Tailwind 4, recharts |
| Backend | Python 3.12, FastAPI, httpx, pandas, scikit-learn |
| DB | Supabase PostgreSQL + RLS (lecture publique) |
| Orchestration | GitHub Actions (cron horaire) |

## Démarrage local

### 1. Supabase

1. Créer un projet Supabase dédié GridPulse
2. Exécuter [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql) dans le SQL Editor

### 2. Variables d'environnement

```bash
cp .env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Renseigner `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ELECTRICITY_MAPS_TOKEN`, `INGEST_SECRET`.

### 3. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Première ingestion

```bash
curl -X POST http://localhost:8000/ingest/run \
  -H "X-Ingest-Secret: dev-secret"
```

Ouvrir [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

## Docker Compose

```bash
docker compose up
```

## API

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `POST /ingest/run` | Ingestion RTE + Electricity Maps (header `X-Ingest-Secret`) |
| `POST /forecast/run` | Recalcule les prévisions |
| `GET /api/v1/summary` | KPIs agrégés |
| `GET /api/v1/mix?hours=24` | Points mix RTE |
| `GET /api/v1/carbon?hours=24` | Intensité carbone |
| `GET /api/v1/forecasts?metric=carbon_intensity` | Prévisions |

## Déploiement

### Frontend (Vercel)

- Root directory : `frontend`
- Variable : `NEXT_PUBLIC_API_URL` → URL Railway/Render

### Backend (Railway / Render)

- Dockerfile : `backend/Dockerfile`
- Variables : voir [`.env.example`](.env.example)

### Ingestion planifiée

Configurer les secrets GitHub :

- `GRIDPULSE_API_URL` — URL publique de l'API
- `INGEST_SECRET` — même valeur que sur le backend

## Limites (assumées)

- Démo portfolio, **pas** un outil opérationnel RTE
- Prévision = **moyenne mobile 24 h**, pas modèle météo/production
- Données RTE via miroir ODRE (open data)

## Tests

```bash
cd backend && pytest
```

## Licence

MIT — projet portfolio Christophe Chollet
