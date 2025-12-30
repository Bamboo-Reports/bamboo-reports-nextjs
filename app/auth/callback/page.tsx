"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState("Confirming your request...")

  useEffect(() => {
    const finalizeAuth = async () => {
      const supabase = createClient()
      const url = new URL(window.location.href)
      const code = url.searchParams.get("code")
      const type = url.searchParams.get("type")
      const nextParam = url.searchParams.get("next")
      const redirectPath =
        nextParam && nextParam.startsWith("/")
          ? nextParam
          : type === "recovery"
            ? "/reset-password"
            : "/signin"

      let errorMessage: string | null = null

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          errorMessage = error.message
        }
      } else if (window.location.hash) {
        const { error } = await supabase.auth.getSessionFromUrl()
        if (error) {
          errorMessage = error.message
        }
      } else {
        errorMessage = "Missing authentication data."
      }

      if (errorMessage) {
        setMessage("This link is invalid or expired. Redirecting to sign in...")
        setTimeout(() => {
          router.replace("/signin")
        }, 1200)
        return
      }

      setMessage("All set! Redirecting...")
      setTimeout(() => {
        router.replace(redirectPath)
        router.refresh()
      }, 500)
    }

    finalizeAuth()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">{message}</p>
    </div>
  )
}
