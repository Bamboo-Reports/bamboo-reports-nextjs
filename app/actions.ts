"use server"

import { neon } from "@neondatabase/serverless"

// Initialize the SQL client with error handling
let sql: any = null

try {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not configured")
  }
  sql = neon(process.env.DATABASE_URL)
} catch (error) {
  console.error("Failed to initialize database connection:", error)
}

export async function getAccounts() {
  try {
    if (!sql) {
      throw new Error("Database connection not initialized")
    }

    console.log("Fetching accounts from database...")
    const accounts = await sql`SELECT * FROM accounts ORDER BY "ACCOUNT NAME"`
    console.log(`Successfully fetched ${accounts.length} accounts`)
    return accounts
  } catch (error) {
    console.error("Error fetching accounts:", error)
    // Return empty array instead of throwing to prevent app crash
    return []
  }
}

export async function getCenters() {
  try {
    if (!sql) {
      throw new Error("Database connection not initialized")
    }

    console.log("Fetching centers from database...")
    const centers = await sql`SELECT * FROM centers ORDER BY "CENTER NAME"`
    console.log(`Successfully fetched ${centers.length} centers`)
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

    console.log("Fetching functions from database...")
    const functions = await sql`SELECT * FROM functions ORDER BY "CN UNIQUE KEY"`
    console.log(`Successfully fetched ${functions.length} functions`)
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

    console.log("Fetching services from database...")
    const services = await sql`SELECT * FROM services ORDER BY "CENTER NAME"`
    console.log(`Successfully fetched ${services.length} services`)
    return services
  } catch (error) {
    console.error("Error fetching services:", error)
    return []
  }
}

// Saved Filters Functions
export async function saveFilterSet(name: string, filters: any) {
  try {
    if (!sql) {
      throw new Error("Database connection not initialized")
    }

    console.log("Saving filter set:", name)
    const result = await sql`
      INSERT INTO saved_filters (name, filters)
      VALUES (${name}, ${JSON.stringify(filters)})
      RETURNING id, name, created_at
    `
    console.log("Successfully saved filter set:", result[0])
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

    console.log("Fetching saved filters...")
    const savedFilters = await sql`
      SELECT id, name, filters, created_at, updated_at 
      FROM saved_filters 
      ORDER BY created_at DESC
    `
    console.log(`Successfully fetched ${savedFilters.length} saved filters`)
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
    const result = await sql`
      DELETE FROM saved_filters 
      WHERE id = ${id}
      RETURNING id, name
    `
    console.log("Successfully deleted filter set:", result[0])
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
    const result = await sql`
      UPDATE saved_filters 
      SET name = ${name}, filters = ${JSON.stringify(filters)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, name, updated_at
    `
    console.log("Successfully updated filter set:", result[0])
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating saved filter:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getAllData() {
  try {
    console.log("Starting to fetch all data from database...")

    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL environment variable is not set")
      return {
        accounts: [],
        centers: [],
        functions: [],
        services: [],
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
        error: "Database connection failed",
      }
    }

    const [accounts, centers, functions, services] = await Promise.all([
      getAccounts(),
      getCenters(),
      getFunctions(),
      getServices(),
    ])

    console.log("Successfully fetched all data:", {
      accounts: accounts.length,
      centers: centers.length,
      functions: functions.length,
      services: services.length,
    })

    return {
      accounts,
      centers,
      functions,
      services,
      error: null,
    }
  } catch (error) {
    console.error("Error fetching all data:", error)
    return {
      accounts: [],
      centers: [],
      functions: [],
      services: [],
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}

// Test database connection
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
    const result = await sql`SELECT 1 as test`
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

// Get database status for debugging
export async function getDatabaseStatus() {
  try {
    const hasUrl = !!process.env.DATABASE_URL
    const hasConnection = !!sql

    return {
      hasUrl,
      hasConnection,
      urlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
      environment: process.env.NODE_ENV || "unknown",
    }
  } catch (error) {
    return {
      hasUrl: false,
      hasConnection: false,
      urlLength: 0,
      environment: "unknown",
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

// Exported function for loading filtered data
export async function loadData(filters: any) {
  try {
    // For dashboard-content component usage
    const data = await getAllData()
    return { success: true, data }
  } catch (error) {
    console.error("Error in loadData:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Exported function for exporting to Excel
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

// Exported function for loading saved filter sets
export async function loadFilterSets() {
  try {
    const filters = await getSavedFilters()
    return { success: true, data: filters }
  } catch (error) {
    console.error("Error loading filter sets:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Exported function for deleting a filter set
export async function deleteFilterSet(id: number) {
  try {
    const result = await deleteSavedFilter(id)
    return result
  } catch (error) {
    console.error("Error deleting filter set:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
