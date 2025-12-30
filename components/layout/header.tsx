import React from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface HeaderProps {
  onRefresh: () => void
}

export const Header = React.memo(function Header({ onRefresh }: HeaderProps) {
  return (
    <div className="bg-background border-b shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-background/95">
      <div className="max-w-full mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="text-base md:text-lg font-semibold tracking-tight text-foreground"
              style={{ fontFamily: "'Google Sans', 'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif" }}
            >
              Bamboo Reports
            </div>
            <span className="hidden md:inline text-sm text-muted-foreground">— GCC Explorer</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onRefresh} className="h-8 px-3 group" title="Refresh">
              <RefreshCw className="h-4 w-4 text-[hsl(var(--chart-4))] group-hover:text-[hsl(var(--chart-1))] group-hover:rotate-180 transition-all duration-300" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )
})
