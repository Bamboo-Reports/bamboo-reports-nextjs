"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Bell, CheckCheck, LogOut, Mail, Phone, RefreshCw, ShieldCheck, UserRound } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { captureEvent, resetAnalytics } from '@/lib/analytics/client'
import { ANALYTICS_EVENTS } from '@/lib/analytics/events'
import { normalizeUserRole } from '@/lib/auth/roles'
import { useNotifications } from '@/hooks/use-notifications'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

interface HeaderProps {
  onRefresh: () => void
}

const NOTIFICATIONS_PAGE_SIZE = 10

export const Header = React.memo(function Header({ onRefresh }: HeaderProps): JSX.Element {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [lastSignInAt, setLastSignInAt] = useState<string | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notificationsPage, setNotificationsPage] = useState(1)
  const {
    notificationSummaries,
    unreadCount,
    loadingList: isLoadingNotifications,
    loadingCount: isLoadingUnread,
    error: notificationsError,
    hasSession,
    loadNotifications,
    markGroupAsRead,
    markAllAsRead,
  } = useNotifications()

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    let isMounted = true

    const loadProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, email, phone, role')
        .eq('user_id', userId)
        .single()

      if (!isMounted) return
      if (error) {
        setProfile(null)
        return
      }
      setProfile(data)
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      const user = data.session?.user
      if (!user) {
        setIsLoadingProfile(false)
        setSessionEmail(null)
        setLastSignInAt(null)
        setProfile(null)
        return
      }
      setSessionEmail(user.email ?? null)
      setLastSignInAt(user.last_sign_in_at ?? null)
      loadProfile(user.id).finally(() => setIsLoadingProfile(false))
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      if (!session?.user) {
        setSessionEmail(null)
        setLastSignInAt(null)
        setProfile(null)
        return
      }
      setSessionEmail(session.user.email ?? null)
      setLastSignInAt(session.user.last_sign_in_at ?? null)
      loadProfile(session.user.id)
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient()
    captureEvent(ANALYTICS_EVENTS.AUTH_SIGNED_OUT, {
      auth_provider: "email",
    })
    await supabase.auth.signOut()
    resetAnalytics()
    router.replace('/signin')
  }

  const displayName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : 'User'
  const displayEmail = profile?.email ?? sessionEmail ?? 'No email'
  const normalizedRole = normalizeUserRole(profile?.role)
  const userInitials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U'
  const formattedLastSignIn =
    lastSignInAt && !Number.isNaN(Date.parse(lastSignInAt))
      ? new Date(lastSignInAt).toLocaleString()
      : 'Unknown'

  const formatFieldName = (fieldName: string): string =>
    fieldName
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase())

  const formatTableName = (tableName: string): string =>
    tableName
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase())

  const formatEventDate = (value: string): string => {
    const parsed = Date.parse(value)
    if (Number.isNaN(parsed)) return value
    return new Date(parsed).toLocaleString()
  }

  const pagedNotificationSummaries = notificationSummaries.slice(0, NOTIFICATIONS_PAGE_SIZE)
  const hasNextNotificationsPage = notificationSummaries.length > NOTIFICATIONS_PAGE_SIZE

  useEffect(() => {
    if (!isNotificationsOpen || !hasSession) return
    const offset = (notificationsPage - 1) * NOTIFICATIONS_PAGE_SIZE
    void loadNotifications({ limit: NOTIFICATIONS_PAGE_SIZE + 1, offset })
  }, [isNotificationsOpen, hasSession, notificationsPage, loadNotifications])

  const handleNotificationOpenChange = (open: boolean) => {
    setIsNotificationsOpen(open)
    if (open) {
      setNotificationsPage(1)
    }
  }

  const handleMarkAllRead = async () => {
    const ok = await markAllAsRead()
    if (ok) {
      setNotificationsPage(1)
    }
  }

  const handleSummaryClick = async (tableName: string, fieldName: string) => {
    const ok = await markGroupAsRead(tableName, fieldName)
    if (ok) {
      const offset = (notificationsPage - 1) * NOTIFICATIONS_PAGE_SIZE
      void loadNotifications({ limit: NOTIFICATIONS_PAGE_SIZE + 1, offset })
    }
  }

  const goToPreviousNotificationsPage = () => {
    setNotificationsPage((previous) => Math.max(1, previous - 1))
  }

  const goToNextNotificationsPage = () => {
    setNotificationsPage((previous) => previous + 1)
  }

  return (
    <div className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="mx-auto w-full px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-primary/20 bg-background">
              <Image
                src="/logo.svg"
                alt="Bamboo Reports logo"
                fill
                sizes="40px"
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-foreground">Bamboo Reports</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onRefresh} className="h-8 px-3 group" title="Refresh" aria-label="Refresh data">
              <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
            </Button>
            <DropdownMenu open={isNotificationsOpen} onOpenChange={handleNotificationOpenChange}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-8"
                  title="Notifications"
                  aria-label="Open notifications"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[460px] p-0">
                <div className="flex items-center justify-between border-b border-border/70 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">Notifications</p>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                      {isLoadingUnread ? '...' : `${unreadCount} unread`}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={unreadCount === 0}
                    onClick={handleMarkAllRead}
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </Button>
                </div>
                <div className="max-h-[420px] overflow-y-auto p-2">
                  <div className="space-y-1">
                    {isLoadingNotifications ? (
                      <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                        Loading notifications...
                      </div>
                    ) : null}
                    {!isLoadingNotifications && notificationsError ? (
                      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                        {notificationsError}
                      </div>
                    ) : null}
                    {!isLoadingNotifications && !notificationsError && notificationSummaries.length === 0 ? (
                      <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                        No more notifications.
                      </div>
                    ) : null}
                    {!isLoadingNotifications && !notificationsError
                      ? pagedNotificationSummaries.map((summary) => (
                          <button
                            key={`${summary.table_name}:${summary.field_name}`}
                            type="button"
                            onClick={() => handleSummaryClick(summary.table_name, summary.field_name)}
                            className="w-full rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-left transition-colors hover:bg-blue-500/15"
                          >
                            <div className="mb-1 flex items-start justify-between gap-2">
                              <p className="line-clamp-1 text-xs font-semibold text-foreground">
                                {summary.unread_count} {formatTableName(summary.table_name)} - {formatFieldName(summary.field_name)} got updated
                              </p>
                              <p className="shrink-0 text-[10px] text-muted-foreground">
                                {formatEventDate(summary.latest_changed_at)}
                              </p>
                            </div>
                          </button>
                        ))
                      : null}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border/70 px-3 py-2">
                  <p className="text-[11px] text-muted-foreground">Page {notificationsPage}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      disabled={notificationsPage === 1 || isLoadingNotifications}
                      onClick={goToPreviousNotificationsPage}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      disabled={!hasNextNotificationsPage || isLoadingNotifications}
                      onClick={goToNextNotificationsPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Profile" aria-label="Open profile menu">
                  <UserRound className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
                <div className="border-b border-border/60 bg-gradient-to-r from-blue-500/10 via-sky-500/5 to-background p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/15 text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {userInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-foreground">{displayName}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 p-3 text-xs">
                  <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-2.5 py-2">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </span>
                    <span className="max-w-[180px] truncate text-foreground">{displayEmail}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-2.5 py-2">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      Phone
                    </span>
                    <span className="text-foreground">{profile?.phone ?? 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-2.5 py-2">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Access Role
                    </span>
                    <span className="font-medium text-foreground">{normalizedRole === 'admin' ? 'Admin' : 'Viewer'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-2.5 py-2">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      Last Sign In
                    </span>
                    <span className="text-foreground">{formattedLastSignIn}</span>
                  </div>
                </div>

                <DropdownMenuSeparator />
                <div className="p-2">
                  <DropdownMenuItem
                    disabled={isLoadingProfile}
                    className="h-9 cursor-pointer rounded-md border border-destructive/25 bg-destructive/10 font-medium text-destructive focus:bg-destructive/15 focus:text-destructive"
                    onSelect={(event) => {
                      event.preventDefault()
                      handleSignOut()
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
})
