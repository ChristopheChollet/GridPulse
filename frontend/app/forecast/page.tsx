import { ForecastChart } from "@/components/EnergyCharts";
import { ForecastIcon } from "@/components/ModuleIcons";
import { PageHeader } from "@/components/PageHeader";
import { StatGrid } from "@/components/StatGrid";
import { getCarbon, getForecasts } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ForecastPage() {
  let carbonPoints: Awaited<ReturnType<typeof getCarbon>>["points"] = [];
  let forecasts: Awaited<ReturnType<typeof getForecasts>>["forecasts"] = [];
  let error: string | null = null;

  try {
    [{ points: carbonPoints }, { forecasts }] = await Promise.all([
      getCarbon(24),
      getForecasts("carbon_intensity"),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Erreur API";
  }

  const latestForecast = forecasts.at(-1)?.value ?? forecasts[0]?.value;

  return (
    <div>
      <PageHeader
        eyebrow="Baseline ML"
        title="Prévision carbone"
        description="Moyenne mobile 24 h sur l'intensité carbone — modèle pédagogique, pas opérationnel RTE."
        accent="#0891b2"
        icon={<ForecastIcon />}
      />

      <div className="disclaimer-card">
        <p className="text-sm text-secondary">
          <strong className="text-primary">Baseline pédagogique</strong> — cette prévision
          n&apos;est pas un modèle météo/production RTE. Elle illustre un pipeline
          data et une prévision simple sur séries temporelles.
        </p>
      </div>

      {error ? (
        <div className="empty-state mb-8 mt-6">
          <p className="font-medium text-primary">API indisponible</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      ) : null}

      {latestForecast != null ? (
        <div className="mt-6">
          <StatGrid
            items={[
              {
                label: "Prévision 12 h",
                value: `${latestForecast} gCO₂/kWh`,
                hint: "Modèle moving_avg_24h",
                tone: latestForecast < 80 ? "ok" : "default",
              },
              {
                label: "Horizon",
                value: `${forecasts.length} points`,
                hint: "1 point / heure",
              },
            ]}
          />
        </div>
      ) : null}

      {carbonPoints.length > 0 && forecasts.length > 0 ? (
        <div className="mt-8">
          <ForecastChart history={carbonPoints} forecasts={forecasts} />
        </div>
      ) : !error ? (
        <div className="empty-state mt-8">
          <p>
            Données ou prévisions manquantes — exécutez POST /ingest/run.
          </p>
        </div>
      ) : null}
    </div>
  );
}
