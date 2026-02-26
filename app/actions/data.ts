"use server"

import type { Account, Center, Function, Service, Tech, Prospect } from "@/lib/types"
import { getSqlOrThrow, fetchWithRetry } from "@/lib/db/connection"

// ============================================
// BASIC DATA FETCHING FUNCTIONS
// ============================================

export async function getAccounts(): Promise<Account[]> {
  try {
    const sqlClient = getSqlOrThrow()

    console.log("Fetching accounts from database...")
    const accounts = (await fetchWithRetry(
      () => sqlClient`SELECT * FROM accounts ORDER BY account_global_legal_name`
    )) as Account[]
    console.log(`Successfully fetched ${accounts.length} accounts`)

    return accounts
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return []
  }
}

export async function getCenters(): Promise<Center[]> {
  try {
    const sqlClient = getSqlOrThrow()

    console.log("Fetching centers from database...")
    const centers = (await fetchWithRetry(() => sqlClient`SELECT * FROM centers ORDER BY center_name`)) as Center[]
    console.log(`Successfully fetched ${centers.length} centers`)

    return centers
  } catch (error) {
    console.error("Error fetching centers:", error)
    return []
  }
}

export async function getFunctions(): Promise<Function[]> {
  try {
    const sqlClient = getSqlOrThrow()

    console.log("Fetching functions from database...")
    const functions = (await fetchWithRetry(() => sqlClient`SELECT * FROM functions ORDER BY cn_unique_key`)) as Function[]
    console.log(`Successfully fetched ${functions.length} functions`)

    return functions
  } catch (error) {
    console.error("Error fetching functions:", error)
    return []
  }
}

export async function getServices(): Promise<Service[]> {
  try {
    const sqlClient = getSqlOrThrow()

    console.log("Fetching services from database...")
    const services = (await fetchWithRetry(() => sqlClient`SELECT * FROM services ORDER BY center_name`)) as Service[]
    console.log(`Successfully fetched ${services.length} services`)

    return services
  } catch (error) {
    console.error("Error fetching services:", error)
    return []
  }
}

export async function getTech(): Promise<Tech[]> {
  try {
    const sqlClient = getSqlOrThrow()

    console.log("Fetching tech stack from database...")
    const tech = (await fetchWithRetry(
      () => sqlClient`SELECT * FROM tech ORDER BY account_global_legal_name, software_category, software_in_use`
    )) as Tech[]
    console.log(`Successfully fetched ${tech.length} tech stack rows`)

    return tech
  } catch (error) {
    console.error("Error fetching tech:", error)
    return []
  }
}

export async function getProspects(): Promise<Prospect[]> {
  try {
    const sqlClient = getSqlOrThrow()

    console.log("Fetching prospects from database...")
    const prospects = (await fetchWithRetry(
      () => sqlClient`SELECT * FROM prospects ORDER BY prospect_last_name, prospect_first_name`
    )) as Prospect[]
    console.log(`Successfully fetched ${prospects.length} prospects`)

    return prospects
  } catch (error) {
    console.error("Error fetching prospects:", error)
    return []
  }
}

// ============================================
// AGGREGATED DATA FUNCTIONS
// ============================================

export type AllDataResult = {
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
    
    // Ensure we can get the SQL client
    try {
        getSqlOrThrow()
    } catch {
        // If we can't get the SQL client, check why
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

    const allData: AllDataResult = {
      accounts,
      centers,
      functions,
      services,
      tech,
      prospects,
      error: null,
    }

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

    const results = (await fetchWithRetry(() => query)) as Account[]
    console.log(`Filtered accounts: ${results.length} results`)

    return { success: true, data: results }
  } catch (error) {
    console.error("Error fetching filtered accounts:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error", data: [] }
  }
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
