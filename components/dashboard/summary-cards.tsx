import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SummaryCardsProps {
  filteredAccountsCount: number
  totalAccountsCount: number
  filteredCentersCount: number
  totalCentersCount: number
  filteredServicesCount: number
  totalServicesCount: number
}

export const SummaryCards = React.memo(function SummaryCards({
  filteredAccountsCount,
  totalAccountsCount,
  filteredCentersCount,
  totalCentersCount,
  filteredServicesCount,
  totalServicesCount,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="hover:scale-[1.02] transition-transform duration-200" style={{ animationDelay: "0ms" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-sidebar-foreground">Total Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[hsl(var(--chart-1))] transition-all duration-300">
            {filteredAccountsCount}
          </div>
          <p className="text-xs text-muted-foreground">of {totalAccountsCount} total</p>
        </CardContent>
      </Card>
      <Card className="hover:scale-[1.02] transition-transform duration-200" style={{ animationDelay: "50ms" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-sidebar-foreground">Total Centers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[hsl(var(--chart-2))] transition-all duration-300">
            {filteredCentersCount}
          </div>
          <p className="text-xs text-muted-foreground">of {totalCentersCount} total</p>
        </CardContent>
      </Card>
      <Card className="hover:scale-[1.02] transition-transform duration-200" style={{ animationDelay: "100ms" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-sidebar-foreground">Total Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[hsl(var(--chart-3))] transition-all duration-300">
            {filteredServicesCount}
          </div>
          <p className="text-xs text-muted-foreground">of {totalServicesCount} total</p>
        </CardContent>
      </Card>
    </div>
  )
})
