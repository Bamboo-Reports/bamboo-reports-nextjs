"use server"

import { neon } from "@neondatabase/serverless"

// ============================================
// CONFIGURATION & SETUP
// ============================================

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const dataCache = new Map<string, { data: any; timestamp: number }>()

// Initialize the SQL client with error handling and connection pooling
let sql: any = null

try {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not configured")
  }
  sql = neon(process.env.DATABASE_URL, {
    fetchOptions: {
      cache: "no-store", // Disable caching for dynamic data
    },
  })
} catch (error) {
  console.error("Failed to initialize database connection:", error)
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Retry logic for database operations
 */
async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error)
      if (i === retries - 1) throw error
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
  throw new Error("Max retries reached")
}

/**
 * Get data from cache or fetch if expired
 */
function getCachedData<T>(key: string): T | null {
  const cached = dataCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Cache hit for: ${key}`)
    return cached.data as T
  }
  return null
}

/**
 * Set data in cache
 */
function setCachedData(key: string, data: any): void {
  dataCache.set(key, { data, timestamp: Date.now() })
  console.log(`Cache set for: ${key}`)
}

/**
 * Clear all cached data
 */
export async function clearCache() {
  dataCache.clear()
  console.log("Cache cleared")
  return { success: true, message: "Cache cleared successfully" }
}

// ============================================
// BASIC DATA FETCHING FUNCTIONS
// ============================================

export async function getAccounts() {
  try {
    if (!sql) {
      throw new Error("Database connection not initialized")
    }

    // Check cache first
    const cacheKey = "accounts"
    const cached = getCachedData(cacheKey)
    if (cached) return cached

    console.log("Fetching accounts from database...")
    const accounts = await fetchWithRetry(
      () => sql`SELECT * FROM accounts ORDER BY account_global_legal_name`
    )
    console.log(`Successfully fetched ${accounts.length} accounts`)

    // Cache the result
    setCachedData(cacheKey, accounts)

    return accounts
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return []
  }
}

export async function getCenters() {
  try {
    if (!sql) {
      throw new Error("Database connection not initialized")
    }

    // Check cache first
    const cacheKey = "centers"
    const cached = getCachedData(cacheKey)
    if (cached) return cached

    console.log("Fetching centers from database...")
    const centers = await fetchWithRetry(() => sql`SELECT * FROM centers ORDER BY center_name`)
    console.log(`Successfully fetched ${centers.length} centers`)

    // Cache the result
    setCachedData(cacheKey, centers)

    return centers
  } catch (error) {
    console.error("Error fetching centers:", error)
    return []
  }
}

export async function getFunctions() {
  try {
    if (!sql) {
      throw new Error("Database connection not initialized")
    }

    // Check cache first
    const cacheKey = "functions"
    const cached = getCachedData(cacheKey)
    if (cached) return cached

    console.log("Fetching functions from database...")
    const functions = await fetchWithRetry(() => sql`SELECT * FROM functions ORDER BY cn_unique_key`)
    console.log(`Successfully fetched ${functions.length} functions`)

    // Cache the result
    setCachedData(cacheKey, functions)

    return functions
  } catch (error) {
    console.error("Error fetching functions:", error)
    return []
  }
}

export async function getServices() {
  try {
    if (!sql) {
      throw new Error("Database connection not initialized")
    }

    // Check cache first
    const cacheKey = "services"
    const cached = getCachedData(cacheKey)
    if (cached) return cached

    console.log("Fetching services from database...")
    const services = await fetchWithRetry(() => sql`SELECT * FROM services ORDER BY center_name`)
    console.log(`Successfully fetched ${services.length} services`)

    // Cache the result
    setCachedData(cacheKey, services)

    return services
  } catch (error) {
    console.error("Error fetching services:", error)
    return []
  }
}

export async function getTech() {
  try {
    if (!sql) {
      throw new Error("Database connection not initialized")
    }

    const cacheKey = "tech"
    const cached = getCachedData(cacheKey)
    if (cached) return cached

    console.log("Fetching tech stack from database...")
    const tech = await fetchWithRetry(
      () => sql`SELECT * FROM tech ORDER BY account_global_legal_name, software_category, software_in_use`
    )
    console.log(`Successfully fetched ${tech.length} tech stack rows`)

    setCachedData(cacheKey, tech)

    return tech
  } catch (error) {
    console.error("Error fetching tech:", error)
    return []
  }
}

export async function getProspects() {
  try {
    if (!sql) {
      throw new Error("Database connection not initialized")
    }

    // Check cache first
    const cacheKey = "prospects"
    const cached = getCachedData(cacheKey)
    if (cached) return cached

    console.log("Fetching prospects from database...")
    const prospects = await fetchWithRetry(
      () => sql`SELECT * FROM prospects ORDER BY prospect_last_name, prospect_first_name`
    )
    console.log(`Successfully fetched ${prospects.length} prospects`)

    // Cache the result
    setCachedData(cacheKey, prospects)

    return prospects
  } catch (error) {
    console.error("Error fetching prospects:", error)
    return []
  }
}

// ============================================
// SAVED FILTERS FUNCTIONS
// ============================================

export async function saveFilterSet(name: string, filters: any) {
  try {
    if (!sql) {
      throw new Error("Database connection not initialized")
    }

    console.log("Saving filter set:", name)
    const result = await fetchWithRetry(
      () => sql`
        INSERT INTO saved_filters (name, filters)
        VALUES (${name}, ${JSON.stringify(filters)})
        RETURNING id, name, created_at
      `
    )
    console.log("Successfully saved filter set:", result[0])

    // Invalidate saved filters cache
    dataCache.delete("saved_filters")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error saving filter set:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getSavedFilters() {
  try {
    if (!sql) {
      throw new Error("Database connection not initialized")
    }

    // Check cache first
    const cacheKey = "saved_filters"
    const cached = getCachedData(cacheKey)
    if (cached) return cached

    console.log("Fetching saved filters...")
    const savedFilters = await fetchWithRetry(
      () => sql`
        SELECT id, name, filters, created_at, updated_at 
        FROM saved_filters 
        ORDER BY created_at DESC
      `
    )
    console.log(`Successfully fetched ${savedFilters.length} saved filters`)

    // Cache the result
    setCachedData(cacheKey, savedFilters)

    return savedFilters
  } catch (error) {
    console.error("Error fetching saved filters:", error)
    return []
  }
}

export async function deleteSavedFilter(id: number) {
  try {
    if (!sql) {
      throw new Error("Database connection not initialized")
    }

    console.log("Deleting saved filter:", id)
    const result = await fetchWithRetry(
      () => sql`
        DELETE FROM saved_filters 
        WHERE id = ${id}
        RETURNING id, name
      `
    )
    console.log("Successfully deleted filter set:", result[0])

    // Invalidate saved filters cache
    dataCache.delete("saved_filters")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error deleting saved filter:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function updateSavedFilter(id: number, name: string, filters: any) {
  try {
    if (!sql) {
      throw new Error("Database connection not initialized")
    }

    console.log("Updating saved filter:", id, name)
    const result = await fetchWithRetry(
      () => sql`
        UPDATE saved_filters 
        SET name = ${name}, filters = ${JSON.stringify(filters)}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id, name, updated_at
      `
    )
    console.log("Successfully updated filter set:", result[0])

    // Invalidate saved filters cache
    dataCache.delete("saved_filters")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating saved filter:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// ============================================
// AGGREGATED DATA FUNCTIONS
// ============================================

export async function getAllData() {
  try {
    console.time("getAllData total")
    console.log("Starting to fetch all data from database...")

    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL environment variable is not set")
      return {
        accounts: [],
        centers: [],
        functions: [],
        services: [],
        tech: [],
        prospects: [],
        error: "Database configuration missing",
      }
    }

    if (!sql) {
      console.error("Database connection not initialized")
      return {
        accounts: [],
        centers: [],
        functions: [],
        services: [],
        tech: [],
        prospects: [],
        error: "Database connection failed",
      }
    }

    // Check cache first for all data
    const cacheKey = "all_data"
    const cached = getCachedData(cacheKey)
    if (cached) {
      console.log("Returning all data from cache")
      return cached
    }

    // Fetch all data in parallel with retry logic
    console.time("getAllData parallel fetch")
    const [accounts, centers, functions, services, tech, prospects] = await Promise.all([
      (async () => {
        console.time("getAllData accounts")
        const result = await getAccounts()
        console.timeEnd("getAllData accounts")
        return result
      })(),
      (async () => {
        console.time("getAllData centers")
        const result = await getCenters()
        console.timeEnd("getAllData centers")
        return result
      })(),
      (async () => {
        console.time("getAllData functions")
        const result = await getFunctions()
        console.timeEnd("getAllData functions")
        return result
      })(),
      (async () => {
        console.time("getAllData services")
        const result = await getServices()
        console.timeEnd("getAllData services")
        return result
      })(),
      (async () => {
        console.time("getAllData tech")
        const result = await getTech()
        console.timeEnd("getAllData tech")
        return result
      })(),
      (async () => {
        console.time("getAllData prospects")
        const result = await getProspects()
        console.timeEnd("getAllData prospects")
        return result
      })(),
    ])
    console.timeEnd("getAllData parallel fetch")

    console.log("Successfully fetched all data:", {
      accounts: accounts.length,
      centers: centers.length,
      functions: functions.length,
      services: services.length,
      tech: tech.length,
      prospects: prospects.length,
    })

    const allData = {
      accounts,
      centers,
      functions,
      services,
      tech,
      prospects,
      error: null,
    }

    // Cache all data together
    setCachedData(cacheKey, allData)

    console.timeEnd("getAllData total")
    return allData
  } catch (error) {
    console.error("Error fetching all data:", error)
    return {
      accounts: [],
      centers: [],
      functions: [],
      services: [],
      tech: [],
      prospects: [],
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}

// ============================================
// SERVER-SIDE FILTERING (ADVANCED - OPTIONAL)
// ============================================

/**
 * Get filtered accounts from server side
 * This is more efficient for large datasets
 */
export async function getFilteredAccounts(filters: {
  countries?: string[]
  industries?: string[]
}) {
  try {
    if (!sql) {
      throw new Error("Database connection not initialized")
    }

    console.log("Fetching filtered accounts:", filters)

    // Build dynamic query
  let query = sql`SELECT * FROM accounts WHERE 1=1`

    if (filters.countries && filters.countries.length > 0) {
      query = sql`${query} AND account_hq_country = ANY(${filters.countries})`
    }

    if (filters.industries && filters.industries.length > 0) {
      query = sql`${query} AND account_hq_industry = ANY(${filters.industries})`
    }

    query = sql`${query} ORDER BY account_global_legal_name`

    const results = await fetchWithRetry(() => query)
    console.log(`Filtered accounts: ${results.length} results`)

    return { success: true, data: results }
  } catch (error) {
    console.error("Error fetching filtered accounts:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error", data: [] }
  }
}

// ============================================
// DATABASE HEALTH & DIAGNOSTICS
// ============================================

export async function testConnection() {
  try {
    if (!process.env.DATABASE_URL) {
      return {
        success: false,
        message: "DATABASE_URL environment variable is not configured",
      }
    }

    if (!sql) {
      return {
        success: false,
        message: "Database connection could not be initialized",
      }
    }

    console.log("Testing database connection...")
    const result = await fetchWithRetry(() => sql`SELECT 1 as test`)
    console.log("Database connection successful:", result)
    return { success: true, message: "Database connection successful" }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function getDatabaseStatus() {
  try {
    const hasUrl = !!process.env.DATABASE_URL
    const hasConnection = !!sql

    return {
      hasUrl,
      hasConnection,
      urlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
      environment: process.env.NODE_ENV || "unknown",
      cacheSize: dataCache.size,
      cacheKeys: Array.from(dataCache.keys()),
    }
  } catch (error) {
    return {
      hasUrl: false,
      hasConnection: false,
      urlLength: 0,
      environment: "unknown",
      cacheSize: 0,
      cacheKeys: [],
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// ============================================
// TYPESCRIPT INTERFACES
// ============================================

export interface FilterSet {
  id?: number
  name: string
  filters: {
    accounts?: string[]
    centers?: string[]
    functions?: string[]
    services?: string[]
  }
  created_at?: string
  updated_at?: string
}

// ============================================
// LEGACY COMPATIBILITY FUNCTIONS
// ============================================

export async function loadData(filters: any) {
  try {
    const data = await getAllData()
    return { success: true, data }
  } catch (error) {
    console.error("Error in loadData:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function exportToExcel(data: any[]) {
  try {
    // This function handles the Excel export
    // The actual Excel generation happens on the client side with the xlsx library
    return { success: true, downloadUrl: "#" }
  } catch (error) {
    console.error("Error in exportToExcel:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function loadFilterSets() {
  try {
    const filters = await getSavedFilters()
    return { success: true, data: filters }
  } catch (error) {
    console.error("Error loading filter sets:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function deleteFilterSet(id: number) {
  try {
    const result = await deleteSavedFilter(id)
    return result
  } catch (error) {
    console.error("Error deleting filter set:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
