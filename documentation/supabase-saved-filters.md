# Supabase saved filters

Use this setup to store saved filters in Supabase with per-user isolation via RLS.

## Table and policies

```sql
create extension if not exists "pgcrypto";

create table if not exists public.saved_filters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  filters jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_filters_user_created_idx
  on public.saved_filters (user_id, created_at desc);

alter table public.saved_filters enable row level security;

create policy "Saved filters are private"
  on public.saved_filters
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their saved filters"
  on public.saved_filters
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their saved filters"
  on public.saved_filters
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their saved filters"
  on public.saved_filters
  for delete
  using (auth.uid() = user_id);
```

## Updated-at trigger (optional)

```sql
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_saved_filters_updated_at on public.saved_filters;

create trigger set_saved_filters_updated_at
before update on public.saved_filters
for each row execute function public.set_updated_at();
```
