# Bamboo Reports By ResearchNXT

A modern Business Intelligence Dashboard built with Next.js 14 and React 19. Provides intelligence-driven insights for managing accounts, centers, services, and prospects with advanced filtering, data visualization, and export capabilities.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Data Models](#data-models)
- [Architecture](#architecture)
- [Scripts](#scripts)
- [Deployment](#deployment)

---

## Features

### Dashboard & Visualization
- **Summary Cards** - Quick overview showing filtered vs. total counts for all data entities
- **Interactive Charts** - Pie and donut charts for categorical data breakdowns (region, nature, revenue, employees)
- **Tabbed Interface** - Organized views for Accounts, Centers, and Prospects
- **Interactive Map** - Mapbox GL-powered map showing center locations with clustering

### Advanced Filtering System
- **Multi-select Filters** - Filter by country, region, industry, category, nature, and more
- **Include/Exclude Mode** - Toggle between including or excluding selected values
- **Revenue Range Slider** - Filter accounts by revenue range
- **Keyword Search** - Search across account names and prospect titles
- **Saved Filters** - Save, load, update, and delete filter presets (persisted to database)
- **Real-time Updates** - Debounced auto-apply for smooth performance

### Data Management
- **Five Core Entities** - Accounts, Centers, Functions, Services, and Prospects
- **Paginated Tables** - Efficient display of large datasets (50 items per page)
- **Detail Dialogs** - Click any row to view complete details in a modal

### Export & Integration
- **Excel Export** - Export filtered data to `.xlsx` format
- **Multi-sheet Export** - Export all entities or selected tabs
- **Company Logos** - Automatic logo fetching via Logo.dev API

---

## Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.25 | React framework with App Router |
| React | 19 | UI library |
| TypeScript | 5 | Type-safe development |

### UI & Styling
| Technology | Purpose |
|------------|---------|
| Tailwind CSS 3.4 | Utility-first CSS framework |
| Shadcn/UI | Component library built on Radix UI |
| Radix UI | Accessible, unstyled UI primitives |
| Lucide React | Icon library |
| next-themes | Dark/light theme support |

### Data Visualization
| Technology | Purpose |
|------------|---------|
| Recharts 2.15 | React charting library |
| Mapbox GL 3.16 | Interactive maps |
| react-map-gl 8.1 | React wrapper for Mapbox |

### Database & Backend
| Technology | Purpose |
|------------|---------|
| Neon PostgreSQL | Serverless PostgreSQL database |
| Next.js Server Actions | Server-side data operations |

### Utilities
| Technology | Purpose |
|------------|---------|
| Zod | Schema validation |
| react-hook-form | Form handling |
| xlsx | Excel file generation |
| date-fns | Date utilities |

---

## Project Structure

```
bamboo-reports-nextjs/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main dashboard page
│   ├── layout.tsx                # Root layout with providers
│   ├── actions.ts                # Server actions for database ops
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── charts/                   # Chart components
│   │   └── donut-pie-chart.tsx   # Reusable pie/donut chart
│   │
│   ├── dashboard/                # Dashboard-specific components
│   │   └── summary-cards.tsx     # Summary statistics cards
│   │
│   ├── dialogs/                  # Modal dialogs
│   │   ├── account-details-dialog.tsx
│   │   ├── center-details-dialog.tsx
│   │   └── prospect-details-dialog.tsx
│   │
│   ├── filters/                  # Filtering components
│   │   ├── filter-sidebar.tsx    # Main filter panel
│   │   └── account-autocomplete.tsx
│   │
│   ├── layout/                   # Layout components
│   │   ├── header.tsx            # App header
│   │   └── footer.tsx            # App footer
│   │
│   ├── maps/                     # Map components
│   │   └── centers-map.tsx       # Mapbox center locations map
│   │
│   ├── states/                   # State components
│   │   ├── loading-state.tsx     # Loading skeleton
│   │   ├── error-state.tsx       # Error display
│   │   └── empty-state.tsx       # Empty data state
│   │
│   ├── tables/                   # Table row components
│   │   ├── account-row.tsx
│   │   ├── center-row.tsx
│   │   └── prospect-row.tsx
│   │
│   ├── tabs/                     # Tab content components
│   │   ├── accounts-tab.tsx
│   │   ├── centers-tab.tsx
│   │   └── prospects-tab.tsx
│   │
│   └── ui/                       # Shadcn/UI base components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── tabs.tsx
│       └── ...                   # 30+ UI components
│
├── lib/                          # Utilities and types
│   ├── types.ts                  # TypeScript interfaces
│   ├── utils.ts                  # cn() class utility
│   └── utils/                    # Helper functions
│       ├── chart-utils.ts        # Chart data preparation
│       ├── export-utils.ts       # Excel export functions
│       ├── filter-utils.ts       # Filter logic
│       └── ...
│
├── hooks/                        # Custom React hooks
│   └── use-data-loader.ts        # Data fetching hook
│
├── public/                       # Static assets
│   └── logos/                    # Company logos
│
├── tailwind.config.ts            # Tailwind configuration
├── components.json               # Shadcn/UI configuration
└── package.json                  # Dependencies and scripts
```

---

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm
- Neon PostgreSQL database
- Mapbox account (for maps)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/bamboo-reports-nextjs.git
   cd bamboo-reports-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration (see [Environment Variables](#environment-variables))

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

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

### Variable Details

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Yes | Mapbox access token for maps |
| `NEXT_PUBLIC_LOGO_DEV_TOKEN` | No | Logo.dev token for company logos |

---

## Data Models

### Account
Represents a company or organization in the system.

| Field | Type | Description |
|-------|------|-------------|
| `account_global_legal_name` | string | Primary identifier - company name |
| `account_hq_country` | string | Headquarters country |
| `account_hq_region` | string | Geographic region (Americas, EMEA, APAC) |
| `account_hq_industry` | string | Industry classification |
| `account_hq_sub_industry` | string | Sub-industry classification |
| `account_primary_category` | string | Primary business category |
| `account_primary_nature` | string | Nature of business |
| `account_hq_revenue` | number | Annual revenue |
| `account_hq_revenue_range` | string | Revenue range bracket |
| `account_hq_employee_count` | number | Total employee count |
| `account_hq_employee_range` | string | Employee range bracket |
| `account_nasscom_status` | string | NASSCOM membership status |
| `account_hq_forbes_2000_rank` | number | Forbes 2000 ranking |
| `account_hq_fortune_500_rank` | number | Fortune 500 ranking |

### Center
Represents a business/service center belonging to an account.

| Field | Type | Description |
|-------|------|-------------|
| `cn_unique_key` | string | Unique identifier |
| `account_global_legal_name` | string | Parent account reference |
| `center_name` | string | Center name |
| `center_type` | string | Type of center |
| `center_focus` | string | Primary focus area |
| `center_city` | string | City location |
| `center_state` | string | State/province |
| `center_country` | string | Country |
| `center_status` | string | Operational status |
| `center_employees` | number | Employee count |
| `lat` / `lng` | number | Geographic coordinates |

### Prospect
Represents a contact or lead associated with an account.

| Field | Type | Description |
|-------|------|-------------|
| `account_global_legal_name` | string | Associated account |
| `prospect_first_name` | string | First name |
| `prospect_last_name` | string | Last name |
| `prospect_title` | string | Job title |
| `prospect_department` | string | Department |
| `prospect_level` | string | Seniority level |
| `prospect_linkedin_url` | string | LinkedIn profile URL |
| `prospect_email` | string | Email address |

### Service
Represents services offered at a center.

| Field | Type | Description |
|-------|------|-------------|
| `cn_unique_key` | string | Center reference |
| `primary_service` | string | Primary service type |
| `service_it` | string | IT services offered |
| `service_erd` | string | ERD services offered |
| `service_fna` | string | Finance & Accounting |
| `service_hr` | string | HR services offered |

### Function
Represents business functions at a center.

| Field | Type | Description |
|-------|------|-------------|
| `cn_unique_key` | string | Center reference |
| `function_name` | string | Function name |

---

## Architecture

### Server Actions
All database operations use Next.js Server Actions (`app/actions.ts`) with:
- **Retry Logic** - Automatic retries for failed queries
- **In-memory Caching** - 5-minute TTL for improved performance
- **Parallel Fetching** - Concurrent data loading
- **Error Handling** - Graceful error management

### Performance Optimizations
- **React.memo** - Memoized table row components
- **useMemo / useCallback** - Optimized re-renders
- **useDeferredValue** - Deferred filter updates
- **Debounced Search** - 150ms debounce on search input
- **Pagination** - 50 items per page default

### Component Architecture
The codebase follows a modular component structure:
- Main page reduced from 2,250 lines to ~1,000 lines through refactoring
- Components organized by feature (charts, dialogs, filters, tables, tabs)
- Shared UI components via Shadcn/UI

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

---

## License

This project is proprietary software owned by ResearchNXT.

---

## Support

For questions or support, please contact the development team.
