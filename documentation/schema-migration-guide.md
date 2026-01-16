# Schema Migration & Reference Guide (2025-12)

This guide documents the migration from the legacy column naming (uppercase, space-separated) to the new snake_case schema and provides a **comprehensive reference** for the current database structure (`documentation/database/master-schema.json`).

> **Target Audience:** Backend engineers, Data engineers, and Frontend developers wiring up UI components.  
> **Source of Truth:** The database schema definitions below are derived from the master schema JSON.

---

## 1. Quick Summary

- **Core Tables:** `accounts`, `centers`, `services`, `functions`, `prospects`.
- **Naming Convention:** strict `snake_case`.
- **Primary Keys (PK):**
  - `accounts` -> `account_global_legal_name`
  - `centers` -> `cn_unique_key`
- **Linkage:**
  - `centers` links to `accounts` via `account_global_legal_name`.
  - `services` and `functions` link to `centers` via `cn_unique_key`.
  - `prospects` links to `accounts` via `account_global_legal_name` (and optionally `center_name`).

---

## 2. Detailed Schema Reference

### 2.1 Table: `accounts`
**Description:** The top-level entity representing a company. Contains Headquarter (HQ) details, global metrics, and aggregate Indian presence info.

| Column | Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| **`account_global_legal_name`** | `TEXT` | **NO** | **Primary Key**. The unique legal name of the account globally. Used for all foreign key lookups. |
| `account_last_update_date` | `TIMESTAMP` | YES | Metadata: Last data refresh timestamp. |
| `account_nasscom_status` | `TEXT` | YES | Membership status with NASSCOM. |
| `account_nasscom_member_status` | `TEXT` | YES | Detailed member status. |
| `account_about` | `TEXT` | YES | Brief company description/bio. |
| **HQ Location Fields** | | | |
| `account_hq_address` | `TEXT` | YES | Full street address of HQ. |
| `account_hq_city` | `TEXT` | YES | City of HQ. |
| `account_hq_state` | `TEXT` | YES | State/Province of HQ. |
| `account_hq_zip_code` | `TEXT` | YES | Postal code. |
| `account_hq_country` | `TEXT` | YES | Country of HQ. |
| `account_hq_region` | `TEXT` | YES | Global region (e.g., "North America"). |
| **Business Details** | | | |
| `account_hq_boardline` | `TEXT` | YES | Main contact number. |
| `account_hq_website` | `TEXT` | YES | Company website URL. |
| `account_hq_key_offerings` | `TEXT` | YES | Description of products/services offered. |
| `account_key_offerings_source_link`| `TEXT` | YES | URL source for offerings data. |
| `account_hq_sub_industry` | `TEXT` | YES | Granular industry classification. |
| `account_hq_industry` | `TEXT` | YES | High-level industry (e.g., "Technology"). |
| `account_primary_category` | `TEXT` | YES | Broad category (e.g., "Service Provider"). |
| `account_primary_nature` | `TEXT` | YES | Nature of business. |
| **Rankings & Financials** | | | |
| `account_hq_forbes_2000_rank` | `INTEGER` | YES | Rank in Forbes 2000 list. |
| `account_hq_fortune_500_rank` | `INTEGER` | YES | Rank in Fortune 500 list. |
| `account_hq_company_type` | `TEXT` | YES | e.g., "Public", "Private". |
| `account_hq_revenue` | `BIGINT` | YES | Exact revenue figure. **Technical Note:** Stored as BIGINT to handle large values; frontend should format currency. |
| `account_hq_revenue_range` | `TEXT` | YES | Revenue bucket (e.g., "$1B - $5B"). |
| `account_hq_fy_end` | `TEXT` | YES | Fiscal year end month. |
| `account_hq_revenue_year` | `INTEGER` | YES | Year associated with the revenue figure. |
| `account_hq_revenue_source_type` | `TEXT` | YES | Source type for revenue data. |
| `account_hq_revenue_source_link` | `TEXT` | YES | URL source for revenue data. |
| **Employees** | | | |
| `account_hq_employee_count` | `INTEGER` | YES | Global employee count (Exact). |
| `account_hq_employee_range` | `TEXT` | YES | Global employee range bucket. |
| `account_hq_employee_source_type`| `TEXT` | YES | Source type for employee data. |
| `account_hq_employee_source_link`| `TEXT` | YES | URL source for employee data. |
| `account_center_employees` | `INTEGER` | YES | Aggregate employees in India centers (Exact). |
| `account_center_employees_range` | `TEXT` | YES | **Warning:** Range string for India employees. Do not try to sum this. |
| **India Presence** | | | |
| `years_in_india` | `INTEGER` | YES | Derived metric: Current Year - First Center Year. |
| `account_first_center_year` | `INTEGER` | YES | Year the first center was established. |
| `account_comments` | `TEXT` | YES | Internal notes. |
| `account_coverage` | `TEXT` | YES | Coverage status. |

---

### 2.2 Table: `centers`
**Description:** Individual delivery centers or office locations in India.

| Column | Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| **`cn_unique_key`** | `TEXT` | **NO** | **Primary Key**. Unique identifier for the center (often formatted string). |
| `account_global_legal_name` | `TEXT` | YES | **Foreign Key** to `accounts` table. |
| `last_update_date` | `TIMESTAMP` | YES | Metadata. |
| `center_status` | `TEXT` | YES | Operational status (e.g., "Active"). |
| `center_inc_year` | `INTEGER` | YES | Year of incorporation/start. |
| `center_end_year` | `INTEGER` | YES | Year of closure (if applicable). |
| `center_name` | `TEXT` | YES | Display name of the center. |
| `center_type` | `TEXT` | YES | Type of facility (e.g., "GCC", "R&D"). |
| `center_focus` | `TEXT` | YES | Strategic focus area. |
| **Location (Geo)** | | | |
| `lat` | `DOUBLE` | YES | Latitude. **Critical:** Required for Map rendering. |
| `lng` | `DOUBLE` | YES | Longitude. **Critical:** Required for Map rendering. |
| `center_address`, `center_city`, `center_state`, `center_zip_code`, `center_country`, `center_region` | `TEXT` | YES | Address components. |
| **Details** | | | |
| `center_employees` | `INTEGER` | YES | Exact headcount at this specific center. |
| `center_employees_range` | `TEXT` | YES | Headcount bucket. |
| `center_services` | `TEXT` | YES | Summary of services (comma separated or text). |
| `center_website`, `center_linkedin`| `TEXT` | YES | Center-specific social/web links. |
| `center_business_segment` | `TEXT` | YES | Segment info. |
| `center_jv_status`, `center_jv_name`| `TEXT` | YES | Joint Venture details. |

---

### 2.3 Table: `services`
**Description:** Specific service lines delivered out of a center. Linked 1:Many with Centers.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `cn_unique_key` | `TEXT` | **Foreign Key** to `centers`. |
| `account_global_legal_name` | `TEXT` | **Foreign Key** to `accounts` (Redundant/Denormalized for performance). |
| `primary_service` | `TEXT` | Main service category. |
| `focus_region` | `TEXT` | Region this service supports. |
| `service_it`, `service_erd`, `service_fna`, `service_hr`, `service_procurement`, `service_sales_marketing`, `service_customer_support`, `service_others` | `TEXT` | **Service Flags/Descriptions:** Specific verticals handled. |
| `software_vendor`, `software_in_use` | `TEXT` | Tech stack information. |
| `center_name`, `center_type`, `center_focus`, `center_city` | `TEXT` | Denormalized fields from `centers` to simplify queries. |

---

### 2.4 Table: `functions`
**Description:** Operational functions present within a center. Linked 1:Many with Centers.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `cn_unique_key` | `TEXT` | **Foreign Key** to `centers`. |
| `function_name` | `TEXT` | Name of the function (e.g., "Finance", "Legal"). |

---

### 2.5 Table: `prospects`
**Description:** Contacts/Leads associated with an account.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `account_global_legal_name` | `TEXT` | **Foreign Key** to `accounts`. Primary linkage. |
| `center_name` | `TEXT` | **Secondary Link** to `centers` (Soft link via name). |
| `prospect_full_name` | `TEXT` | Full name. |
| `prospect_first_name`, `prospect_last_name` | `TEXT` | Split names. |
| `prospect_title` | `TEXT` | Job Title. |
| `prospect_department` | `TEXT` | Dept. |
| `prospect_level` | `TEXT` | Seniority level (e.g., "C-Level", "Director"). |
| `prospect_email`, `prospect_linkedin_url` | `TEXT` | Contact info. |
| `prospect_city`, `prospect_state`, `prospect_country` | `TEXT` | Location of the prospect. |

---

## 3. Linkage & Cascade Logic

This section describes how filters and data flow through the application.

1.  **Centers are the Anchor:**
    - The `cn_unique_key` is the central pivot for `services` and `functions`.
    - If you filter by `function_name`, the app finds all `cn_unique_key`s in `functions` and limits the `centers` view to those keys.

2.  **Top-Level Accounts:**
    - `accounts` are filtered by their own fields (`account_hq_revenue`, etc.) OR by the presence of matching child centers.
    - *Example:* "Show Accounts with Centers in Bangalore".

3.  **Cascades (Bi-directional vs Downstream):**
    - **Account ↔ Center:** Bi-directional. Filtering an account hides non-matching centers. Filtering a center property hides accounts that don't have that center.
    - **Center ↔ Function:** Bi-directional.
    - **Service:** Currently treated as **Downstream**. Filtering by Service usually narrows down the displayed data but might not strictly filter the Account list in some legacy query paths. *Verify in `app/actions.ts` if this has changed.*
    - **Prospects:** Linked to `accounts`. Filtering prospects usually narrows the list of prospects visible under a specific account.

---

## 4. Developer Notes for Maintainers

### 4.1 Data Fetching (`app/actions.ts`)
- Queries are written using `snake_case` column names.
- When adding a new filter, ensure you update the WHERE clauses to reference the correct new column name from Section 2.
- **Performance Tip:** The `accounts` table has ~2.5k rows, but `prospects` has ~40k. Always index searches on `prospects` by `account_global_legal_name`.

### 4.2 Type Definitions (`lib/types.ts`)
- Types must mirror the DB schema.
- Numeric fields in JSON (`INTEGER`, `BIGINT`, `DOUBLE`) should be typed as `number` in TypeScript.
- `TIMESTAMP` fields can be `string` (ISO date) or `Date` objects depending on the driver configuration.

### 4.3 UI Components
- **Maps (`components/maps/*`):** strictly require `lat` and `lng` from the `centers` table. Rows with null coordinates are filtered out client-side or in the SQL query.
- **Charts (`lib/utils/chart-helpers.ts`):** often aggregate data. Ensure you are aggregating numeric fields (`account_hq_revenue`, `account_hq_employee_count`) and not the string range fields (`_range`).

### 4.4 Common Pitfalls
- **Range vs Exact:** Don't try to mathematically sum `account_hq_revenue_range`. Use `account_hq_revenue` (numeric).
- **Denormalization:** `services` contains copies of `center_city` etc. If you update a center's city, it might not automatically propagate to `services` unless the ETL process handles it. Rely on `centers` for the source of truth for location data.
- **Saved Filters:** The `saved_filters` table (if used) stores JSON blobs. If you rename a column in the database, legacy saved filters in JSON format will break. You must migrate saved JSON or handle legacy keys in the application logic.

---

## 5. Deployment & Tools
- **Build:** `npm run build`
- **Lint:** `npm run lint` (Next.js default)
- **CI/CD:** Vercel uses `pnpm install --no-frozen-lockfile` to handle potential lockfile mismatches.
