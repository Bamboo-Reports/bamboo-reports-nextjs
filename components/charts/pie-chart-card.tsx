import React, { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, TooltipProps } from "recharts"
import { ChartContainer, ChartTooltip, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart"
import { PieChartIcon } from "lucide-react"
import { CHART_COLORS } from "@/lib/utils/chart-helpers"
import type { ChartData } from "@/lib/types"

const CustomTooltip = memo(({ active, payload, total, countLabel = "Count", showBigPercentage = false }: TooltipProps<any, any> & { total: number; countLabel?: string; showBigPercentage?: boolean }) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  const value = payload[0].value
  const percent = total > 0 ? Math.round((value / total) * 100) : 0
  const color = data.fill || CHART_COLORS[0]

  return (
    <div className="rounded-lg border border-border bg-background px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-foreground mb-2">{data.name}</p>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">
          {countLabel}: <span className="font-medium text-foreground" style={{ color }}>{Number(value).toLocaleString()}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {showBigPercentage ? <span className="text-2xl font-bold" style={{ color }}>{percent}%</span> : <span className="font-medium" style={{ color }}>{percent}%</span>}
        </p>
      </div>
    </div>
  )
})
CustomTooltip.displayName = "CustomTooltip"

interface PieChartCardProps {
  title: string
  data: ChartData[]
  dataKey?: string
  countLabel?: string
  showBigPercentage?: boolean
}

export const PieChartCard = memo(({ title, data, dataKey = "value", countLabel = "Count", showBigPercentage = false }: PieChartCardProps) => {
  // Safety check: ensure data is an array
  const safeData = React.useMemo(() => data || [], [data])

  // Calculate total for percentage calculation
  const total = React.useMemo(() => {
    return safeData.reduce((sum, item) => sum + (item.value || 0), 0)
  }, [safeData])

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
              <ChartTooltip content={(props) => <CustomTooltip {...props} total={total} countLabel={countLabel} showBigPercentage={showBigPercentage} />} />
              <Pie
                data={safeData}
                dataKey={dataKey}
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={55}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  const percentage = Math.round(percent * 100)
                  if (percentage < 5) return null

                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180)
                  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180)

                  return (
                    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="bold">
                      {percentage}%
                    </text>
                  )
                }}
                labelLine={false}
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
