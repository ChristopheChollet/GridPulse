-- GridPulse V2: ingest run history for /status

create table if not exists public.ingest_runs (
  id bigint generated always as identity primary key,
  run_at timestamptz not null default now(),
  mix_upserted int not null default 0,
  carbon_upserted int not null default 0,
  errors text[] not null default '{}',
  success boolean not null default true
);

create index if not exists ingest_runs_run_at_idx
  on public.ingest_runs (run_at desc);

alter table public.ingest_runs enable row level security;

create policy "Public read ingest_runs"
  on public.ingest_runs for select
  using (true);
