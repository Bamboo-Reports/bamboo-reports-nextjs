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

### Account
Represents a company or organization.

| Field | Type | Description |
|-------|------|-------------|
| `account_global_legal_name` | string | Primary identifier |
| `account_hq_country` | string | Headquarters country |
| `account_hq_region` | string | Region (Americas, EMEA, APAC) |
| `account_hq_industry` | string | Industry |
| `account_hq_sub_industry` | string | Sub-industry |
| `account_primary_category` | string | Primary category |
| `account_primary_nature` | string | Primary nature |
| `account_hq_revenue` | number | Annual revenue |
| `account_hq_revenue_range` | string | Revenue bracket |
| `account_hq_employee_count` | number | Employee count |
| `account_hq_employee_range` | string | Employee bracket |
| `account_nasscom_status` | string | NASSCOM status |
| `account_hq_forbes_2000_rank` | number | Forbes 2000 rank |
| `account_hq_fortune_500_rank` | number | Fortune 500 rank |

### Center
Represents an account-owned business/service center.

| Field | Type | Description |
|-------|------|-------------|
| `cn_unique_key` | string | Unique identifier |
| `account_global_legal_name` | string | Parent account |
| `center_name` | string | Center name |
| `center_type` | string | Center type |
| `center_focus` | string | Focus area |
| `center_city` | string | City |
| `center_state` | string | State/province |
| `center_country` | string | Country |
| `center_status` | string | Operational status |
| `center_employees` | number | Employee count |
| `lat` / `lng` | number | Coordinates |

### Prospect
Represents a lead/contact tied to an account.

| Field | Type | Description |
|-------|------|-------------|
| `account_global_legal_name` | string | Associated account |
| `prospect_first_name` | string | First name |
| `prospect_last_name` | string | Last name |
| `prospect_title` | string | Job title |
| `prospect_department` | string | Department |
| `prospect_level` | string | Seniority |
| `prospect_linkedin_url` | string | LinkedIn URL |
| `prospect_email` | string | Email |

### Service
Represents services offered at a center.

| Field | Type | Description |
|-------|------|-------------|
| `cn_unique_key` | string | Center reference |
| `primary_service` | string | Primary service type |
| `service_it` | string | IT services |
| `service_erd` | string | ERD services |
| `service_fna` | string | Finance and Accounting |
| `service_hr` | string | HR services |

### Function
Represents business functions at a center.

| Field | Type | Description |
|-------|------|-------------|
| `cn_unique_key` | string | Center reference |
| `function_name` | string | Function name |

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
