"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function Logo({ className = "" }: { className?: string }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={`h-10 w-48 ${className}`} />
  }

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src={resolvedTheme === "dark" ? "/logos/bamboo-logo-white.svg" : "/logos/bamboo-logo-dark.svg"}
        alt="Bamboo Reports"
        width={180}
        height={40}
        priority
        className="h-10 w-auto"
      />
    </div>
  )
}
