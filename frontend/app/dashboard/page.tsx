import { CarbonChart, MixStackChart } from "@/components/EnergyCharts";
import { DashboardExport } from "@/components/DashboardExport";
import { GreenWindowCard } from "@/components/GreenWindowCard";
import { DashboardIcon } from "@/components/ModuleIcons";
import { PageHeader } from "@/components/PageHeader";
import { StatGrid } from "@/components/StatGrid";
import { SyncBadge } from "@/components/SyncBadge";
import { formatTime, getCarbon, getGreenWindows, getMix, getSummary } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let summary = null;
  let mixPoints: Awaited<ReturnType<typeof getMix>>["points"] = [];
  let carbonPoints: Awaited<ReturnType<typeof getCarbon>>["points"] = [];
  let greenWindows: Awaited<ReturnType<typeof getGreenWindows>> | null = null;
  let error: string | null = null;

  try {
    [summary, { points: mixPoints }, { points: carbonPoints }, greenWindows] =
      await Promise.all([getSummary(), getMix(24), getCarbon(24), getGreenWindows(24, 6)]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Erreur API";
  }

  const hasData = mixPoints.length > 0 || carbonPoints.length > 0;
  const latestSync = summary?.carbon_recorded_at ?? summary?.mix_recorded_at;

  return (
    <div>
      <PageHeader
        eyebrow="France · zone FR"
        title="Dashboard énergie"
        description="Mix électrique RTE et intensité carbone Electricity Maps — données agrégées, démo portfolio non réglementaire."
        accent="#059669"
        icon={<DashboardIcon />}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {summary && greenWindows ? (
              <DashboardExport
                report={{
                  generatedAt: new Date(),
                  summary,
                  mixPoints,
                  carbonPoints,
                  greenWindows,
                }}
              />
            ) : null}
            <SyncBadge label="Sync" recordedAt={latestSync} />
          </div>
        }
      />

      {error ? (
        <div className="empty-state mb-8">
          <p className="font-medium text-primary">API indisponible</p>
          <p className="mt-2 text-sm">{error}</p>
          <p className="mt-2 text-xs">
            Lancez le backend FastAPI sur le port 8000, puis exécutez POST /ingest/run.
          </p>
        </div>
      ) : null}

      {summary ? (
        <StatGrid
          items={[
            {
              label: "Intensité carbone",
              value:
                summary.carbon_gco2_kwh != null
                  ? `${summary.carbon_gco2_kwh} gCO₂/kWh`
                  : "—",
              hint: formatTime(summary.carbon_recorded_at),
              tone:
                summary.carbon_gco2_kwh != null && summary.carbon_gco2_kwh < 80
                  ? "ok"
                  : summary.carbon_gco2_kwh != null && summary.carbon_gco2_kwh > 200
                    ? "warn"
                    : "default",
            },
            {
              label: "Part renouvelable",
              value:
                summary.renewable_pct != null ? `${summary.renewable_pct} %` : "—",
              hint: formatTime(summary.mix_recorded_at),
              tone: "ok",
            },
            {
              label: "Consommation",
              value:
                summary.consumption_mw != null
                  ? `${Math.round(summary.consumption_mw).toLocaleString("fr-FR")} MW`
                  : "—",
              hint: "RTE Eco2Mix",
            },
          ]}
        />
      ) : null}

      {hasData ? (
        <div className="mt-8 space-y-6">
          {greenWindows ? <GreenWindowCard data={greenWindows} /> : null}
          {carbonPoints.length > 0 ? (
            <section aria-labelledby="carbon-chart-title">
              <CarbonChart points={carbonPoints} />
            </section>
          ) : null}
          {mixPoints.length > 0 ? (
            <section aria-labelledby="mix-chart-title">
              <MixStackChart points={mixPoints} />
            </section>
          ) : null}
        </div>
      ) : !error ? (
        <div className="empty-state mt-8">
          <p>Aucune donnée en base — lancez une ingestion.</p>
        </div>
      ) : null}
    </div>
  );
}
