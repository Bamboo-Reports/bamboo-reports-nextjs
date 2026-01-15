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
  // Process data: Top 5 + Others
  const safeData = React.useMemo(() => {
    const rawData = data || []
    
    // Sort descending by value
    const sorted = [...rawData].sort((a, b) => {
      const valA = (a[dataKey as keyof typeof a] as number) || 0
      const valB = (b[dataKey as keyof typeof b] as number) || 0
      return valB - valA
    })

    // If 5 or fewer items, return as is (sorted)
    if (sorted.length <= 5) return sorted

    // Split into top 5 and others
    const top5 = sorted.slice(0, 5)
    const others = sorted.slice(5)
    
    // Calculate total for others
    const othersValue = others.reduce((sum, item) => {
      return sum + ((item[dataKey as keyof typeof item] as number) || 0)
    }, 0)

    // Add Others category if it has value
    if (othersValue > 0) {
      const othersItem = {
        name: "Others",
        [dataKey]: othersValue,
        // Ensure value property exists if dataKey is different, to satisfy ChartData type
        ...(dataKey !== "value" ? { value: othersValue } : {})
      }
      return [...top5, othersItem as ChartData]
    }
    
    return top5
  }, [data, dataKey])

  // Calculate total for percentage calculation
  const total = React.useMemo(() => {
    return safeData.reduce((sum, item) => sum + ((item[dataKey as keyof typeof item] as number) || 0), 0)
  }, [safeData, dataKey])

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
