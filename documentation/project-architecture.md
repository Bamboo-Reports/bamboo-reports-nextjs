# Project Architecture

This document describes the high-level architecture of the Bamboo Reports application, focusing on data flow, state management, and the server-client boundary.

## 1. Core Architecture Pattern: Server Actions & Client Components

The application uses the **Next.js App Router** with a heavy reliance on **Server Actions** for data fetching. This eliminates the need for a separate API layer (REST/GraphQL) for internal data.

### Data Flow Diagram

1.  **User Interaction** (e.g., Selects "Region: North America")
2.  **State Update** (React state in `useDashboardFilters` updates)
3.  **Derived Data** (Client-side filtering + chart aggregation in `lib/dashboard/*`)
4.  **UI Render** (Tables/Charts update with new props)

---

## 2. Directory Structure & Responsibilities

### 2.1 `app/` (Routes & Actions)
-   **`actions.ts`**: The "Backend" of the frontend.
    -   Contains all direct SQL queries using `@neondatabase/serverless`.
    -   Implements retries and in-memory caching (`dataCache` Map).
    -   **Rule:** Database connection logic lives ONLY here. Components should never import DB drivers directly.
-   **`page.tsx`**: The entry point and UI orchestrator. Wires auth, data loading, filtering hooks, and layout composition.

### 2.2 `components/` (UI Composition)
-   **`filters/filters-sidebar.tsx`**: Composes filter sections and saved-filter controls; state lives in hooks at the page level.
-   **`saved-filters-manager.tsx`**: Encapsulates all Supabase interaction for saving/loading user preferences.

### 2.3 `lib/` (Utilities)
-   **`supabase/client.ts`**: Singleton for the Supabase Auth client.
-   **`utils/chart-helpers.ts`**: Pure functions that transform raw DB rows into Recharts-friendly arrays (e.g., grouping by Region).
-   **`utils/filter-helpers.ts`**: Client-side filtering logic (used for smaller datasets or optimistic UI updates).

---

## 3. State Management Strategy

### 3.1 Filter State
The filter state is a complex object defined in `lib/types.ts` (`Filters` interface).
-   **Source of Truth:** The top-level `DashboardContent` component.
-   **Persistence:**
    -   **Short-term:** React `useState`.
    -   **Long-term:** Saved to Supabase via `SavedFiltersManager`.
-   **Optimization:**
    -   **Debouncing:** Search inputs are debounced (300ms) to prevent excessive DB calls.
    -   **Memoization:** `React.memo` is used on `AccountRow`, `CenterRow`, etc., to prevent re-rendering the entire table when only filters change.

### 3.2 Authentication State
Managed globally by Supabase Auth Helpers.
-   **Session:** Stored in HTTP-only cookies.
-   **Access:** Components check `supabase.auth.getSession()` or use the `useSession` hook (if using the provider wrapper).

---

## 4. Database Layer (Neon PostgreSQL)

We use raw SQL (via template literals) instead of an ORM (like Prisma) for maximum control over performance and query structure.

### Query Pattern
```typescript
// app/actions.ts
const results = await fetchWithRetry(() => sql`
  SELECT * FROM accounts 
  WHERE account_region = ${region}
  ORDER BY revenue DESC
  LIMIT 50
`)
```

-   **Safety:** Parameterized queries prevent SQL injection.
-   **Performance:** We use `Promise.all` in `getAllData` to fetch Accounts, Centers, and Prospects concurrently.

---

## 5. External Integrations

### 5.1 MapTiler + MapLibre
-   Used in `components/maps/centers-map.tsx`.
-   **Rendering:** Client-side only. Requires a `useEffect` to initialize the map instance on the DOM node.
-   **Data:** Receives a list of `{ lat, lng, name }` objects from the parent.

### 5.2 Logo.dev
-   Used in `components/ui/company-logo.tsx`.
-   **Mechanism:** Constructs a URL `https://img.logo.dev/{domain}?token=...`.
-   **Fallback:** Renders a colored badge with initials if the image fails to load.
