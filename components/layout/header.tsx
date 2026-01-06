"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { RefreshCw, UserRound } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"
import { useRouter } from "next/navigation"

interface HeaderProps {
  onRefresh: () => void
}

export const Header = React.memo(function Header({ onRefresh }: HeaderProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    let isMounted = true

    const loadProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, first_name, last_name, email, phone")
        .eq("user_id", userId)
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
        setProfile(null)
        return
      }
      setSessionEmail(user.email ?? null)
      loadProfile(user.id).finally(() => setIsLoadingProfile(false))
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      if (!session?.user) {
        setSessionEmail(null)
        setProfile(null)
        return
      }
      setSessionEmail(session.user.email ?? null)
      loadProfile(session.user.id)
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.replace("/signin")
  }

  return (
    <div className="bg-background border-b shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-background/95">
      <div className="max-w-full mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Bamboo Reports logo" width={32} height={32} className="h-8 w-auto" priority />
            <div
              className="text-base md:text-lg font-semibold tracking-tight text-foreground"
              style={{ fontFamily: "'Google Sans', 'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif" }}
            >
              Bamboo Reports
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onRefresh} className="h-8 px-3 group" title="Refresh">
              <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
            </Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Profile">
                  <UserRound className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium text-foreground">
                    {profile ? `${profile.first_name} ${profile.last_name}` : "User"}
                  </div>
                  <div className="text-muted-foreground">
                    {profile?.email ?? sessionEmail ?? "No email"}
                  </div>
                  {profile?.phone ? (
                    <div className="text-muted-foreground">{profile.phone}</div>
                  ) : null}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isLoadingProfile}
                  className="text-destructive focus:text-destructive"
                  onSelect={(event) => {
                    event.preventDefault()
                    handleSignOut()
                  }}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
})
