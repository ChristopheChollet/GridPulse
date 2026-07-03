import type { GreenWindows } from "@/lib/api";
import { formatTime } from "@/lib/api";

export function GreenWindowCard({ data }: { data: GreenWindows }) {
  const best = data.best_window;

  return (
    <section className="chart-card" aria-labelledby="green-window-title">
      <h2 id="green-window-title" className="chart-title">
        Créneau vert — meilleure fenêtre {data.window_hours} h
      </h2>

      {best ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Période</p>
            <p className="mt-1 text-sm font-semibold text-primary">
              {formatTime(best.start_at)} → {formatTime(best.end_at)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Carbone moyen
            </p>
            <p className="mt-1 text-sm font-semibold text-primary">
              {best.avg_carbon_gco2_kwh} gCO₂/kWh
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Renouvelable moyen
            </p>
            <p className="mt-1 text-sm font-semibold text-primary">
              {best.avg_renewable_pct} %
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-secondary">
          Pas assez de données horaires pour calculer une fenêtre de {data.window_hours} h.
        </p>
      )}

      <p className="chart-caption">{data.hint}</p>
    </section>
  );
}
