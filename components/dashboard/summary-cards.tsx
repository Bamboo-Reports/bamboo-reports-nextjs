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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-sidebar-foreground">Total Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[hsl(var(--chart-1))]">
            {filteredAccountsCount}
          </div>
          <p className="text-xs text-muted-foreground">of {totalAccountsCount} total</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-sidebar-foreground">Total Centers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[hsl(var(--chart-2))]">
            {filteredCentersCount}
          </div>
          <p className="text-xs text-muted-foreground">of {totalCentersCount} total</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-sidebar-foreground">Total Prospects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[hsl(var(--chart-3))]">
            {filteredProspectsCount}
          </div>
          <p className="text-xs text-muted-foreground">of {totalProspectsCount} total</p>
        </CardContent>
      </Card>
    </div>
  )
})
