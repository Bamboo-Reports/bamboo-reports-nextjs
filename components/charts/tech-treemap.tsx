"use client"

import React, { memo } from "react"
import { Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { CHART_COLORS } from "@/lib/utils/chart-helpers"
import type { Tech } from "@/lib/types"
import type { Options, Point } from "highcharts"

type TreemapNode = {
  id: string
  parent?: string
  name: string
  value?: number
  color?: string
  category?: string
  count?: number
}

interface TechTreemapProps {
  tech: Tech[]
  title?: string
  heightClass?: string
  showTitle?: boolean
}

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace("#", "")
  const bigint = Number.parseInt(sanitized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const TechTreemap = memo(({
  tech,
  title = "Tech Stack",
  heightClass = "h-[320px] lg:h-[420px]",
  showTitle = true,
}: TechTreemapProps) => {
  const [chartLib, setChartLib] = React.useState<{
    Highcharts: typeof import("highcharts")
    HighchartsReact: React.ComponentType<any>
  } | null>(null)

  React.useEffect(() => {
    let active = true
    const load = async () => {
      const highchartsModule = await import("highcharts")
      const Highcharts = (highchartsModule as any).default ?? highchartsModule
      const treemapModule = await import("highcharts/modules/treemap")
      const HighchartsTreemap = (treemapModule as any).default ?? treemapModule
      if (typeof HighchartsTreemap === "function") {
        HighchartsTreemap(Highcharts)
      }
      const highchartsReactModule = await import("highcharts-react-official")
      const HighchartsReact = (highchartsReactModule as any).default ?? highchartsReactModule
      if (active) {
        setChartLib({ Highcharts, HighchartsReact })
      }
    }
    load().catch(() => {
      if (active) {
        setChartLib(null)
      }
    })
    return () => {
      active = false
    }
  }, [])

  const data = React.useMemo<TreemapNode[]>(() => {
    const categoryMap = new Map<string, Map<string, number>>()

    tech.forEach((item) => {
      const category = item.software_category?.trim() || "Uncategorized"
      const software = item.software_in_use?.trim() || "Unknown"

      if (!categoryMap.has(category)) {
        categoryMap.set(category, new Map())
      }

      const softwareMap = categoryMap.get(category)!
      softwareMap.set(software, (softwareMap.get(software) || 0) + 1)
    })

    const nodes: TreemapNode[] = []
    Array.from(categoryMap.entries()).forEach(([category, softwareMap], index) => {
      const categoryColor = CHART_COLORS[index % CHART_COLORS.length]
      const categoryId = `cat-${index}`
      nodes.push({
        id: categoryId,
        name: category,
        color: categoryColor,
      })

      Array.from(softwareMap.entries()).forEach(([software, count], softwareIndex) => {
        nodes.push({
          id: `${categoryId}-${softwareIndex}`,
          parent: categoryId,
          name: software,
          value: count,
          count,
          category,
          color: hexToRgba(categoryColor, 0.85),
        })
      })
    })

    return nodes
  }, [tech])

  if (data.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-2 text-muted-foreground", heightClass)}>
        <Layers className="h-5 w-5" />
        <p className="text-sm">No tech stack data available</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-0">
      {showTitle && (
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
          <Layers className="h-4 w-4" />
          {title}
        </div>
      )}
      <div className={cn("w-full h-full min-h-0", heightClass)}>
        {chartLib ? (
          <chartLib.HighchartsReact
            highcharts={chartLib.Highcharts}
            options={{
            chart: {
              type: "treemap",
              backgroundColor: "transparent",
            },
            title: { text: showTitle ? title : undefined, align: "left" },
            credits: { enabled: false },
            tooltip: {
              useHTML: true,
              backgroundColor: "transparent",
              borderWidth: 0,
              shadow: false,
              formatter: function () {
                const point = this.point as Point & { category?: string; count?: number }
                return `
                  <div class="rounded-lg border border-border bg-background px-3 py-2 shadow-lg">
                    <p class="text-xs font-semibold text-foreground">${point.name}</p>
                    ${point.category ? `<p class="text-[11px] text-muted-foreground">Category: ${point.category}</p>` : ""}
                    ${typeof point.count === "number" ? `<p class="text-[11px] text-muted-foreground">Instances: <span class="font-medium text-foreground">${point.count}</span></p>` : ""}
                  </div>
                `
              },
            },
            plotOptions: {
              treemap: {
                layoutAlgorithm: "squarified",
                allowTraversingTree: true,
                alternateStartingDirection: true,
                dataLabels: {
                  format: "{point.name}",
                  style: {
                    textOutline: "none",
                  },
                },
                borderRadius: 3,
                nodeSizeBy: "leaf",
              },
            },
            series: [
              {
                type: "treemap",
                name: "Tech Stack",
                data,
                levels: [
                  {
                    level: 1,
                    layoutAlgorithm: "sliceAndDice",
                    groupPadding: 3,
                    dataLabels: {
                      headers: true,
                      enabled: true,
                      style: {
                        fontSize: "0.6em",
                        fontWeight: "normal",
                        color: "var(--highcharts-neutral-color-100, #000)",
                        textOutline: "none",
                      },
                    },
                    borderRadius: 3,
                    borderWidth: 1,
                    colorByPoint: true,
                  },
                  {
                    level: 2,
                    dataLabels: {
                      enabled: true,
                      inside: false,
                    },
                  },
                ],
              },
            ],
          } as Options}
            containerProps={{ style: { height: "100%", width: "100%" } }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
            Loading chart...
          </div>
        )}
      </div>
    </div>
  )
})

TechTreemap.displayName = "TechTreemap"
