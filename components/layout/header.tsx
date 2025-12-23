import React from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface HeaderProps {
  onRefresh: () => void
}

export const Header = React.memo(function Header({ onRefresh }: HeaderProps) {
  return (
    <div className="relative bg-background/80 border-b border-border/60 shadow-[0_15px_50px_-40px_rgba(0,0,0,0.8)] sticky top-0 z-20 backdrop-blur-md">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 18% 40%, hsl(var(--chart-1) / 0.16), transparent 40%)," +
            "radial-gradient(circle at 82% 20%, hsl(var(--chart-4) / 0.14), transparent 36%)," +
            "linear-gradient(135deg, hsl(var(--background) / 0.95), hsl(var(--background) / 0.8))",
        }}
      />
      <div className="relative max-w-full mx-auto px-6 py-3">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onRefresh} className="h-8 px-3 group" title="Refresh">
            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
})
