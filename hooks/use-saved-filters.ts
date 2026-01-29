
import { useState, useCallback, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { withFilterDefaults } from "@/lib/dashboard/filter-summary"
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

    setLoading(true)
    try {
      const { error } = await supabase
        .from("saved_filters")
        .insert({ name: name.trim(), filters: filters, user_id: userId })

      if (error) throw error
      await loadSavedFilters()
      return true
    } catch (error) {
      console.error("Error saving filter:", error)
      return false
    } finally {
      setLoading(false)
    }
  }, [userId, loadSavedFilters, supabase])

  const deleteFilter = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("saved_filters")
        .delete()
        .eq("id", id)

      if (error) throw error

      await loadSavedFilters()
      return true
    } catch (error) {
      console.error("Error deleting filter:", error)
      return false
    } finally {
      setLoading(false)
    }
  }, [loadSavedFilters, supabase])

  const updateFilter = useCallback(async (id: string, name: string, filters: Filters) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("saved_filters")
        .update({
          name: name.trim(),
          filters: filters,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      await loadSavedFilters()
      return true
    } catch (error) {
      console.error("Error updating filter:", error)
      return false
    } finally {
      setLoading(false)
    }
  }, [loadSavedFilters, supabase])

  return {
    savedFilters,
    loading,
    saveFilter,
    deleteFilter,
    updateFilter,
    refreshFilters: loadSavedFilters
  }
}
