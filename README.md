# Bamboo Reports By ResearchNXT

A modern Business Intelligence dashboard built with Next.js App Router, React, and TypeScript. The app delivers account, center, service, and prospect intelligence through rich filtering, data visualization, and export workflows.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Data Models](#data-models)
- [Application Architecture](#application-architecture)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [License](#license)
- [Support](#support)

---

## Overview

Bamboo Reports provides a unified view of business entities (Accounts, Centers, Services, Functions, and Prospects). The dashboard combines:

- summary metrics and interactive charts,
- map-based exploration of center locations,
- advanced filtering with include/exclude logic,
- and multi-sheet Excel exports for offline analysis.

The product is designed for fast exploration of large datasets, with a UI optimized for quick iteration and high signal-to-noise decision making.

---

## Key Features

### Dashboard and Insights
- Summary cards showing filtered vs. total counts per entity.
- Pie and donut charts for categorical breakdowns (region, nature, revenue, employees).
- Tabbed navigation for Accounts, Centers, and Prospects.
- Mapbox GL map with clustering for center locations.

### Advanced Filtering
- Multi-select filters for country, region, industry, category, nature, and more.
- Include/exclude toggle per filter group for precise slicing.
- Revenue range slider and keyword search.
- Saved filter presets with load/update/delete workflows.
- Debounced, auto-applied filtering for smooth UX.

### Data Management and Exploration
- Paginated tables (50 items per page) optimized for large datasets.
- Row-level detail dialogs with complete record views.
- Consistent type-safe models across the stack.

### Export and Integrations
- Excel exports in `.xlsx` format.
- Multi-sheet export for all entities or selected tabs.
- Company logo rendering via Logo.dev API.

---

## Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.x | React framework with App Router |
| React | 19 | UI library |
| TypeScript | 5 | Type-safe development |

### UI and Styling
| Technology | Purpose |
|------------|---------|
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Component library based on Radix UI |
| Radix UI | Accessible primitives |
| Lucide React | Icons |
| next-themes | Theme handling |

### Data and Visualization
| Technology | Purpose |
|------------|---------|
| Recharts | Charting |
| Mapbox GL | Interactive maps |
| react-map-gl | Mapbox React integration |
| xlsx | Excel export |

### Backend and Utilities
| Technology | Purpose |
|------------|---------|
| Neon PostgreSQL | Serverless database |
| Next.js Server Actions | Server-side data operations |
| Zod | Validation |
| react-hook-form | Forms |
| date-fns | Date utilities |

---

## Project Structure

```
bamboo-reports-nextjs/
  app/                         # Next.js App Router
    page.tsx                   # Main dashboard page
    layout.tsx                 # Root layout with providers
    actions.ts                 # Server actions for data operations
    globals.css                # Global styles
  components/
    charts/                    # Chart components
    dashboard/                 # Summary cards and hero widgets
    dialogs/                   # Row detail dialogs
    filters/                   # Filter sidebar and controls
    layout/                    # Header/footer layout
    maps/                      # Mapbox visualization
    states/                    # Loading/error/empty UI states
    tables/                    # Table row components
    tabs/                      # Tab content for entities
    ui/                        # shadcn/ui base components
  hooks/                       # Custom React hooks
  lib/
    types.ts                   # Shared TypeScript models
    utils.ts                   # Utility helpers
    utils/                     # Filter/export/chart helpers
  public/                      # Static assets
  styles/                      # Extra styling
  next.config.mjs              # Next.js configuration
  tailwind.config.ts           # Tailwind configuration
  package.json                 # Scripts and dependencies
```

---

## Getting Started

### Prerequisites
- Node.js 18.17+ (or later)
- npm, yarn, or pnpm
- Neon PostgreSQL database
- Mapbox access token

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/bamboo-reports-nextjs.git
   cd bamboo-reports-nextjs
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Create local environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` values (see [Environment Variables](#environment-variables)).

5. Start the dev server:
   ```bash
   npm run dev
   ```

6. Open the app at `http://localhost:3000`.

---

## Environment Variables

Create `.env.local` in the project root:

```bash
# Database - Neon PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require

# Mapbox - For interactive maps in Centers tab
# Get your token at: https://account.mapbox.com/access-tokens/
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here

# Logo.dev - For company logo fetching
# Get your free token at: https://logo.dev
NEXT_PUBLIC_LOGO_DEV_TOKEN=pk_your_logo_dev_token_here
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Yes | Mapbox access token |
| `NEXT_PUBLIC_LOGO_DEV_TOKEN` | No | Logo.dev token for company logos |

---

## Data Models

Schema reference: `schema_20260108_134200.json`.

### Schema Summary

| Table | Rows | Size (MB) | Primary Key |
|-------|------|-----------|-------------|
| `accounts` | 2450 | 2.727 | `account_global_legal_name` |
| `centers` | 6161 | 8.781 | `cn_unique_key` |
| `services` | 6131 | 3.148 | None |
| `functions` | 13883 | 1.219 | None |
| `prospects` | 38612 | 9.984 | None |

### Accounts
Represents companies or organizations.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `account_last_update_date` | TIMESTAMP | Yes | |
| `account_nasscom_status` | TEXT | Yes | |
| `account_nasscom_member_status` | TEXT | Yes | |
| `account_global_legal_name` | TEXT | No | Primary key |
| `account_about` | TEXT | Yes | |
| `account_hq_address` | TEXT | Yes | |
| `account_hq_city` | TEXT | Yes | |
| `account_hq_state` | TEXT | Yes | |
| `account_hq_zip_code` | TEXT | Yes | |
| `account_hq_country` | TEXT | Yes | |
| `account_hq_region` | TEXT | Yes | |
| `account_hq_boardline` | TEXT | Yes | |
| `account_hq_website` | TEXT | Yes | |
| `account_hq_key_offerings` | TEXT | Yes | |
| `account_key_offerings_source_link` | TEXT | Yes | |
| `account_hq_sub_industry` | TEXT | Yes | |
| `account_hq_industry` | TEXT | Yes | |
| `account_primary_category` | TEXT | Yes | |
| `account_primary_nature` | TEXT | Yes | |
| `account_hq_forbes_2000_rank` | INTEGER | Yes | |
| `account_hq_fortune_500_rank` | INTEGER | Yes | |
| `account_hq_company_type` | TEXT | Yes | |
| `account_hq_revenue` | BIGINT | Yes | |
| `account_hq_revenue_range` | TEXT | Yes | |
| `account_hq_fy_end` | TEXT | Yes | |
| `account_hq_revenue_year` | INTEGER | Yes | |
| `account_hq_revenue_source_type` | TEXT | Yes | |
| `account_hq_revenue_source_link` | TEXT | Yes | |
| `account_hq_employee_count` | INTEGER | Yes | |
| `account_hq_employee_range` | TEXT | Yes | |
| `account_hq_employee_source_type` | TEXT | Yes | |
| `account_hq_employee_source_link` | TEXT | Yes | |
| `account_center_employees` | INTEGER | Yes | |
| `account_center_employees_range` | TEXT | Yes | |
| `years_in_india` | INTEGER | Yes | |
| `account_first_center_year` | INTEGER | Yes | |
| `account_comments` | TEXT | Yes | |
| `account_coverage` | TEXT | Yes | |

### Centers
Represents account-owned business or service centers.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `last_update_date` | TIMESTAMP | Yes | |
| `cn_unique_key` | TEXT | No | Primary key |
| `account_global_legal_name` | TEXT | Yes | |
| `center_status` | TEXT | Yes | |
| `center_inc_year` | INTEGER | Yes | |
| `center_inc_year_notes` | TEXT | Yes | |
| `center_inc_year_updated_link` | TEXT | Yes | |
| `center_timeline` | TEXT | Yes | |
| `center_end_year` | INTEGER | Yes | |
| `center_account_website` | TEXT | Yes | |
| `center_name` | TEXT | Yes | |
| `center_business_segment` | TEXT | Yes | |
| `center_business_sub_segment` | TEXT | Yes | |
| `center_management_partner` | TEXT | Yes | |
| `center_jv_status` | TEXT | Yes | |
| `center_jv_name` | TEXT | Yes | |
| `center_type` | TEXT | Yes | |
| `center_focus` | TEXT | Yes | |
| `center_source_link` | TEXT | Yes | |
| `center_website` | TEXT | Yes | |
| `center_linkedin` | TEXT | Yes | |
| `center_address` | TEXT | Yes | |
| `center_city` | TEXT | Yes | |
| `center_state` | TEXT | Yes | |
| `center_zip_code` | TEXT | Yes | |
| `center_country` | TEXT | Yes | |
| `lat` | DOUBLE PRECISION | Yes | |
| `lng` | DOUBLE PRECISION | Yes | |
| `center_region` | TEXT | Yes | |
| `center_boardline` | TEXT | Yes | |
| `center_employees` | INTEGER | Yes | |
| `center_employees_range` | TEXT | Yes | |
| `center_employees_range_source_link` | TEXT | Yes | |
| `center_services` | TEXT | Yes | |
| `center_first_year` | INTEGER | Yes | |
| `center_comments` | TEXT | Yes | |

### Services
Represents service offerings connected to centers.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `last_update_date` | TIMESTAMP | Yes | |
| `account_global_legal_name` | TEXT | Yes | |
| `cn_unique_key` | TEXT | Yes | |
| `center_name` | TEXT | Yes | |
| `center_type` | TEXT | Yes | |
| `center_focus` | TEXT | Yes | |
| `center_city` | TEXT | Yes | |
| `primary_service` | TEXT | Yes | |
| `focus_region` | TEXT | Yes | |
| `service_it` | TEXT | Yes | |
| `service_erd` | TEXT | Yes | |
| `service_fna` | TEXT | Yes | |
| `service_hr` | TEXT | Yes | |
| `service_procurement` | TEXT | Yes | |
| `service_sales_marketing` | TEXT | Yes | |
| `service_customer_support` | TEXT | Yes | |
| `service_others` | TEXT | Yes | |
| `software_vendor` | TEXT | Yes | |
| `software_in_use` | TEXT | Yes | |

### Functions
Represents business functions at centers.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `cn_unique_key` | TEXT | Yes | |
| `function_name` | TEXT | Yes | |

### Prospects
Represents contacts and leads tied to accounts or centers.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `last_update_date` | TIMESTAMP | Yes | |
| `account_global_legal_name` | TEXT | Yes | |
| `center_name` | TEXT | Yes | |
| `prospect_full_name` | TEXT | Yes | |
| `prospect_first_name` | TEXT | Yes | |
| `prospect_last_name` | TEXT | Yes | |
| `prospect_title` | TEXT | Yes | |
| `prospect_department` | TEXT | Yes | |
| `prospect_level` | TEXT | Yes | |
| `prospect_linkedin_url` | TEXT | Yes | |
| `prospect_email` | TEXT | Yes | |
| `prospect_city` | TEXT | Yes | |
| `prospect_state` | TEXT | Yes | |
| `prospect_country` | TEXT | Yes | |

---

## Application Architecture

### Server Actions
All database reads use Next.js Server Actions in `app/actions.ts`:
- retry logic for transient failures,
- in-memory caching with a 5-minute TTL,
- concurrent fetching for faster page loads,
- structured error handling with UI fallbacks.

### Performance and UX Optimizations
- memoized row components to reduce re-renders,
- `useMemo`/`useCallback` for derived data,
- `useDeferredValue` for filter-heavy UI,
- 150ms debounced search input,
- pagination defaults to 50 rows per page.

### Component Design
The UI is organized by feature folders for clarity:
charts, dialogs, filters, tables, tabs, and shared UI primitives.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run lint` | Run ESLint |

---

## Deployment

### Vercel (Recommended)
1. Push the repository to GitHub.
2. Import the repo in Vercel.
3. Configure environment variables in Vercel.
4. Deploy.

### Manual Deployment
1. Build:
   ```bash
   npm run build
   ```
2. Start:
   ```bash
   npm run start
   ```

---

## License

This project is proprietary software owned by ResearchNXT.

---

## Support

For questions or support, contact the ResearchNXT development team.
