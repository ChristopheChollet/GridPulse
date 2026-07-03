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

function formatHour(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(new Date(iso));
}

export function CarbonChart({ points }: { points: CarbonPoint[] }) {
  const data = points.map((p) => ({
    time: formatHour(p.recorded_at),
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
              stroke="#059669"
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
    time: formatHour(p.recorded_at),
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

export function ForecastChart({
  history,
  forecasts,
}: {
  history: CarbonPoint[];
  forecasts: { forecast_for: string; value: number }[];
}) {
  const historyData = history.map((p) => ({
    time: formatHour(p.recorded_at),
    kind: "history" as const,
    carbon: p.carbon_gco2_kwh,
  }));
  const forecastData = forecasts.map((p) => ({
    time: formatHour(p.forecast_for),
    kind: "forecast" as const,
    carbon: p.value,
  }));
  const data = [...historyData, ...forecastData];

  return (
    <div className="chart-card">
      <h2 className="chart-title">Historique + prévision (moyenne mobile 24 h)</h2>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height={300}>
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
              stroke="#059669"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-caption">
        Baseline portfolio — pas un modèle opérationnel RTE.
      </p>
    </div>
  );
}
