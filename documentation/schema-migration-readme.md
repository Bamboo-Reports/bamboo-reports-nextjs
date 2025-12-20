# Schema Migration & App Alignment

This document captures the changes made to align the app with the new database schema (`schema_20251220_142031.json`) and how to work on this in the future.

## What Changed
- **Schema adoption:** Switched all data access and UI to the snake_case schema for `accounts`, `centers`, `services`, `functions`, `prospects`, and `saved_filters`.
- **Field mappings:** Key legacy → new mappings (high-level):
  - Accounts: `ACCOUNT NAME` → `account_global_legal_name` (PK), `ACCOUNT TYPE` → `account_hq_company_type`, `ACCOUNT REVNUE` → `account_hq_revenue`, `ACCOUNT EMPLOYEES` → `account_hq_employee_count`, `ACCOUNT CENTER EMPLOYEES` → `account_center_employees_range`, etc.
  - Centers: `CN UNIQUE KEY` → `cn_unique_key` (PK), `CENTER NAME` → `center_name`, `LAT`/`LANG` → `lat`/`lng`, etc.
  - Services: same `cn_unique_key` linkage; service columns to snake_case (e.g., `PRIMARY SERVICE` → `primary_service`, `IT` → `service_it`).
  - Functions: `FUNCTION` → `function_name`.
  - Prospects: `ACCOUNT NAME` → `account_global_legal_name`, `FIRST NAME` → `prospect_first_name`, etc.
- **Linkage logic:**
  - Centers are the anchor via `cn_unique_key`.
  - Services link to centers via `cn_unique_key` (downstream-only in current filters).
  - Functions link to centers via `cn_unique_key` (bi-directional cascade with centers/accounts).
  - Prospects link to accounts via `account_global_legal_name` (bi-directional cascade with accounts/centers).
  - Filters cascade so selections on accounts, centers, functions, or prospects keep other views consistent.
- **ESLint:** Added `next lint` with `eslint` + `eslint-config-next`; lint/build now clean.

## Files to Know
- Data/model usage: `app/actions.ts`, `app/page.tsx`
- Types: `lib/types.ts`
- UI/filtering: `components/tabs/*`, `components/dialogs/*`, `components/tables/*`, `components/filters/*`, `components/maps/centers-map.tsx`
- Charts/helpers: `lib/utils/chart-helpers.ts`, `lib/utils/helpers.ts`
- Lint config: `.eslintrc.json`
- Schema: `schema_20251220_142031.json`

## Current Behavior & Cascades
- Accounts ↔ Centers/Functions: bi-directional; function filters constrain centers and accounts.
- Accounts ↔ Prospects: bi-directional via `account_global_legal_name`.
- Services: filtered downstream by centers; no upstream cascade from services today.

## How to Re-run Locally
```bash
pnpm install --no-frozen-lockfile   # pnpm@10 used on CI
npm run lint
npm run build
```

## Future Work Tips
- If adding service-level filters that should constrain centers/accounts, wire service filters into the center key set and re-run cascades.
- Keep `lib/types.ts` in sync with schema changes; update queries in `app/actions.ts` and UI field refs accordingly.
- When schema changes add/remove columns, update export helpers and dialogs/tables to avoid undefined accesses.
- For prospects, linkage remains via `account_global_legal_name` (no `cn_unique_key`).

## Deployment Note
- Vercel CI uses `pnpm install --no-frozen-lockfile` to reconcile lockfile after dependency changes (eslint additions).

