import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SummaryCardsProps {
  filteredAccountsCount: number
  totalAccountsCount: number
  filteredCentersCount: number
  totalCentersCount: number
  filteredProspectsCount: number
  totalProspectsCount: number
}

export const SummaryCards = React.memo(function SummaryCards({
  filteredAccountsCount,
  totalAccountsCount,
  filteredCentersCount,
  totalCentersCount,
  filteredProspectsCount,
  totalProspectsCount,
}: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Accounts",
      value: filteredAccountsCount,
      total: totalAccountsCount,
      colorVar: "--chart-1",
    },
    {
      title: "Total Centers",
      value: filteredCentersCount,
      total: totalCentersCount,
      colorVar: "--chart-2",
    },
    {
      title: "Total Prospects",
      value: filteredProspectsCount,
      total: totalProspectsCount,
      colorVar: "--chart-3",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="relative overflow-hidden border border-border/60 bg-gradient-to-br from-background/90 via-background to-background shadow-[0_15px_50px_-35px_rgba(0,0,0,0.6)] dark:shadow-[0_20px_65px_-45px_rgba(0,0,0,0.85)]"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background: `
                radial-gradient(circle at 18% 20%, hsl(var(${card.colorVar}) / 0.2), transparent 42%),
                radial-gradient(circle at 82% 0%, hsl(var(${card.colorVar}) / 0.14), transparent 36%),
                linear-gradient(125deg, hsl(var(${card.colorVar}) / 0.08), transparent 55%)
              `,
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-px rounded-[calc(var(--radius)-2px)] border border-white/20 dark:border-white/5 opacity-60"
            aria-hidden="true"
          />
          <CardHeader className="relative p-4 pb-2">
            <CardTitle className="text-sm font-medium text-sidebar-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative flex items-end justify-between gap-3 p-4 pt-1">
            <div>
              <div className="text-3xl font-semibold leading-tight text-sidebar-foreground">
                {card.value.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Currently visible</p>
            </div>
            <span className="inline-flex items-center rounded-full border border-border/60 bg-secondary/70 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-sm">
              {card.total.toLocaleString()} total
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})
