import { ApiErrorState } from "@/components/ApiErrorState";
import { ForecastChart } from "@/components/EnergyCharts";
import { ForecastIcon } from "@/components/ModuleIcons";
import { PageHeader } from "@/components/PageHeader";
import { StatGrid } from "@/components/StatGrid";
import { getCarbon, getForecasts, type CarbonPoint, type ForecastPoint } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ForecastPage() {
  let carbonPoints: CarbonPoint[] = [];
  let forecasts: ForecastPoint[] = [];
  let mlForecasts: ForecastPoint[] = [];
  let error: string | null = null;

  try {
    const [carbon, baseline] = await Promise.all([
      getCarbon(24),
      getForecasts("carbon_intensity", "moving_avg_24h"),
    ]);
    carbonPoints = carbon.points;
    forecasts = baseline.forecasts;
  } catch (e) {
    error = e instanceof Error ? e.message : "Erreur API";
  }

  // Modèle ML optionnel : présent après un run ; sinon on affiche juste la baseline.
  try {
    const ml = await getForecasts("carbon_intensity", "sklearn_hourly_v1");
    mlForecasts = ml.forecasts;
  } catch {
    mlForecasts = [];
  }

  const latestForecast = forecasts.at(-1)?.value ?? forecasts[0]?.value;
  const latestMl = mlForecasts.at(-1)?.value ?? mlForecasts[0]?.value;
  const hasMl = mlForecasts.length > 0;

  return (
    <div>
      <PageHeader
        eyebrow="Baseline + ML"
        title="Prévision carbone"
        description="Deux modèles sur l'intensité carbone : baseline moyenne mobile 24 h et modèle ML par cycle horaire — pédagogiques, pas opérationnels RTE."
        accent="#7c3aed"
        icon={<ForecastIcon />}
      />

      <div className="disclaimer-card">
        <p className="text-sm text-secondary">
          <strong className="text-primary">Baseline vs ML</strong> — la baseline est une moyenne
          mobile plate ; le modèle ML (Ridge sur features horaires) apprend le cycle journalier du
          carbone. Comparaison pédagogique, pas un modèle météo/production RTE.
        </p>
      </div>

      {error ? (
        <ApiErrorState
          className="mb-8 mt-6"
          hint="Vérifiez que le backend FastAPI expose /forecast, puis exécutez POST /forecast/run."
          detail={error}
        />
      ) : null}

      {latestForecast != null ? (
        <div className="mt-6">
          <StatGrid
            items={[
              {
                label: "Baseline 12 h",
                value: `${latestForecast} gCO₂/kWh`,
                hint: "Modèle moving_avg_24h",
                tone: latestForecast < 80 ? "ok" : "default",
              },
              {
                label: "ML 12 h",
                value: hasMl && latestMl != null ? `${latestMl} gCO₂/kWh` : "—",
                hint: hasMl ? "Modèle sklearn_hourly_v1" : "En attente d'un run /forecast",
                tone: hasMl && latestMl != null && latestMl < 80 ? "ok" : "default",
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
          <ForecastChart
            history={carbonPoints}
            forecasts={forecasts}
            ml={mlForecasts}
          />
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
