"use server"

import { createClient } from "@supabase/supabase-js"
import { getSqlOrThrow, fetchWithRetry } from "@/lib/db/connection"

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100
const ROW_REMOVED_FIELD = "__row_removed__"
const UI_VISIBLE_NOTIFICATION_TABLES = ["accounts", "centers", "prospects"]

export interface NotificationEvent {
  id: number
  import_run_id: number
  table_name: string
  record_uuid: string | null
  record_identity: string
  record_label: string | null
  field_name: string
  old_value: string | null
  new_value: string | null
  changed_at: string
  is_read: boolean
}

export interface NotificationSummary {
  table_name: string
  field_name: string
  unread_count: number
  latest_changed_at: string
}

export interface NotificationListResponse {
  success: boolean
  data: NotificationEvent[]
  error?: string
}

export interface NotificationSummaryListResponse {
  success: boolean
  data: NotificationSummary[]
  error?: string
}

export interface NotificationCountResponse {
  success: boolean
  unreadCount: number
  error?: string
}

export interface NotificationMarkResponse {
  success: boolean
  markedCount: number
  error?: string
}

function clampLimit(limit?: number): number {
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT
  return Math.max(1, Math.min(MAX_LIMIT, Math.floor(limit as number)))
}

function clampOffset(offset?: number): number {
  if (!Number.isFinite(offset)) return 0
  return Math.max(0, Math.floor(offset as number))
}

function normalizeTableName(tableName?: string | null): string | null {
  if (!tableName) return null
  const normalized = tableName.trim().toLowerCase()
  return normalized || null
}

async function resolveAuthenticatedUserId(accessToken: string): Promise<string> {
  const token = accessToken?.trim()
  if (!token) {
    throw new Error("Missing access token.")
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured.")
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user?.id) {
    throw new Error("Supabase authentication failed.")
  }

  return data.user.id
}

export async function getUnreadNotificationsCount(accessToken: string): Promise<NotificationCountResponse> {
  try {
    const userId = await resolveAuthenticatedUserId(accessToken)
    const sqlClient = getSqlOrThrow()

    const result = (await fetchWithRetry(
      () => sqlClient`
        SELECT COUNT(*)::int AS unread_count
        FROM (
          SELECT e.table_name, e.field_name
          FROM audit.field_change_events e
          WHERE e.field_name <> ${ROW_REMOVED_FIELD}
            AND e.table_name = ANY(${UI_VISIBLE_NOTIFICATION_TABLES})
            AND NOT EXISTS (
            SELECT 1
            FROM audit.notification_reads r
            WHERE r.user_id = ${userId}
              AND r.change_event_id = e.id
          )
          GROUP BY e.table_name, e.field_name
        )
        AS unread_groups
      `
    )) as Array<{ unread_count: number }>

    return {
      success: true,
      unreadCount: result[0]?.unread_count ?? 0,
    }
  } catch (error) {
    return {
      success: false,
      unreadCount: 0,
      error: error instanceof Error ? error.message : "Failed to get unread notifications count.",
    }
  }
}

export async function getNotifications(params: {
  accessToken: string
  limit?: number
  offset?: number
  onlyUnread?: boolean
  tableName?: string | null
}): Promise<NotificationListResponse> {
  try {
    const userId = await resolveAuthenticatedUserId(params.accessToken)
    const sqlClient = getSqlOrThrow()
    const limit = clampLimit(params.limit)
    const offset = clampOffset(params.offset)
    const onlyUnread = Boolean(params.onlyUnread)
    const tableName = normalizeTableName(params.tableName)

    let query = sqlClient`
      SELECT
        e.id,
        e.import_run_id,
        e.table_name,
        e.record_uuid,
        e.record_identity,
        e.record_label,
        e.field_name,
        e.old_value,
        e.new_value,
        e.changed_at,
        (r.id IS NOT NULL) AS is_read
      FROM audit.field_change_events e
      LEFT JOIN audit.notification_reads r
        ON r.change_event_id = e.id
       AND r.user_id = ${userId}
      WHERE 1 = 1
    `

    if (tableName) {
      query = sqlClient`${query} AND e.table_name = ${tableName}`
    }

    if (onlyUnread) {
      query = sqlClient`${query} AND r.id IS NULL`
    }

    query = sqlClient`${query} ORDER BY e.changed_at DESC, e.id DESC LIMIT ${limit} OFFSET ${offset}`

    const data = (await fetchWithRetry(() => query)) as NotificationEvent[]
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Failed to fetch notifications.",
    }
  }
}

export async function getNotificationSummaries(params: {
  accessToken: string
  limit?: number
  offset?: number
  tableName?: string | null
}): Promise<NotificationSummaryListResponse> {
  try {
    const userId = await resolveAuthenticatedUserId(params.accessToken)
    const sqlClient = getSqlOrThrow()
    const limit = clampLimit(params.limit)
    const offset = clampOffset(params.offset)
    const tableName = normalizeTableName(params.tableName)

    let query = sqlClient`
      SELECT
        e.table_name,
        e.field_name,
        COUNT(*)::int AS unread_count,
        MAX(e.changed_at) AS latest_changed_at
      FROM audit.field_change_events e
      LEFT JOIN audit.notification_reads r
        ON r.change_event_id = e.id
       AND r.user_id = ${userId}
      WHERE r.id IS NULL
        AND e.field_name <> ${ROW_REMOVED_FIELD}
        AND e.table_name = ANY(${UI_VISIBLE_NOTIFICATION_TABLES})
    `

    if (tableName) {
      query = sqlClient`${query} AND e.table_name = ${tableName}`
    }

    query = sqlClient`
      ${query}
      GROUP BY e.table_name, e.field_name
      ORDER BY MAX(e.changed_at) DESC, e.table_name ASC, e.field_name ASC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    const data = (await fetchWithRetry(() => query)) as NotificationSummary[]
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Failed to fetch notification summaries.",
    }
  }
}

export async function markNotificationsAsRead(
  accessToken: string,
  changeEventIds: number[]
): Promise<NotificationMarkResponse> {
  try {
    const userId = await resolveAuthenticatedUserId(accessToken)
    const sqlClient = getSqlOrThrow()

    const normalizedIds = Array.from(
      new Set(
        changeEventIds
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0)
      )
    )

    if (normalizedIds.length === 0) {
      return { success: true, markedCount: 0 }
    }

    const result = (await fetchWithRetry(
      () => sqlClient`
        INSERT INTO audit.notification_reads (user_id, change_event_id)
        SELECT ${userId}, e.id
        FROM audit.field_change_events e
        WHERE e.id = ANY(${normalizedIds})
        ON CONFLICT (user_id, change_event_id) DO NOTHING
        RETURNING change_event_id
      `
    )) as Array<{ change_event_id: number }>

    return { success: true, markedCount: result.length }
  } catch (error) {
    return {
      success: false,
      markedCount: 0,
      error: error instanceof Error ? error.message : "Failed to mark notifications as read.",
    }
  }
}

export async function markNotificationGroupAsRead(
  accessToken: string,
  tableName: string,
  fieldName: string
): Promise<NotificationMarkResponse> {
  try {
    const userId = await resolveAuthenticatedUserId(accessToken)
    const normalizedTableName = normalizeTableName(tableName)
    const normalizedFieldName = fieldName?.trim()
    if (!normalizedTableName || !normalizedFieldName) {
      return { success: true, markedCount: 0 }
    }

    const sqlClient = getSqlOrThrow()
    const result = (await fetchWithRetry(
      () => sqlClient`
        INSERT INTO audit.notification_reads (user_id, change_event_id)
        SELECT ${userId}, e.id
        FROM audit.field_change_events e
        LEFT JOIN audit.notification_reads r
          ON r.user_id = ${userId}
         AND r.change_event_id = e.id
        WHERE r.change_event_id IS NULL
          AND e.table_name = ${normalizedTableName}
          AND e.field_name = ${normalizedFieldName}
        ON CONFLICT (user_id, change_event_id) DO NOTHING
        RETURNING change_event_id
      `
    )) as Array<{ change_event_id: number }>

    return { success: true, markedCount: result.length }
  } catch (error) {
    return {
      success: false,
      markedCount: 0,
      error: error instanceof Error ? error.message : "Failed to mark notification group as read.",
    }
  }
}

export async function markAllNotificationsAsRead(accessToken: string): Promise<NotificationMarkResponse> {
  try {
    const userId = await resolveAuthenticatedUserId(accessToken)
    const sqlClient = getSqlOrThrow()

    const result = (await fetchWithRetry(
      () => sqlClient`
        INSERT INTO audit.notification_reads (user_id, change_event_id)
        SELECT ${userId}, e.id
        FROM audit.field_change_events e
        LEFT JOIN audit.notification_reads r
          ON r.user_id = ${userId}
         AND r.change_event_id = e.id
        WHERE r.change_event_id IS NULL
        ON CONFLICT (user_id, change_event_id) DO NOTHING
        RETURNING change_event_id
      `
    )) as Array<{ change_event_id: number }>

    return { success: true, markedCount: result.length }
  } catch (error) {
    return {
      success: false,
      markedCount: 0,
      error: error instanceof Error ? error.message : "Failed to mark all notifications as read.",
    }
  }
}
