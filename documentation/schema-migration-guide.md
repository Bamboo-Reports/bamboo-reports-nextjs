# Schema Migration Guide (2025-12)

This guide documents the migration from the legacy column naming (uppercase, space-separated) to the new snake_case schema (`schema_20251220_142031.json`) and how the app wiring works. Use this as the reference for future schema changes.

## Quick Summary
- Tables: `accounts`, `centers`, `services`, `functions`, `prospects`, `saved_filters`.
- Naming: All columns are snake_case; primary keys and linkage fields are explicit (`account_global_legal_name`, `cn_unique_key`).
- Cascades: Filters flow across accounts ↔ centers ↔ functions and accounts ↔ prospects. Services are downstream from centers (no upstream cascade today).
- Tooling: Lint with `next lint`; build with `next build`; install with pnpm using `--no-frozen-lockfile` in CI.

## Table Mappings (Legacy → New)
- **accounts**
  - `ACCOUNT NAME` → `account_global_legal_name` (PK)
  - `ACCOUNT TYPE` → `account_hq_company_type`
  - `ACCOUNT REVNUE` → `account_hq_revenue` (numeric)
  - `ACCOUNT REVENUE RANGE` → `account_hq_revenue_range`
  - `ACCOUNT EMPLOYEES` → `account_hq_employee_count` (numeric)
  - `ACCOUNT EMPLOYEES RANGE` → `account_hq_employee_range`
  - `ACCOUNT CENTER EMPLOYEES` → `account_center_employees_range` (note: range, not numeric)
  - `ACCOUNT FORBES` / `ACCOUNT FORTUNE` → `account_hq_forbes_2000_rank` / `account_hq_fortune_500_rank`
  - `ACCOUNT FIRST CENTER` → `account_first_center_year`
  - `YEARS IN INDIA` → `years_in_india`
  - `ACCOUNT WEBSITE` → `account_hq_website`
  - Other HQ/location/industry fields → `account_hq_*`, `account_primary_*`, etc.
- **centers**
  - `CN UNIQUE KEY` → `cn_unique_key` (PK)
  - `ACCOUNT NAME` → `account_global_legal_name`
  - `CENTER NAME/TYPE/FOCUS/...` → `center_*`
  - `LAT` / `LANG` → `lat` / `lng`
  - Business segment/boardline/website fields → `center_*`
- **services**
  - Linked via `cn_unique_key`
  - `PRIMARY SERVICE` → `primary_service`
  - `FOCUS REGION` → `focus_region`
  - `IT` / `ER&D` / `FnA` / `HR` / `PROCUREMENT` / `SALES & MARKETING` / `CUSTOMER SUPPORT` / `OTHERS` → `service_*`
  - `SOFTWARE VENDOR` / `SOFTWARE IN USE` → `software_*`
- **functions**
  - `CN UNIQUE KEY` → `cn_unique_key`
  - `FUNCTION` → `function_name`
- **prospects**
  - `ACCOUNT NAME` → `account_global_legal_name`
  - `CENTER NAME` → `center_name`
  - Name/title/department/level/location → `prospect_*`
- **saved_filters**
  - `filters` is JSONB; timestamps default to `CURRENT_TIMESTAMP`.

## Linkage & Cascade Logic
- Centers are the anchor via `cn_unique_key`.
- Services: filtered by the surviving center keys (downstream-only).
- Functions: filtered by center keys; function filters also constrain centers (bi-directional with centers/accounts).
- Prospects: linked via `account_global_legal_name`; prospect filters constrain accounts, and centers follow accounts.
- Accounts: top-level aggregate for names and prospect linkage.

## Key Code Paths
- Data fetching: `app/actions.ts` (queries use snake_case; filtered accounts use new columns).
- Shapes/types: `lib/types.ts` (aligned to snake_case; numeric fields typed as numbers).
- Filtering/cascades/UI: `app/page.tsx`, `components/tabs/*`, `components/filters/*`, `components/dialogs/*`, `components/tables/*`, `components/maps/centers-map.tsx`.
- Charts/helpers: `lib/utils/chart-helpers.ts`, `lib/utils/helpers.ts`.
- Lint config: `.eslintrc.json` (`next/core-web-vitals`).

## How to Work on Future Schema Changes
1) Update `lib/types.ts` to match the schema (names + types).
2) Update `app/actions.ts` queries and any filtered queries (`getFilteredAccounts`) to the new column names.
3) Update UI references (tabs, dialogs, tables, filters, charts, map) to the new field names.
4) Adjust cascades if new linkage fields are introduced (e.g., service-level filters that should constrain centers/accounts).
5) Revisit exports and dialogs to avoid accessing dropped fields.

## Testing & Commands
```bash
pnpm install --no-frozen-lockfile   # required on CI if lockfile lags package.json
npm run lint                       # uses next lint
npm run build
```
Optional local smoke tests:
- Load data, verify filters cascade across accounts/centers/functions/prospects.
- Map rendering: centers must have `lat`/`lng`; centers without coordinates are skipped.
- Saved filters CRUD against the `saved_filters` table.

## Known Behaviors
- Services are downstream-only in cascades; adding upstream service filters requires wiring service-derived center keys back into the filter pipeline.
- Prospects link via account name, not `cn_unique_key`.
- `account_center_employees_range` is a range string; numeric center employees are on centers, not accounts.

## Deployment Note
- Vercel CI uses `pnpm install --no-frozen-lockfile` (pnpm@10) to align the lockfile when dependencies change.

