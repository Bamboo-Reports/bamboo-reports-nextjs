"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  getUnreadAccountUpdateSummaries,
  markAccountNotificationsAsRead,
  type AccountUpdateSummary,
} from "@/app/actions"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Account } from "@/lib/types"

const ACCOUNT_IDENTITY_PREFIX = "key:account_global_legal_name="
const REFRESH_INTERVAL_MS = 60000
const NOTIFICATIONS_CHANGED_EVENT = "bamboo:notifications-changed"
const ACCOUNT_UPDATES_PAGE_SIZE = 100
const MAX_ACCOUNT_UPDATE_PAGES = 10

function normalizeLookupValue(value?: string | null): string | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  return normalized || null
}

function buildAccountIdentity(accountName?: string | null): string | null {
  if (!accountName) return null
  const normalizedAccountName = accountName.trim()
  if (!normalizedAccountName) return null
  return `${ACCOUNT_IDENTITY_PREFIX}${normalizedAccountName}`
}

function matchesAccount(summary: AccountUpdateSummary, account: Account): boolean {
  const accountUuid = normalizeLookupValue(account.uuid)
  const accountName = normalizeLookupValue(account.account_global_legal_name)
  const accountIdentity = normalizeLookupValue(buildAccountIdentity(account.account_global_legal_name))
  const summaryUuid = normalizeLookupValue(summary.record_uuid)
  const summaryLabel = normalizeLookupValue(summary.record_label)
  const summaryIdentity = normalizeLookupValue(summary.record_identity)

  if (accountUuid && summaryUuid && summaryUuid === accountUuid) return true
  if (accountIdentity && summaryIdentity && summaryIdentity === accountIdentity) return true
  if (accountName && summaryLabel && summaryLabel === accountName) return true

  return false
}

interface AccountLookupIndex {
  byUuid: Set<string>
  byIdentity: Set<string>
  byLabel: Set<string>
}

export function useRecentlyUpdatedAccounts() {
  const supabase = getSupabaseBrowserClient()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [recentlyUpdatedAccounts, setRecentlyUpdatedAccounts] = useState<AccountUpdateSummary[]>([])
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
        setRecentlyUpdatedAccounts([])
        setError(null)
      }
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const refreshRecentlyUpdatedAccounts = useCallback(async () => {
    if (!accessToken) {
      setRecentlyUpdatedAccounts([])
      return
    }

    setLoading(true)
    try {
      const mergedSummaries: AccountUpdateSummary[] = []
      for (let pageIndex = 0; pageIndex < MAX_ACCOUNT_UPDATE_PAGES; pageIndex += 1) {
        const offset = pageIndex * ACCOUNT_UPDATES_PAGE_SIZE
        const result = await getUnreadAccountUpdateSummaries({
          accessToken,
          limit: ACCOUNT_UPDATES_PAGE_SIZE,
          offset,
        })

        if (!result.success) {
          setError(result.error ?? "Failed to fetch recently updated accounts.")
          return
        }

        mergedSummaries.push(...result.data)
        if (result.data.length < ACCOUNT_UPDATES_PAGE_SIZE) {
          break
        }
      }

      setRecentlyUpdatedAccounts(mergedSummaries)
      setError(null)
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    void refreshRecentlyUpdatedAccounts()
  }, [refreshRecentlyUpdatedAccounts])

  useEffect(() => {
    if (!accessToken) return
    const intervalId = window.setInterval(() => {
      void refreshRecentlyUpdatedAccounts()
    }, REFRESH_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [accessToken, refreshRecentlyUpdatedAccounts])

  useEffect(() => {
    const handleNotificationsChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ source?: string }>
      if (customEvent.detail?.source === "recently-updated-accounts") {
        return
      }
      void refreshRecentlyUpdatedAccounts()
    }

    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handleNotificationsChanged)
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, handleNotificationsChanged)
  }, [refreshRecentlyUpdatedAccounts])

  const lookupIndex = useMemo<AccountLookupIndex>(() => {
    const byUuid = new Set<string>()
    const byIdentity = new Set<string>()
    const byLabel = new Set<string>()

    for (const summary of recentlyUpdatedAccounts) {
      const normalizedUuid = normalizeLookupValue(summary.record_uuid)
      const normalizedIdentity = normalizeLookupValue(summary.record_identity)
      const normalizedLabel = normalizeLookupValue(summary.record_label)

      if (normalizedUuid) byUuid.add(normalizedUuid)
      if (normalizedIdentity) byIdentity.add(normalizedIdentity)
      if (normalizedLabel) byLabel.add(normalizedLabel)
    }

    return { byUuid, byIdentity, byLabel }
  }, [recentlyUpdatedAccounts])

  const isAccountRecentlyUpdated = useCallback(
    (account: Account): boolean => {
      const accountUuid = normalizeLookupValue(account.uuid)
      const accountName = normalizeLookupValue(account.account_global_legal_name)
      const accountIdentity = normalizeLookupValue(buildAccountIdentity(account.account_global_legal_name))

      if (accountUuid && lookupIndex.byUuid.has(accountUuid)) return true
      if (accountIdentity && lookupIndex.byIdentity.has(accountIdentity)) return true
      if (accountName && lookupIndex.byLabel.has(accountName)) return true

      return false
    },
    [lookupIndex]
  )

  const removeAccountFromState = useCallback((account: Account) => {
    setRecentlyUpdatedAccounts((previous) =>
      previous.filter((summary) => !matchesAccount(summary, account))
    )
  }, [])

  const markAccountAsRead = useCallback(
    async (account: Account) => {
      if (!accessToken) return false

      removeAccountFromState(account)

      const result = await markAccountNotificationsAsRead(accessToken, {
        accountUuid: account.uuid ?? null,
        accountName: account.account_global_legal_name,
      })

      if (!result.success) {
        setError(result.error ?? "Failed to mark account updates as read.")
        void refreshRecentlyUpdatedAccounts()
        return false
      }

      setError(null)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(NOTIFICATIONS_CHANGED_EVENT, {
            detail: { source: "recently-updated-accounts" },
          })
        )
      }
      return true
    },
    [accessToken, removeAccountFromState, refreshRecentlyUpdatedAccounts]
  )

  return {
    recentlyUpdatedAccounts,
    loading,
    error,
    isAccountRecentlyUpdated,
    markAccountAsRead,
    refreshRecentlyUpdatedAccounts,
  }
}
