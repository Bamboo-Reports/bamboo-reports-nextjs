"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function LoadingPage() {
  const router = useRouter()
  const [message, setMessage] = useState("Setting up your account...")

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()

      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        setMessage("Account setup complete! Redirecting to dashboard...")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        setTimeout(() => {
          router.push("/signin")
        }, 3000)
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">{message}</p>
    </div>
  )
}
