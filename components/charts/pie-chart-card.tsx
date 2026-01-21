"use client"

import React, { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import { PieChartIcon } from "lucide-react"
import { CHART_COLORS } from "@/lib/utils/chart-helpers"
import type { ChartData } from "@/lib/types"

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
    return safeData.reduce((sum, item) => {
      const rawValue = (item as Record<string, number | undefined>)[dataKey]
      return sum + (typeof rawValue === "number" ? rawValue : 0)
    }, 0)
  }, [safeData, dataKey])

  const seriesData = React.useMemo(() => {
    return safeData.map((item, index) => {
      const rawValue = (item as Record<string, number | undefined>)[dataKey]
      return {
        name: item.name,
        y: typeof rawValue === "number" ? rawValue : 0,
        color: item.fill || CHART_COLORS[index % CHART_COLORS.length],
      }
    })
  }, [safeData, dataKey])

  const options = React.useMemo<Highcharts.Options>(() => {
    return {
      chart: {
        type: "pie",
        backgroundColor: "transparent",
      },
      title: { text: undefined },
      credits: { enabled: false },
      legend: {
        enabled: false,
      },
      tooltip: {
        useHTML: true,
        backgroundColor: "transparent",
        borderWidth: 0,
        shadow: false,
        formatter: function () {
          const point = this.point as Highcharts.Point
          const value = typeof point.y === "number" ? point.y : 0
          const percent = total > 0 ? Math.round((value / total) * 100) : 0
          const color = point.color || CHART_COLORS[0]
          return `
            <div class="rounded-lg border border-border bg-background px-4 py-3 shadow-lg">
              <p class="text-sm font-semibold text-foreground mb-2">${point.name}</p>
              <div class="space-y-1">
                <p class="text-xs text-muted-foreground">
                  ${countLabel}: <span class="font-medium text-foreground" style="color:${color}">${Number(value).toLocaleString()}</span>
                </p>
                <p class="text-xs text-muted-foreground">
                  ${showBigPercentage ? `<span class="text-2xl font-bold" style="color:${color}">${percent}%</span>` : `<span class="font-medium" style="color:${color}">${percent}%</span>`}
                </p>
              </div>
            </div>
          `
        },
      },
      plotOptions: {
        pie: {
          innerSize: "55%",
          size: "70%",
          dataLabels: { enabled: false },
          showInLegend: false,
          borderWidth: 0,
        },
      },
      series: [
        {
          type: "pie",
          data: seriesData,
        },
      ],
    }
  }, [seriesData, total, countLabel, showBigPercentage])

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
          <div className="h-[400px] w-full">
            <HighchartsReact highcharts={Highcharts} options={options} containerProps={{ style: { height: "100%", width: "100%" } }} />
          </div>
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
