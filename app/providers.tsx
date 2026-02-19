"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { capturePageView, initAnalytics } from "@/lib/analytics/client"

export function AppProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    initAnalytics()
  }, [])

  useEffect(() => {
    if (!pathname || typeof window === "undefined") {
      return
    }

    let url = `${window.location.origin}${pathname}`
    if (window.location.search) {
      url += window.location.search
    }

    capturePageView(url)
  }, [pathname])

  return <>{children}</>
}
