-- Run in Supabase SQL Editor. No names or account data are stored.
create table if not exists public.mission_scores (
  id uuid primary key default gen_random_uuid(),
  scenario_id text not null check (scenario_id in ('earth-observer','moon-mapper','mars-scout','venus-cloud-watcher')),
  difficulty text not null check (difficulty in ('easy','normal','hard')),
  seed integer not null,
  score integer not null check (score between 0 and 100),
  grade text not null check (grade in ('A','B','C','D')),
  mission_days integer not null check (mission_days between 1 and 10000),
  created_at timestamptz not null default now()
);
create index if not exists mission_scores_board_idx on public.mission_scores (scenario_id, difficulty, seed, score desc, mission_days asc);
alter table public.mission_scores enable row level security;
grant select, insert, update on public.mission_scores to anon, authenticated;
drop policy if exists "Anyone can read mission scores" on public.mission_scores;
create policy "Anyone can read mission scores" on public.mission_scores for select to anon, authenticated using (true);
drop policy if exists "Players can submit valid scores" on public.mission_scores;
create policy "Players can submit valid scores" on public.mission_scores for insert to anon, authenticated with check (score between 0 and 100 and mission_days between 1 and 10000);
drop policy if exists "Players can update submitted scores" on public.mission_scores;
create policy "Players can update submitted scores" on public.mission_scores for update to anon, authenticated using (true) with check (score between 0 and 100 and mission_days between 1 and 10000);
