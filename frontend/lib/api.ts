const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Summary = {
  carbon_gco2_kwh: number | null;
  carbon_recorded_at: string | null;
  renewable_pct: number | null;
  consumption_mw: number | null;
  mix_recorded_at: string | null;
  mix_breakdown: Record<string, unknown> | null;
};

export type MixPoint = {
  recorded_at: string;
  nuclear_pct: number;
  wind_pct: number;
  solar_pct: number;
  hydro_pct: number;
  gas_pct: number;
  coal_pct: number;
  other_pct: number;
  consumption_mw: number | null;
};

export type CarbonPoint = {
  recorded_at: string;
  carbon_gco2_kwh: number;
  fossil_fuel_pct: number | null;
};

export type ForecastPoint = {
  forecast_for: string;
  value: number;
  metric: string;
  model: string;
};

export type GreenWindow = {
  start_at: string;
  end_at: string;
  avg_carbon_gco2_kwh: number;
  avg_renewable_pct: number;
  score: number;
};

export type GreenWindows = {
  window_hours: number;
  best_window: GreenWindow | null;
  slots: {
    hour: string;
    carbon_gco2_kwh: number;
    renewable_pct: number;
    score: number;
  }[];
  hint: string;
};

export type IngestRun = {
  id: number;
  run_at: string;
  mix_upserted: number;
  carbon_upserted: number;
  errors: string[];
  success: boolean;
};

export type PipelineStatus = {
  counts: {
    grid_mix_points: number;
    carbon_intensity_points: number;
    forecasts: number;
  };
  latest_mix_at: string | null;
  latest_carbon_at: string | null;
  last_ingest: IngestRun | null;
};

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function getSummary() {
  return fetchJson<Summary>("/api/v1/summary");
}

export function getMix(hours = 24) {
  return fetchJson<{ points: MixPoint[] }>(`/api/v1/mix?hours=${hours}`);
}

export function getCarbon(hours = 24) {
  return fetchJson<{ points: CarbonPoint[] }>(`/api/v1/carbon?hours=${hours}`);
}

export function getForecasts(metric = "carbon_intensity") {
  return fetchJson<{ forecasts: ForecastPoint[] }>(
    `/api/v1/forecasts?metric=${metric}`,
  );
}

export function getGreenWindows(hours = 24, window = 6) {
  return fetchJson<GreenWindows>(
    `/api/v1/green-windows?hours=${hours}&window=${window}`,
  );
}

export function getStatus() {
  return fetchJson<PipelineStatus>("/api/v1/status");
}

export function formatTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(new Date(iso));
}
