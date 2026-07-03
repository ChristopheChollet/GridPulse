# GridPulse deployment

## Vercel (frontend)

1. Import repo GitHub
2. Set **Root Directory** to `frontend`
3. Environment variables:
   - `NEXT_PUBLIC_API_URL` = your Railway/Render API URL

## Railway (backend)

1. New project from repo
2. Set root to `backend` or use `railway.toml`
3. Environment variables from `.env.example`

## GitHub Actions (hourly ingest)

Repository secrets:

- `GRIDPULSE_API_URL`
- `INGEST_SECRET`

## Supabase

Run `supabase/migrations/001_initial.sql` once on project creation.

## Screenshots for portfolio

After deploy, capture:

1. Landing page
2. Dashboard (KPIs + charts)
3. Forecast page

Save as WebP in `docs/screenshots/` and copy to portfolio `public/screenshots/gridpulse/`.
