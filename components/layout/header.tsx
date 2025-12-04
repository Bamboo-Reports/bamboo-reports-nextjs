import React from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface HeaderProps {
  onRefresh: () => void
}

export const Header = React.memo(function Header({ onRefresh }: HeaderProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--chart-1))] via-[hsl(var(--chart-3))] to-[hsl(var(--chart-2))] text-background shadow-lg shadow-[rgba(0,0,0,0.12)]">
            <span className="text-sm font-semibold">BR</span>
          </div>
          <div className="leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Bamboo Reports</p>
            <p className="text-sm font-semibold text-foreground">Research command console</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-9 px-3 group border border-border/60 bg-secondary/60 hover:bg-secondary"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
})
