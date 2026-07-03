# GridPulse — guide de setup (≈ 20 min)

Checklist dans l’ordre. Coche au fur et à mesure.

---

## 1. Supabase (projet dédié)

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Nom : `GridPulse` (région proche de toi, mot de passe DB noté)
3. Attendre que le projet soit **Active**
4. **SQL Editor** → **New query** → coller tout le contenu de  
   `supabase/migrations/001_initial.sql` → **Run**
5. Vérifier : **Table Editor** → tables `grid_mix_points`, `carbon_intensity_points`, `forecasts`

### Récupérer les clés

**Project Settings** → **API** :

| Variable | Où la copier |
|----------|----------------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | anon public → `frontend/.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role secret → `backend/.env` **uniquement** |

> Ne mets jamais la `service_role` dans le frontend.

---

## 2. Electricity Maps (token gratuit)

1. [electricitymaps.com](https://www.electricitymaps.com) → compte / API access
2. Demander un token API (tier gratuit / trial)
3. Copier dans `backend/.env` :

```env
ELECTRICITY_MAPS_TOKEN=ton_token_ici
```

`RTE_API_KEY` peut rester **vide** — l’ingestion RTE passe par ODRE (open data, sans clé).

---

## 3. Fichiers `.env` (déjà créés)

Remplis les champs vides dans :

- `backend/.env`
- `frontend/.env.local` (URL + anon key suffisent pour le front ; le front appelle surtout l’API)

**Redémarre** backend et frontend après modification des `.env`.

---

## 4. Première ingestion (local)

Backend doit tourner avec le venv activé :

```bash
curl -X POST http://localhost:8000/ingest/run \
  -H "X-Ingest-Secret: dev-secret"
```

Réponse attendue (exemple) :

```json
{
  "ingest": {
    "mix_upserted": 48,
    "carbon_upserted": 24,
    "errors": []
  },
  "forecast": { ... }
}
```

Si `electricity_maps` est dans `errors` → token manquant ou invalide.  
Le **mix RTE** peut quand même remplir `grid_mix_points`.

Puis ouvre :

- [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- [http://localhost:3000/forecast](http://localhost:3000/forecast)

---

## 5. GitHub

```bash
cd /Users/christophechollet/Desktop/Alyra/GridPulse
git commit -m "feat: GridPulse V1 — pipeline data, dashboard, forecast"
gh repo create ChristopheChollet/GridPulse --public --source=. --push
```

(Si le repo existe déjà : `git remote add origin ...` puis `git push -u origin main`)

---

## 6. Déploiement

### Vercel (frontend)

- Import repo `GridPulse`
- **Root Directory** : `frontend`
- Env : `NEXT_PUBLIC_API_URL` = URL Railway (étape suivante)

### Railway (backend)

- New project → repo `GridPulse`, **root** : `backend` (ou Dockerfile)
- Variables : copier `backend/.env` (sans commiter le fichier)
- Générer un `INGEST_SECRET` fort en prod

### GitHub Actions (ingestion horaire)

Repo → **Settings** → **Secrets** :

- `GRIDPULSE_API_URL` = `https://ton-api.railway.app`
- `INGEST_SECRET` = même secret que Railway

---

## 7. Captures portfolio

Après déploiement, captures WebP :

1. Landing `/`
2. `/dashboard`
3. `/forecast`

→ `docs/screenshots/` puis copie vers  
`christophe-portfolio/public/screenshots/gridpulse/`

Variable Vercel portfolio (optionnel) :

```env
GRIDPULSE_DEMO_URL=https://ton-front.vercel.app
NEXT_PUBLIC_GRIDPULSE_REPO_URL=https://github.com/ChristopheChollet/GridPulse
```

---

## Dépannage rapide

| Symptôme | Cause probable |
|----------|----------------|
| Dashboard « API indisponible » | Backend arrêté ou `NEXT_PUBLIC_API_URL` incorrect |
| KPIs vides, pas d’erreur API | Pas encore lancé `POST /ingest/run` |
| `mix_upserted: 0` | Migration SQL non exécutée ou mauvaises clés Supabase |
| Carbone vide, mix OK | Token Electricity Maps absent |
| 401 sur ingest | Header `X-Ingest-Secret` ≠ `INGEST_SECRET` dans `.env` |
