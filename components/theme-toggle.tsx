'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-8 w-8 px-0 relative overflow-hidden group"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative">
        {theme === 'dark' ? (
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 group-hover:rotate-90 group-hover:scale-110" />
        ) : (
          <Moon className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-110" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
