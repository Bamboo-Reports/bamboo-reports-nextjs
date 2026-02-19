
import { useState, useCallback, useEffect } from "react"
import { captureEvent } from "@/lib/analytics/client"
import { ANALYTICS_EVENTS } from "@/lib/analytics/events"
import { buildTrackedFiltersSnapshot, normalizeTrackedText } from "@/lib/analytics/tracking"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { calculateActiveFilters, withFilterDefaults } from "@/lib/dashboard/filter-summary"
import type { SavedFilter } from "@/components/filters/saved-filter-card"
import type { Filters } from "@/lib/types"

export function useSavedFilters() {
  const supabase = getSupabaseBrowserClient()
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setUserId(data.session?.user.id ?? null)
      setAuthReady(true)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      setUserId(session?.user.id ?? null)
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const loadSavedFilters = useCallback(async () => {
    if (!userId) {
      setSavedFilters([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("saved_filters")
        .select("id, name, filters, created_at, updated_at")
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      const normalizedFilters = Array.isArray(data)
        ? data
            .map((filter) => {
              try {
                const parsedFilters = typeof filter.filters === "string" ? JSON.parse(filter.filters) : filter.filters
                if (!parsedFilters) return null
                return { ...filter, filters: withFilterDefaults(parsedFilters) } as SavedFilter
              } catch (error) {
                console.error("Failed to parse saved filter:", error)
                return null
              }
            })
            .filter((item): item is SavedFilter => Boolean(item))
        : []
      setSavedFilters(normalizedFilters)
    } catch (error) {
      console.error("Failed to load saved filters:", error)
    } finally {
      setLoading(false)
    }
  }, [supabase, userId])

  // Initial load when auth is ready
  useEffect(() => {
    if (!authReady) return
    loadSavedFilters()
  }, [authReady, loadSavedFilters, userId])

  const saveFilter = useCallback(async (name: string, filters: Filters) => {
    if (!name.trim() || !userId) return false
    const normalizedName = name.trim()

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("saved_filters")
        .insert({ name: normalizedName, filters: filters, user_id: userId })
        .select("id, name")
        .single()

      if (error) throw error
      await loadSavedFilters()
      captureEvent(ANALYTICS_EVENTS.SAVED_FILTER_SAVED, {
        saved_filter_id: data?.id ?? null,
        saved_filter_name: normalizeTrackedText(normalizedName),
        filter_name_length: normalizedName.length,
        active_filters_count: calculateActiveFilters(filters),
        saved_filters_snapshot: buildTrackedFiltersSnapshot(filters),
      })
      return true
    } catch (error) {
      console.error("Error saving filter:", error)
      return false
    } finally {
      setLoading(false)
    }
  }, [userId, loadSavedFilters, supabase])

  const deleteFilter = useCallback(async (id: string) => {
    const filterToDelete = savedFilters.find((filter) => filter.id === id) ?? null

    setLoading(true)
    try {
      const { error } = await supabase
        .from("saved_filters")
        .delete()
        .eq("id", id)

      if (error) throw error

      await loadSavedFilters()
      captureEvent(ANALYTICS_EVENTS.SAVED_FILTER_DELETED, {
        saved_filter_id: id,
        saved_filter_name: filterToDelete ? normalizeTrackedText(filterToDelete.name) : null,
        active_filters_count: filterToDelete ? calculateActiveFilters(filterToDelete.filters) : null,
        deleted_filters_snapshot: filterToDelete ? buildTrackedFiltersSnapshot(filterToDelete.filters) : null,
      })
      return true
    } catch (error) {
      console.error("Error deleting filter:", error)
      return false
    } finally {
      setLoading(false)
    }
  }, [loadSavedFilters, savedFilters, supabase])

  const updateFilter = useCallback(async (id: string, name: string, filters: Filters) => {
    const previousFilter = savedFilters.find((filter) => filter.id === id) ?? null
    const normalizedName = name.trim()

    setLoading(true)
    try {
      const { error } = await supabase
        .from("saved_filters")
        .update({
          name: normalizedName,
          filters: filters,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      await loadSavedFilters()
      captureEvent(ANALYTICS_EVENTS.SAVED_FILTER_RENAMED, {
        saved_filter_id: id,
        previous_filter_name: previousFilter ? normalizeTrackedText(previousFilter.name) : null,
        next_filter_name: normalizeTrackedText(normalizedName),
        filter_name_length: normalizedName.length,
        active_filters_count: calculateActiveFilters(filters),
        updated_filters_snapshot: buildTrackedFiltersSnapshot(filters),
      })
      return true
    } catch (error) {
      console.error("Error updating filter:", error)
      return false
    } finally {
      setLoading(false)
    }
  }, [loadSavedFilters, savedFilters, supabase])

  return {
    savedFilters,
    loading,
    saveFilter,
    deleteFilter,
    updateFilter,
    refreshFilters: loadSavedFilters
  }
}
