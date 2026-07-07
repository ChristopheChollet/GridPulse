import { StatusIcon } from "@/components/ModuleIcons";
import { PageHeader } from "@/components/PageHeader";
import { StatGrid } from "@/components/StatGrid";
import { formatTime, getStatus } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  let status = null;
  let error: string | null = null;

  try {
    status = await getStatus();
  } catch (e) {
    error = e instanceof Error ? e.message : "Erreur API";
  }

  const lastIngest = status?.last_ingest;

  return (
    <div>
      <PageHeader
        eyebrow="Pipeline"
        title="Statut ingestion"
        description="Dernière synchronisation, volumes en base et erreurs récentes du pipeline RTE / Electricity Maps."
        accent="#7c3aed"
        icon={<StatusIcon />}
      />

      {error ? (
        <div className="empty-state mb-8">
          <p className="font-medium text-primary">API indisponible</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      ) : null}

      {status ? (
        <>
          <StatGrid
            items={[
              {
                label: "Points mix RTE",
                value: status.counts.grid_mix_points.toLocaleString("fr-FR"),
                hint: status.latest_mix_at
                  ? `Dernier : ${formatTime(status.latest_mix_at)}`
                  : "Aucune donnée",
              },
              {
                label: "Points carbone",
                value: status.counts.carbon_intensity_points.toLocaleString("fr-FR"),
                hint: status.latest_carbon_at
                  ? `Dernier : ${formatTime(status.latest_carbon_at)}`
                  : "Aucune donnée",
              },
              {
                label: "Prévisions",
                value: status.counts.forecasts.toLocaleString("fr-FR"),
                hint: "Modèle moving average",
              },
            ]}
          />

          <section className="chart-card mt-8" aria-labelledby="ingest-run-title">
            <h2 id="ingest-run-title" className="chart-title">
              Dernière exécution ingest
            </h2>

            {lastIngest ? (
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted">Exécutée le</dt>
                  <dd className="font-medium text-primary">{formatTime(lastIngest.run_at)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Statut</dt>
                  <dd className="font-medium text-primary">
                    {lastIngest.success ? "Succès" : "Erreurs"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Mix upsertés</dt>
                  <dd className="font-medium text-primary">{lastIngest.mix_upserted}</dd>
                </div>
                <div>
                  <dt className="text-muted">Carbone upsertés</dt>
                  <dd className="font-medium text-primary">{lastIngest.carbon_upserted}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-secondary">
                Aucun run enregistré — appliquez la migration{" "}
                <code className="text-xs">002_ingest_runs.sql</code> puis relancez une ingestion.
              </p>
            )}

            {lastIngest?.errors?.length ? (
              <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  Erreurs
                </p>
                <ul className="mt-2 list-inside list-disc text-sm text-secondary">
                  {lastIngest.errors.map((msg) => (
                    <li key={msg}>{msg}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="chart-caption mt-4">
              Relancer manuellement :{" "}
              <code className="text-xs">POST /ingest/run</code> avec header{" "}
              <code className="text-xs">X-Ingest-Secret</code>. Voir{" "}
              <Link href="/dashboard" className="text-cyan-600 hover:underline dark:text-cyan-400">
                tableau de bord
              </Link>
              .
            </p>
          </section>
        </>
      ) : null}
    </div>
  );
}
