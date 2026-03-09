"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  getUnreadTableRecordUpdateSummaries,
  markTableRecordNotificationsAsRead,
  type TableRecordUpdateSummary,
} from "@/app/actions"
import { areNotificationsEnabled } from "@/lib/config/notifications"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

const REFRESH_INTERVAL_MS = 60000
const NOTIFICATIONS_CHANGED_EVENT = "bamboo:notifications-changed"
const TABLE_UPDATES_PAGE_SIZE = 100
const MAX_TABLE_UPDATE_PAGES = 10

function normalizeLookupValue(value?: string | null): string | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  return normalized || null
}

interface UseRecentlyUpdatedTableRecordsOptions<TRecord> {
  tableName: "accounts" | "centers" | "prospects"
  getRecordUuid?: (record: TRecord) => string | null | undefined
  getRecordIdentity?: (record: TRecord) => string | null | undefined
  getRecordLabel?: (record: TRecord) => string | null | undefined
  getAdditionalRecordIdentities?: (record: TRecord) => Array<string | null | undefined>
  getAdditionalRecordLabels?: (record: TRecord) => Array<string | null | undefined>
}

interface RecordLookupIndex {
  byUuid: Set<string>
  byIdentity: Set<string>
  byLabel: Set<string>
}

function createNormalizedSet(values: Array<string | null | undefined>): Set<string> {
  const set = new Set<string>()
  for (const value of values) {
    const normalized = normalizeLookupValue(value)
    if (normalized) set.add(normalized)
  }
  return set
}

export function useRecentlyUpdatedTableRecords<TRecord>({
  tableName,
  getRecordUuid,
  getRecordIdentity,
  getRecordLabel,
  getAdditionalRecordIdentities,
  getAdditionalRecordLabels,
}: UseRecentlyUpdatedTableRecordsOptions<TRecord>) {
  const notificationsEnabled = areNotificationsEnabled()
  const supabase = getSupabaseBrowserClient()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [recentlyUpdatedRecords, setRecentlyUpdatedRecords] = useState<TableRecordUpdateSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setAccessToken(data.session?.access_token ?? null)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      setAccessToken(session?.access_token ?? null)
      if (!session?.access_token) {
        setRecentlyUpdatedRecords([])
        setError(null)
      }
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const refreshRecentlyUpdatedRecords = useCallback(async () => {
    if (!notificationsEnabled) {
      setRecentlyUpdatedRecords([])
      setLoading(false)
      setError(null)
      return
    }

    if (!accessToken) {
      setRecentlyUpdatedRecords([])
      return
    }

    setLoading(true)
    try {
      const mergedSummaries: TableRecordUpdateSummary[] = []
      for (let pageIndex = 0; pageIndex < MAX_TABLE_UPDATE_PAGES; pageIndex += 1) {
        const offset = pageIndex * TABLE_UPDATES_PAGE_SIZE
        const result = await getUnreadTableRecordUpdateSummaries({
          accessToken,
          tableName,
          limit: TABLE_UPDATES_PAGE_SIZE,
          offset,
        })

        if (!result.success) {
          setError(result.error ?? "Failed to fetch recently updated records.")
          return
        }

        mergedSummaries.push(...result.data)
        if (result.data.length < TABLE_UPDATES_PAGE_SIZE) {
          break
        }
      }

      setRecentlyUpdatedRecords(mergedSummaries)
      setError(null)
    } finally {
      setLoading(false)
    }
  }, [accessToken, notificationsEnabled, tableName])

  useEffect(() => {
    if (!notificationsEnabled) {
      setRecentlyUpdatedRecords([])
      setLoading(false)
      setError(null)
      return
    }

    void refreshRecentlyUpdatedRecords()
  }, [notificationsEnabled, refreshRecentlyUpdatedRecords])

  useEffect(() => {
    if (!notificationsEnabled || !accessToken) return
    const intervalId = window.setInterval(() => {
      void refreshRecentlyUpdatedRecords()
    }, REFRESH_INTERVAL_MS)
    return () => window.clearInterval(intervalId)
  }, [accessToken, notificationsEnabled, refreshRecentlyUpdatedRecords])

  useEffect(() => {
    if (!notificationsEnabled) return
    const sourceKey = `recently-updated-${tableName}`
    const handleNotificationsChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ source?: string }>
      if (customEvent.detail?.source === sourceKey) {
        return
      }
      void refreshRecentlyUpdatedRecords()
    }

    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handleNotificationsChanged)
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, handleNotificationsChanged)
  }, [notificationsEnabled, tableName, refreshRecentlyUpdatedRecords])

  const lookupIndex = useMemo<RecordLookupIndex>(() => {
    const byUuid = new Set<string>()
    const byIdentity = new Set<string>()
    const byLabel = new Set<string>()

    for (const summary of recentlyUpdatedRecords) {
      const normalizedUuid = normalizeLookupValue(summary.record_uuid)
      const normalizedIdentity = normalizeLookupValue(summary.record_identity)
      const normalizedLabel = normalizeLookupValue(summary.record_label)

      if (normalizedUuid) byUuid.add(normalizedUuid)
      if (normalizedIdentity) byIdentity.add(normalizedIdentity)
      if (normalizedLabel) byLabel.add(normalizedLabel)
    }

    return { byUuid, byIdentity, byLabel }
  }, [recentlyUpdatedRecords])

  const getRecordLookupSets = useCallback(
    (record: TRecord) => {
      const uuidSet = createNormalizedSet([getRecordUuid?.(record)])
      const identitySet = createNormalizedSet([
        getRecordIdentity?.(record),
        ...(getAdditionalRecordIdentities?.(record) ?? []),
      ])
      const labelSet = createNormalizedSet([
        getRecordLabel?.(record),
        ...(getAdditionalRecordLabels?.(record) ?? []),
      ])

      return { uuidSet, identitySet, labelSet }
    },
    [
      getRecordUuid,
      getRecordIdentity,
      getRecordLabel,
      getAdditionalRecordIdentities,
      getAdditionalRecordLabels,
    ]
  )

  const isRecordRecentlyUpdated = useCallback(
    (record: TRecord): boolean => {
      const { uuidSet, identitySet, labelSet } = getRecordLookupSets(record)

      for (const value of uuidSet) {
        if (lookupIndex.byUuid.has(value)) return true
      }
      for (const value of identitySet) {
        if (lookupIndex.byIdentity.has(value)) return true
      }
      for (const value of labelSet) {
        if (lookupIndex.byLabel.has(value)) return true
      }

      return false
    },
    [getRecordLookupSets, lookupIndex]
  )

  const removeRecordFromState = useCallback(
    (record: TRecord) => {
      const { uuidSet, identitySet, labelSet } = getRecordLookupSets(record)

      setRecentlyUpdatedRecords((previous) =>
        previous.filter((summary) => {
          const summaryUuid = normalizeLookupValue(summary.record_uuid)
          const summaryIdentity = normalizeLookupValue(summary.record_identity)
          const summaryLabel = normalizeLookupValue(summary.record_label)

          if (summaryUuid && uuidSet.has(summaryUuid)) return false
          if (summaryIdentity && identitySet.has(summaryIdentity)) return false
          if (summaryLabel && labelSet.has(summaryLabel)) return false
          return true
        })
      )
    },
    [getRecordLookupSets]
  )

  const markRecordAsRead = useCallback(
    async (record: TRecord) => {
      if (!notificationsEnabled) return false
      if (!accessToken) return false

      const recordUuid = getRecordUuid?.(record) ?? null
      const recordIdentity = getRecordIdentity?.(record) ?? null
      const recordLabel = getRecordLabel?.(record) ?? null
      const recordIdentities = getAdditionalRecordIdentities?.(record) ?? []
      const recordLabels = getAdditionalRecordLabels?.(record) ?? []

      removeRecordFromState(record)

      const result = await markTableRecordNotificationsAsRead(accessToken, {
        tableName,
        recordUuid,
        recordIdentity,
        recordLabel,
        recordIdentities,
        recordLabels,
      })

      if (!result.success) {
        setError(result.error ?? "Failed to mark record updates as read.")
        void refreshRecentlyUpdatedRecords()
        return false
      }

      setError(null)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(NOTIFICATIONS_CHANGED_EVENT, {
            detail: { source: `recently-updated-${tableName}` },
          })
        )
      }
      return true
    },
    [
      accessToken,
      notificationsEnabled,
      tableName,
      getRecordUuid,
      getRecordIdentity,
      getRecordLabel,
      getAdditionalRecordIdentities,
      getAdditionalRecordLabels,
      removeRecordFromState,
      refreshRecentlyUpdatedRecords,
    ]
  )

  return {
    recentlyUpdatedRecords,
    loading,
    error,
    isRecordRecentlyUpdated,
    markRecordAsRead,
    refreshRecentlyUpdatedRecords,
  }
}

