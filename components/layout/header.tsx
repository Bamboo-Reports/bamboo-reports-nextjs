import React from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, RefreshCw, Database } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"

interface HeaderProps {
  connectionStatus?: string
  onRefresh: () => void
  onClearCache: () => void
}

export const Header = React.memo(function Header({ connectionStatus, onRefresh, onClearCache }: HeaderProps) {
  return (
    <div className="bg-background border-b shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-background/95">
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Logo />
            <p className="text-sm text-foreground/80">Intelligence-driven insights for accounts, centers, and services</p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[hsl(var(--chart-2))]" />
            <span className="text-sm text-foreground/70">Connected to Neon Database</span>
            <Button variant="ghost" size="sm" onClick={onRefresh} className="h-8 px-3 group">
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClearCache} className="h-8 px-3" title="Clear Cache">
              <Database className="h-3 w-3" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
        {connectionStatus && <p className="text-xs text-muted-foreground mt-1">{connectionStatus}</p>}
      </div>
    </div>
  )
})
