"use server"

import { neon, type NeonQueryFunction } from "@neondatabase/serverless"
import type { Account, Center, Function, Service, Tech, Prospect } from "@/lib/types"

const CACHE_DURATION = 5 * 60 * 1000

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

const logCacheHit = (key: string): void => {
  console.log(`Cache hit for: ${key}`)
}

const logCacheSet = (key: string): void => {
  console.log(`Cache set for: ${key}`)
}

const getSqlOrThrow = (): NeonQueryFunction => {
  if (!sql) {
    throw new Error("Database connection not initialized")
  }
  return sql
}

const getCachedData = <T,>(key: string): T | null => {
  const cached = dataCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    logCacheHit(key)
    return cached.data as T
  }
  return null
}

const setCachedData = <T,>(key: string, data: T): void => {
  dataCache.set(key, { data, timestamp: Date.now() })
  logCacheSet(key)
}

const clearCachedKey = (key: string): void => {
  dataCache.delete(key)
}

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i += 1) {
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

export async function clearCache(): Promise<{ success: boolean; message: string }> {
  dataCache.clear()
  console.log("Cache cleared")
  return { success: true, message: "Cache cleared successfully" }
}

const fetchWithCache = async <T,>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  emptyValue: T
): Promise<T> => {
  const cached = getCachedData<T>(cacheKey)
  if (cached) return cached

  try {
    const data = await fetchWithRetry(fetcher)
    setCachedData(cacheKey, data)
    return data
  } catch (error) {
    console.error(`Error fetching ${cacheKey}:`, error)
    return emptyValue
  }
}

export async function getAccounts(): Promise<Account[]> {
  const sqlClient = getSqlOrThrow()
  console.log("Fetching accounts from database...")
  const accounts = await fetchWithCache(
    "accounts",
    () => sqlClient`SELECT * FROM accounts ORDER BY account_global_legal_name`,
    [] as Account[]
  )
  console.log(`Successfully fetched ${accounts.length} accounts`)
  return accounts
}

export async function getCenters(): Promise<Center[]> {
  const sqlClient = getSqlOrThrow()
  console.log("Fetching centers from database...")
  const centers = await fetchWithCache(
    "centers",
    () => sqlClient`SELECT * FROM centers ORDER BY center_name`,
    [] as Center[]
  )
  console.log(`Successfully fetched ${centers.length} centers`)
  return centers
}

export async function getFunctions(): Promise<Function[]> {
  const sqlClient = getSqlOrThrow()
  console.log("Fetching functions from database...")
  const functions = await fetchWithCache(
    "functions",
    () => sqlClient`SELECT * FROM functions ORDER BY cn_unique_key`,
    [] as Function[]
  )
  console.log(`Successfully fetched ${functions.length} functions`)
  return functions
}

export async function getServices(): Promise<Service[]> {
  const sqlClient = getSqlOrThrow()
  console.log("Fetching services from database...")
  const services = await fetchWithCache(
    "services",
    () => sqlClient`SELECT * FROM services ORDER BY center_name`,
    [] as Service[]
  )
  console.log(`Successfully fetched ${services.length} services`)
  return services
}

export async function getTech(): Promise<Tech[]> {
  const sqlClient = getSqlOrThrow()
  console.log("Fetching tech stack from database...")
  const tech = await fetchWithCache(
    "tech",
    () =>
      sqlClient`SELECT * FROM tech ORDER BY account_global_legal_name, software_category, software_in_use`,
    [] as Tech[]
  )
  console.log(`Successfully fetched ${tech.length} tech stack rows`)
  return tech
}

export async function getProspects(): Promise<Prospect[]> {
  const sqlClient = getSqlOrThrow()
  console.log("Fetching prospects from database...")
  const prospects = await fetchWithCache(
    "prospects",
    () => sqlClient`SELECT * FROM prospects ORDER BY prospect_last_name, prospect_first_name`,
    [] as Prospect[]
  )
  console.log(`Successfully fetched ${prospects.length} prospects`)
  return prospects
}

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

    clearCachedKey("saved_filters")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error saving filter set:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getSavedFilters(): Promise<FilterSet[]> {
  const sqlClient = getSqlOrThrow()
  console.log("Fetching saved filters...")

  const savedFilters = await fetchWithCache(
    "saved_filters",
    () =>
      sqlClient`
        SELECT id, name, filters, created_at, updated_at 
        FROM saved_filters 
        ORDER BY created_at DESC
      `,
    [] as FilterSet[]
  )

  console.log(`Successfully fetched ${savedFilters.length} saved filters`)
  return savedFilters
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

    clearCachedKey("saved_filters")

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

    clearCachedKey("saved_filters")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating saved filter:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

type AllDataResult = {
  accounts: Account[]
  centers: Center[]
  functions: Function[]
  services: Service[]
  tech: Tech[]
  prospects: Prospect[]
  error: string | null
}

const emptyAllDataResult: AllDataResult = {
  accounts: [],
  centers: [],
  functions: [],
  services: [],
  tech: [],
  prospects: [],
  error: null,
}

const buildAllDataError = (error: string): AllDataResult => ({
  ...emptyAllDataResult,
  error,
})

export async function getAllData(): Promise<AllDataResult> {
  try {
    console.time("getAllData total")
    console.log("Starting to fetch all data from database...")

    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL environment variable is not set")
      return buildAllDataError("Database configuration missing")
    }

    if (!sql) {
      console.error("Database connection not initialized")
      return buildAllDataError("Database connection failed")
    }

    const cacheKey = "all_data"
    const cached = getCachedData<AllDataResult>(cacheKey)
    if (cached) {
      console.log("Returning all data from cache")
      return cached
    }

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

    setCachedData(cacheKey, allData)

    console.timeEnd("getAllData total")
    return allData
  } catch (error) {
    console.error("Error fetching all data:", error)
    return buildAllDataError(error instanceof Error ? error.message : "Unknown database error")
  }
}

export async function getFilteredAccounts(filters: {
  countries?: string[]
  industries?: string[]
}): Promise<{ success: boolean; data: Account[]; error?: string }> {
  try {
    const sqlClient = getSqlOrThrow()

    console.log("Fetching filtered accounts:", filters)

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

export async function loadData(
  _filters: unknown
): Promise<{ success: boolean; data?: AllDataResult; error?: string }> {
  try {
    const data = await getAllData()
    return { success: true, data }
  } catch (error) {
    console.error("Error in loadData:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function exportToExcel(
  _data: unknown[]
): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
  try {
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
