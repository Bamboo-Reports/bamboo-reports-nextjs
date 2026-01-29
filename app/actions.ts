"use server"

import { neon, type NeonQueryFunction } from "@neondatabase/serverless"
import type { Account, Center, Function, Service, Tech, Prospect } from "@/lib/types"

// ============================================
// CONFIGURATION & SETUP
// ============================================

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface CachedData<T> {
  data: T
  timestamp: number
}

const dataCache = new Map<string, CachedData<unknown>>()

type SqlClient = NeonQueryFunction | null

let sql: SqlClient = null

try {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not configured")
  }
  sql = neon(process.env.DATABASE_URL, {
    fetchOptions: {
      cache: "no-store",
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
function setCachedData<T>(key: string, data: T): void {
  dataCache.set(key, { data, timestamp: Date.now() })
  console.log(`Cache set for: ${key}`)
}

function getSqlOrThrow(): NeonQueryFunction {
  if (!sql) {
    throw new Error("Database connection not initialized")
  }
  return sql
}

/**
 * Clear all cached data
 */
export async function clearCache(): Promise<{ success: boolean; message: string }> {
  dataCache.clear()
  console.log("Cache cleared")
  return { success: true, message: "Cache cleared successfully" }
}

// ============================================
// BASIC DATA FETCHING FUNCTIONS
// ============================================

export async function getAccounts(): Promise<Account[]> {
  try {
    const sqlClient = getSqlOrThrow()

    // Check cache first
    const cacheKey = "accounts"
    const cached = getCachedData<Account[]>(cacheKey)
    if (cached) return cached

    console.log("Fetching accounts from database...")
    const accounts = await fetchWithRetry(
      () => sqlClient`SELECT * FROM accounts ORDER BY account_global_legal_name`
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

export async function getCenters(): Promise<Center[]> {
  try {
    const sqlClient = getSqlOrThrow()

    // Check cache first
    const cacheKey = "centers"
    const cached = getCachedData<Center[]>(cacheKey)
    if (cached) return cached

    console.log("Fetching centers from database...")
    const centers = await fetchWithRetry(() => sqlClient`SELECT * FROM centers ORDER BY center_name`)
    console.log(`Successfully fetched ${centers.length} centers`)

    // Cache the result
    setCachedData(cacheKey, centers)

    return centers
  } catch (error) {
    console.error("Error fetching centers:", error)
    return []
  }
}

export async function getFunctions(): Promise<Function[]> {
  try {
    const sqlClient = getSqlOrThrow()

    // Check cache first
    const cacheKey = "functions"
    const cached = getCachedData<Function[]>(cacheKey)
    if (cached) return cached

    console.log("Fetching functions from database...")
    const functions = await fetchWithRetry(() => sqlClient`SELECT * FROM functions ORDER BY cn_unique_key`)
    console.log(`Successfully fetched ${functions.length} functions`)

    // Cache the result
    setCachedData(cacheKey, functions)

    return functions
  } catch (error) {
    console.error("Error fetching functions:", error)
    return []
  }
}

export async function getServices(): Promise<Service[]> {
  try {
    const sqlClient = getSqlOrThrow()

    // Check cache first
    const cacheKey = "services"
    const cached = getCachedData<Service[]>(cacheKey)
    if (cached) return cached

    console.log("Fetching services from database...")
    const services = await fetchWithRetry(() => sqlClient`SELECT * FROM services ORDER BY center_name`)
    console.log(`Successfully fetched ${services.length} services`)

    // Cache the result
    setCachedData(cacheKey, services)

    return services
  } catch (error) {
    console.error("Error fetching services:", error)
    return []
  }
}

export async function getTech(): Promise<Tech[]> {
  try {
    const sqlClient = getSqlOrThrow()

    const cacheKey = "tech"
    const cached = getCachedData<Tech[]>(cacheKey)
    if (cached) return cached

    console.log("Fetching tech stack from database...")
    const tech = await fetchWithRetry(
      () => sqlClient`SELECT * FROM tech ORDER BY account_global_legal_name, software_category, software_in_use`
    )
    console.log(`Successfully fetched ${tech.length} tech stack rows`)

    setCachedData(cacheKey, tech)

    return tech
  } catch (error) {
    console.error("Error fetching tech:", error)
    return []
  }
}

export async function getProspects(): Promise<Prospect[]> {
  try {
    const sqlClient = getSqlOrThrow()

    // Check cache first
    const cacheKey = "prospects"
    const cached = getCachedData<Prospect[]>(cacheKey)
    if (cached) return cached

    console.log("Fetching prospects from database...")
    const prospects = await fetchWithRetry(
      () => sqlClient`SELECT * FROM prospects ORDER BY prospect_last_name, prospect_first_name`
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

export async function saveFilterSet(
  name: string,
  filters: unknown
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const sqlClient = getSqlOrThrow()

    console.log("Saving filter set:", name)
    const result = await fetchWithRetry(
      () => sqlClient`
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

export async function getSavedFilters(): Promise<FilterSet[]> {
  try {
    const sqlClient = getSqlOrThrow()

    // Check cache first
    const cacheKey = "saved_filters"
    const cached = getCachedData<FilterSet[]>(cacheKey)
    if (cached) return cached

    console.log("Fetching saved filters...")
    const savedFilters = await fetchWithRetry(
      () => sqlClient`
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

export async function deleteSavedFilter(
  id: number
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const sqlClient = getSqlOrThrow()

    console.log("Deleting saved filter:", id)
    const result = await fetchWithRetry(
      () => sqlClient`
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

export async function updateSavedFilter(
  id: number,
  name: string,
  filters: unknown
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const sqlClient = getSqlOrThrow()

    console.log("Updating saved filter:", id, name)
    const result = await fetchWithRetry(
      () => sqlClient`
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

type AllDataResult = {
  accounts: Account[]
  centers: Center[]
  functions: Function[]
  services: Service[]
  tech: Tech[]
  prospects: Prospect[]
  error: string | null
}

export async function getAllData(): Promise<AllDataResult> {
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
    const cached = getCachedData<AllDataResult>(cacheKey)
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
}): Promise<{ success: boolean; data: Account[]; error?: string }> {
  try {
    const sqlClient = getSqlOrThrow()

    console.log("Fetching filtered accounts:", filters)

    // Build dynamic query
    let query = sqlClient`SELECT * FROM accounts WHERE 1=1`

    if (filters.countries && filters.countries.length > 0) {
      query = sqlClient`${query} AND account_hq_country = ANY(${filters.countries})`
    }

    if (filters.industries && filters.industries.length > 0) {
      query = sqlClient`${query} AND account_hq_industry = ANY(${filters.industries})`
    }

    query = sqlClient`${query} ORDER BY account_global_legal_name`

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

export async function testConnection(): Promise<{ success: boolean; message: string }> {
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
    const result = await fetchWithRetry(() => getSqlOrThrow()`SELECT 1 as test`)
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

export async function getDatabaseStatus(): Promise<{
  hasUrl: boolean
  hasConnection: boolean
  urlLength: number
  environment: string
  cacheSize: number
  cacheKeys: string[]
  error?: string
}> {
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

export async function loadData(_filters: unknown): Promise<{ success: boolean; data?: AllDataResult; error?: string }> {
  try {
    const data = await getAllData()
    return { success: true, data }
  } catch (error) {
    console.error("Error in loadData:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function exportToExcel(data: unknown[]): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
  try {
    // This function handles the Excel export
    // The actual Excel generation happens on the client side with the exceljs library
    return { success: true, downloadUrl: "#" }
  } catch (error) {
    console.error("Error in exportToExcel:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function loadFilterSets(): Promise<{ success: boolean; data?: FilterSet[]; error?: string }> {
  try {
    const filters = await getSavedFilters()
    return { success: true, data: filters }
  } catch (error) {
    console.error("Error loading filter sets:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function deleteFilterSet(id: number): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const result = await deleteSavedFilter(id)
    return result
  } catch (error) {
    console.error("Error deleting filter set:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
