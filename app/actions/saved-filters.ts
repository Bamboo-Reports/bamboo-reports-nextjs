"use server"

import { getSqlOrThrow, fetchWithRetry } from "@/lib/db/connection"
import { getCachedData, setCachedData, invalidateCache } from "@/lib/db/cache"

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
    invalidateCache("saved_filters")

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
    invalidateCache("saved_filters")

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
    invalidateCache("saved_filters")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating saved filter:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// ============================================
// LEGACY COMPATIBILITY FUNCTIONS
// ============================================

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
