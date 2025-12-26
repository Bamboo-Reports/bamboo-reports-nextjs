import React, { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, TooltipProps } from "recharts"
import { ChartContainer, ChartTooltip, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart"
import { PieChartIcon, TrendingUp, Users, DollarSign, MapPin, Building2, Briefcase, Target } from "lucide-react"
import { CHART_COLORS } from "@/lib/utils/chart-helpers"
import type { ChartData } from "@/lib/types"

const CustomTooltip = memo(({ active, payload }: TooltipProps<any, any>) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  const value = payload[0].value
  const total = payload.reduce((acc, curr) => acc + (curr.value || 0), 0)
  const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
  const color = data.fill || CHART_COLORS[0]

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes('revenue') || lower.includes('sales')) return <DollarSign className="h-4 w-4" />
    if (lower.includes('employee') || lower.includes('people')) return <Users className="h-4 w-4" />
    if (lower.includes('region') || lower.includes('city') || lower.includes('location')) return <MapPin className="h-4 w-4" />
    if (lower.includes('center') || lower.includes('branch')) return <Building2 className="h-4 w-4" />
    if (lower.includes('function') || lower.includes('service')) return <Briefcase className="h-4 w-4" />
    if (lower.includes('target') || lower.includes('goal')) return <Target className="h-4 w-4" />
    return <TrendingUp className="h-4 w-4" />
  }

  return (
    <div className="min-w-[220px] overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-background via-background to-muted/40 p-4 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div 
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-xl"
            style={{ 
              backgroundColor: color, 
              boxShadow: `0 4px 20px ${color}50, inset 0 1px 0 rgba(255,255,255,0.2)` 
            }}
          >
            {getCategoryIcon(data.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-foreground truncate leading-tight">{data.name}</p>
            <p className="text-xs text-muted-foreground/80">Category Details</p>
          </div>
        </div>
        
        <div className="space-y-2.5 pt-2.5 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Value</span>
            <div className="flex items-center gap-2">
              <span 
                className="text-2xl font-black tabular-nums tracking-tight"
                style={{ color, textShadow: `0 0 20px ${color}30` }}
              >
                {Number(value).toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Share</span>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-foreground tabular-nums">
                {percent}%
              </span>
              <div 
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
        </div>

        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/80">
          <div 
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
            style={{ 
              width: `${percent}%`,
              backgroundColor: color,
              boxShadow: `0 0 12px ${color}80, inset 0 1px 0 rgba(255,255,255,0.3)`,
              background: `linear-gradient(90deg, ${color} 0%, ${color}aa 50%, ${color}88 100%)`
            }}
          />
        </div>

        <div className="pt-1">
          <p className="text-[10px] text-center text-muted-foreground/60">
            Total: {total.toLocaleString()} items
          </p>
        </div>
      </div>
    </div>
  )
})
CustomTooltip.displayName = "CustomTooltip"

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
              <ChartTooltip content={<CustomTooltip />} />
              <Pie
                data={safeData}
                dataKey={dataKey}
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={55}
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
