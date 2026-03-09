import { useCallback, useEffect, useState } from "react"
import {
  getNotificationSummaries,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationGroupAsRead,
  type NotificationSummary,
} from "@/app/actions"
import { areNotificationsEnabled } from "@/lib/config/notifications"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface LoadNotificationsOptions {
  limit?: number
  offset?: number
  tableName?: string | null
}

const NOTIFICATIONS_CHANGED_EVENT = "bamboo:notifications-changed"

export function useNotifications() {
  const notificationsEnabled = areNotificationsEnabled()
  const supabase = getSupabaseBrowserClient()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [notificationSummaries, setNotificationSummaries] = useState<NotificationSummary[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingList, setLoadingList] = useState(false)
  const [loadingCount, setLoadingCount] = useState(false)
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
        setNotificationSummaries([])
        setUnreadCount(0)
        setError(null)
      }
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const refreshUnreadCount = useCallback(async () => {
    if (!notificationsEnabled) {
      setUnreadCount(0)
      setLoadingCount(false)
      setError(null)
      return
    }

    if (!accessToken) {
      setUnreadCount(0)
      return
    }

    setLoadingCount(true)
    try {
      const result = await getUnreadNotificationsCount(accessToken)
      if (!result.success) {
        setError(result.error ?? "Failed to fetch unread notifications count.")
        return
      }
      setUnreadCount(result.unreadCount)
      setError(null)
    } finally {
      setLoadingCount(false)
    }
  }, [accessToken, notificationsEnabled])

  const loadNotifications = useCallback(
    async (options: LoadNotificationsOptions = {}) => {
      if (!notificationsEnabled) {
        setNotificationSummaries([])
        setLoadingList(false)
        setError(null)
        return
      }

      if (!accessToken) {
        setNotificationSummaries([])
        return
      }

      setLoadingList(true)
      try {
        const result = await getNotificationSummaries({
          accessToken,
          limit: options.limit,
          offset: options.offset,
          tableName: options.tableName,
        })
        if (!result.success) {
          setError(result.error ?? "Failed to fetch notifications.")
          return
        }
        setNotificationSummaries(result.data)
        setError(null)
      } finally {
        setLoadingList(false)
      }
    },
    [accessToken, notificationsEnabled]
  )

  const markGroupAsRead = useCallback(
    async (tableName: string, fieldName: string) => {
      if (!notificationsEnabled) return false
      if (!accessToken) return false

      const targetGroup = notificationSummaries.find(
        (summary) => summary.table_name === tableName && summary.field_name === fieldName
      )
      const groupCountBefore = targetGroup ? 1 : 0

      const result = await markNotificationGroupAsRead(accessToken, tableName, fieldName)
      if (!result.success) {
        setError(result.error ?? "Failed to mark notification group as read.")
        return false
      }

      const decrementBy = groupCountBefore || (result.markedCount > 0 ? 1 : 0)

      setNotificationSummaries((previous) =>
        previous.filter(
          (summary) => !(summary.table_name === tableName && summary.field_name === fieldName)
        )
      )
      setUnreadCount((previous) => Math.max(0, previous - decrementBy))
      setError(null)
      return true
    },
    [accessToken, notificationSummaries, notificationsEnabled]
  )

  const markAllAsRead = useCallback(async () => {
    if (!notificationsEnabled) return false
    if (!accessToken) return false

    const result = await markAllNotificationsAsRead(accessToken)
    if (!result.success) {
      setError(result.error ?? "Failed to mark all notifications as read.")
      return false
    }

    setNotificationSummaries([])
    setUnreadCount(0)
    setError(null)
    return true
  }, [accessToken, notificationsEnabled])

  useEffect(() => {
    if (!notificationsEnabled) {
      setNotificationSummaries([])
      setUnreadCount(0)
      setLoadingList(false)
      setLoadingCount(false)
      setError(null)
      return
    }

    void refreshUnreadCount()
  }, [notificationsEnabled, refreshUnreadCount])

  useEffect(() => {
    if (!notificationsEnabled || !accessToken) return
    const intervalId = window.setInterval(() => {
      void refreshUnreadCount()
    }, 60000)
    return () => window.clearInterval(intervalId)
  }, [accessToken, notificationsEnabled, refreshUnreadCount])

  useEffect(() => {
    if (!notificationsEnabled) return
    const handleNotificationsChanged = () => {
      void refreshUnreadCount()
    }

    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handleNotificationsChanged)
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, handleNotificationsChanged)
  }, [notificationsEnabled, refreshUnreadCount])

  return {
    notificationSummaries,
    unreadCount,
    loadingList,
    loadingCount,
    error,
    hasSession: notificationsEnabled && Boolean(accessToken),
    refreshUnreadCount,
    loadNotifications,
    markGroupAsRead,
    markAllAsRead,
  }
}
