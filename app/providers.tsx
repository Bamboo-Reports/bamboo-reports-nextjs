"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { capturePageView, initAnalytics } from "@/lib/analytics/client"

export function AppProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    initAnalytics()
  }, [])

  useEffect(() => {
    if (!pathname || typeof window === "undefined") {
      return
    }

    let url = `${window.location.origin}${pathname}`
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`
    }

    capturePageView(url)
  }, [pathname, searchParams])

  return <>{children}</>
}
