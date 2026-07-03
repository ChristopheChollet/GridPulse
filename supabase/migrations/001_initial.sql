-- GridPulse V1 schema

create table if not exists public.grid_mix_points (
  id bigint generated always as identity primary key,
  recorded_at timestamptz not null,
  nuclear_pct numeric(6, 2) not null default 0,
  wind_pct numeric(6, 2) not null default 0,
  solar_pct numeric(6, 2) not null default 0,
  hydro_pct numeric(6, 2) not null default 0,
  gas_pct numeric(6, 2) not null default 0,
  coal_pct numeric(6, 2) not null default 0,
  other_pct numeric(6, 2) not null default 0,
  consumption_mw numeric(12, 2),
  source text not null default 'rte',
  created_at timestamptz not null default now(),
  unique (recorded_at, source)
);

create index if not exists grid_mix_points_recorded_at_idx
  on public.grid_mix_points (recorded_at desc);

create table if not exists public.carbon_intensity_points (
  id bigint generated always as identity primary key,
  recorded_at timestamptz not null,
  zone text not null default 'FR',
  carbon_gco2_kwh numeric(8, 2) not null,
  fossil_fuel_pct numeric(6, 2),
  source text not null default 'electricity_maps',
  created_at timestamptz not null default now(),
  unique (recorded_at, zone, source)
);

create index if not exists carbon_intensity_points_recorded_at_idx
  on public.carbon_intensity_points (recorded_at desc);

create table if not exists public.forecasts (
  id bigint generated always as identity primary key,
  metric text not null check (metric in ('carbon_intensity', 'renewable_share')),
  forecast_for timestamptz not null,
  value numeric(12, 4) not null,
  model text not null,
  created_at timestamptz not null default now(),
  unique (metric, forecast_for, model)
);

create index if not exists forecasts_metric_forecast_for_idx
  on public.forecasts (metric, forecast_for desc);

alter table public.grid_mix_points enable row level security;
alter table public.carbon_intensity_points enable row level security;
alter table public.forecasts enable row level security;

create policy "Public read grid_mix_points"
  on public.grid_mix_points for select
  using (true);

create policy "Public read carbon_intensity_points"
  on public.carbon_intensity_points for select
  using (true);

create policy "Public read forecasts"
  on public.forecasts for select
  using (true);
