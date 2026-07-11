"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { CarbonPoint, MixPoint } from "@/lib/api";

function formatChartTime(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(new Date(iso));
}

export function CarbonChart({ points }: { points: CarbonPoint[] }) {
  const data = points.map((p) => ({
    time: formatChartTime(p.recorded_at),
    carbon: p.carbon_gco2_kwh,
  }));

  return (
    <div className="chart-card">
      <h2 className="chart-title">Intensité carbone (24 h)</h2>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
            <YAxis unit=" g" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--surface-border)",
                borderRadius: 8,
              }}
            />
            <Line
              type="monotone"
              dataKey="carbon"
              name="gCO₂/kWh"
              stroke="#0891b2"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const MIX_COLORS = {
  nuclear: "#6366f1",
  wind: "#22c55e",
  solar: "#eab308",
  hydro: "#06b6d4",
  gas: "#f97316",
  coal: "#78716c",
  other: "#a3a3a3",
};

export function MixStackChart({ points }: { points: MixPoint[] }) {
  const data = points.map((p) => ({
    time: formatChartTime(p.recorded_at),
    Nucléaire: p.nuclear_pct,
    Éolien: p.wind_pct,
    Solaire: p.solar_pct,
    Hydraulique: p.hydro_pct,
    Gaz: p.gas_pct,
    Charbon: p.coal_pct,
    Autres: p.other_pct,
  }));

  return (
    <div className="chart-card">
      <h2 className="chart-title">Mix électrique français (%)</h2>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
            <YAxis unit="%" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--surface-border)",
                borderRadius: 8,
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="Nucléaire"
              stackId="1"
              stroke={MIX_COLORS.nuclear}
              fill={MIX_COLORS.nuclear}
            />
            <Area
              type="monotone"
              dataKey="Éolien"
              stackId="1"
              stroke={MIX_COLORS.wind}
              fill={MIX_COLORS.wind}
            />
            <Area
              type="monotone"
              dataKey="Solaire"
              stackId="1"
              stroke={MIX_COLORS.solar}
              fill={MIX_COLORS.solar}
            />
            <Area
              type="monotone"
              dataKey="Hydraulique"
              stackId="1"
              stroke={MIX_COLORS.hydro}
              fill={MIX_COLORS.hydro}
            />
            <Area
              type="monotone"
              dataKey="Gaz"
              stackId="1"
              stroke={MIX_COLORS.gas}
              fill={MIX_COLORS.gas}
            />
            <Area
              type="monotone"
              dataKey="Charbon"
              stackId="1"
              stroke={MIX_COLORS.coal}
              fill={MIX_COLORS.coal}
            />
            <Area
              type="monotone"
              dataKey="Autres"
              stackId="1"
              stroke={MIX_COLORS.other}
              fill={MIX_COLORS.other}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

type ForecastSeriesPoint = { forecast_for: string; value: number };

export function ForecastChart({
  history,
  forecasts,
  ml,
}: {
  history: CarbonPoint[];
  forecasts: ForecastSeriesPoint[];
  ml?: ForecastSeriesPoint[];
}) {
  const lastHistory = history.at(-1);
  const baseSlice = forecasts.slice(0, 12);
  const mlSlice = (ml ?? []).slice(0, 12);
  const hasMl = mlSlice.length > 0;

  const historyRows = history.map((p) => ({
    time: formatChartTime(p.recorded_at),
    actual: p.carbon_gco2_kwh,
    baseline: null as number | null,
    mlPred: null as number | null,
  }));

  // Bridge point: connect the last actual value to the first forecast of each series.
  const bridge =
    lastHistory && baseSlice[0]
      ? [
          {
            time: formatChartTime(baseSlice[0].forecast_for),
            actual: lastHistory.carbon_gco2_kwh,
            baseline: baseSlice[0].value,
            mlPred: mlSlice[0]?.value ?? null,
          },
        ]
      : [];

  const startIdx = bridge.length ? 1 : 0;
  // Baseline and ML share the same hourly forecast_for timestamps (index-aligned).
  const forecastRows = baseSlice.slice(startIdx).map((p, i) => ({
    time: formatChartTime(p.forecast_for),
    actual: null as number | null,
    baseline: p.value,
    mlPred: mlSlice[startIdx + i]?.value ?? null,
  }));

  const data = [...historyRows, ...bridge, ...forecastRows];

  return (
    <div className="chart-card">
      <h2 className="chart-title">
        Historique + prévision{hasMl ? " — baseline vs ML" : " (moyenne mobile 24 h)"}
      </h2>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              stroke="var(--text-muted)"
              interval="preserveStartEnd"
            />
            <YAxis unit=" g" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--surface-border)",
                borderRadius: 8,
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="actual"
              name="Historique"
              stroke="#0891b2"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="baseline"
              name="Baseline (moy. mobile)"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              connectNulls={false}
            />
            {hasMl ? (
              <Line
                type="monotone"
                dataKey="mlPred"
                name="ML (cycle horaire)"
                stroke="#7c3aed"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
                connectNulls={false}
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-caption">
        {hasMl
          ? "ML = Ridge sur features horaires (cycle journalier) vs baseline plate — pédagogique, pas un modèle opérationnel RTE."
          : "Baseline pédagogique — pas un modèle opérationnel RTE."}
      </p>
    </div>
  );
}
