# Supabase Saved Filters Setup

This guide documents the implementation of the "Saved Filters" feature, which allows users to persist their complex filter configurations. It uses a dedicated table in Supabase with a `JSONB` column to store the flexible filter state.

> **Context:** Used by `components/saved-filters-manager.tsx` and `app/actions.ts`.

---

## 1. Schema Reference

### 1.1 Table: `saved_filters`

| Column | Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **NO** | Primary Key. Defaults to `gen_random_uuid()`. |
| `user_id` | `UUID` | **NO** | Foreign Key to `auth.users`. Ensures filters belong to a specific user. |
| `name` | `TEXT` | **NO** | User-defined name for the filter set (e.g., "Q4 Tech Prospects"). |
| `filters` | `JSONB` | **NO** | The raw filter state object. **Crucial:** See JSON Structure below. |
| `created_at` | `TIMESTAMPTZ` | **NO** | Default `now()`. |
| `updated_at` | `TIMESTAMPTZ` | **NO** | Default `now()`. Auto-updated via trigger. |

### 1.2 SQL Definition

```sql
-- Ensure UUID extension is available
create extension if not exists "pgcrypto";

create table if not exists public.saved_filters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  filters jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Performance Index: Quickly fetch a user's filters sorted by newest first
create index if not exists saved_filters_user_created_idx
  on public.saved_filters (user_id, created_at desc);
```

---

## 2. JSONB Structure (`filters` column)

The `filters` column stores the **Application State**, not the Database Schema. Therefore, keys use `camelCase` matching the React state, even though the database tables use `snake_case`.

**Interface (TypeScript):**
```typescript
interface Filters {
  // Accounts
  accountCountries: string[];
  accountIndustries: string[];
  accountPrimaryCategories: string[];
  accountPrimaryNatures: string[];
  accountNasscomStatuses: string[];
  accountEmployeesRanges: string[];
  accountCenterEmployees: string[];
  accountRevenueRange: [number, number]; // e.g., [0, 1000000]
  includeNullRevenue: boolean;
  accountYearsInIndiaRange: [number, number];
  includeNullYearsInIndia: boolean;
  accountFirstCenterYearRange: [number, number];
  includeNullFirstCenterYear: boolean;
  accountNameKeywords: string[];

  // Centers
  centerTypes: string[];
  centerFocus: string[];
  centerCities: string[];
  centerStates: string[];
  centerCountries: string[];
  centerEmployees: string[];
  centerStatuses: string[];
  centerIncYearRange: [number, number];
  includeNullCenterIncYear: boolean;
  
  // Functions
  functionTypes: string[];
  
  // Prospects
  prospectDepartments: string[];
  prospectLevels: string[];
  prospectCities: string[];
  prospectTitleKeywords: string[];
}
```

> **Migration Note:** If the frontend filter keys change (e.g., renaming `accountCountries` to `countries`), existing JSON blobs in this table will remain in the old format. The application logic (`withFilterDefaults` in `saved-filters-manager.tsx`) MUST handle parsing and normalizing these legacy keys to prevent crashes.

---

## 3. Security (RLS Policies)

Row Level Security ensures users can only access their own saved filters.

```sql
alter table public.saved_filters enable row level security;

-- SELECT: Users see only their own filters
create policy "Saved filters are private"
  on public.saved_filters for select
  using (auth.uid() = user_id);

-- INSERT: Users can create filters only for themselves
create policy "Users can insert their saved filters"
  on public.saved_filters for insert
  with check (auth.uid() = user_id);

-- UPDATE: Users can update only their own filters
create policy "Users can update their saved filters"
  on public.saved_filters for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE: Users can delete only their own filters
create policy "Users can delete their saved filters"
  on public.saved_filters for delete
  using (auth.uid() = user_id);
```

---

## 4. Maintenance

### 4.1 Auto-Update Trigger
Keeps `updated_at` current.

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

### 4.2 Application Integration
- **Saving:** The frontend serializes the entire `filters` state object to JSON and sends it to Supabase.
- **Loading:** The frontend fetches the JSON, parses it, and runs it through a normalization function (`withFilterDefaults`) to ensure all required keys exist, filling in defaults for any missing fields (crucial for backward compatibility).
