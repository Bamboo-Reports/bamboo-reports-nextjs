import React, { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart"
import { PieChartIcon } from "lucide-react"
import { CHART_COLORS } from "@/lib/utils/chart-helpers"
import type { ChartData } from "@/lib/types"

interface PieChartCardProps {
  title: string
  data: ChartData[]
  dataKey?: string
}

export const PieChartCard = memo(({ title, data, dataKey = "value" }: PieChartCardProps) => {
  // Safety check: ensure data is an array
  const safeData = React.useMemo(() => data || [], [data])

  // Create chart config from data
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {}
    safeData.forEach((item, index) => {
      config[item.name] = {
        label: item.name,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }
    })
    return config
  }, [safeData])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {safeData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={safeData}
                dataKey={dataKey}
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {safeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
PieChartCard.displayName = "PieChartCard"
