# GridPulse deployment

## Vercel (frontend)

1. Import repo GitHub
2. Set **Root Directory** to `frontend`
3. Environment variables:
   - `NEXT_PUBLIC_API_URL` = your Railway/Render API URL

## Railway (backend)

1. New project → **Deploy from GitHub** → repo `GridPulse`
2. **Ne change pas** le Root Directory (laisse vide / repo root) — `railway.toml` pointe vers `backend/Dockerfile`
3. Clique sur le service **GridPulse** → onglet **Variables** → ajoute :
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ELECTRICITY_MAPS_TOKEN`
   - `INGEST_SECRET`
   - `CORS_ORIGINS` = tes URLs Vercel séparées par des virgules (ex. `https://grid-pulse-xxx.vercel.app,https://flex-slot.vercel.app`)
4. Onglet **Settings** → **Networking** → **Generate Domain**
5. Vérifie : `curl https://TON-DOMAINE.up.railway.app/health`

Si le build fail encore : onglet **Deployments** → clic sur le deploy rouge → lire les **Build Logs**.

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
