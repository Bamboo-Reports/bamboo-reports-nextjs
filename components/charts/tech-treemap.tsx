"use client"

import React, { memo } from "react"
import { Treemap, ResponsiveContainer, Tooltip, type TooltipProps } from "recharts"
import { Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { CHART_COLORS } from "@/lib/utils/chart-helpers"
import type { Tech } from "@/lib/types"

type TreemapNode = {
  name: string
  size?: number
  fill?: string
  category?: string
  count?: number
  children?: TreemapNode[]
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

const CustomTooltip = memo(({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) return null
  const data = payload[0]?.payload as TreemapNode | undefined
  if (!data) return null

  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-foreground">
        {data.name}
      </p>
      {data.category && (
        <p className="text-[11px] text-muted-foreground">Category: {data.category}</p>
      )}
      {typeof data.count === "number" && (
        <p className="text-[11px] text-muted-foreground">
          Instances: <span className="font-medium text-foreground">{data.count}</span>
        </p>
      )}
    </div>
  )
})
CustomTooltip.displayName = "CustomTooltip"

const CustomNode = (props: any) => {
  const { depth, x, y, width, height, name, fill, count, category } = props
  const isCategory = depth === 1
  const isLeaf = depth >= 2
  const canShowLabel = width > 80 && height > 40
  const safeX = Math.round(x)
  const safeY = Math.round(y)
  const safeWidth = Math.max(0, Math.floor(width))
  const safeHeight = Math.max(0, Math.floor(height))
  const inset = isLeaf ? 2 : 0
  const leafRadius = 6

  return (
    <g>
      {isCategory && (
        <rect
          x={safeX}
          y={safeY}
          width={safeWidth}
          height={safeHeight}
          style={{
            fill: "transparent",
            stroke: "rgba(255,255,255,0.9)",
            strokeWidth: 1.5,
            shapeRendering: "crispEdges",
          }}
        />
      )}
      <rect
        x={safeX + inset}
        y={safeY + inset}
        width={Math.max(0, safeWidth - inset * 2)}
        height={Math.max(0, safeHeight - inset * 2)}
        rx={isLeaf ? leafRadius : 0}
        style={{
          fill,
          stroke: "rgba(255,255,255,0.6)",
          strokeWidth: 1,
          shapeRendering: "crispEdges",
        }}
      />
      {isLeaf && canShowLabel && (
        <foreignObject
          x={safeX + 6}
          y={safeY + 6}
          width={Math.max(0, safeWidth - 12)}
          height={Math.max(0, safeHeight - 12)}
          pointerEvents="none"
        >
          <div className="h-full w-full overflow-hidden text-white">
            <div className="text-[12px] font-semibold leading-snug">{name}</div>
            {category && (
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/70 leading-snug">
                {category}
              </div>
            )}
            {typeof count === "number" && (
              <div className="text-[11px] text-white/80 leading-snug">
                {count} instances
              </div>
            )}
          </div>
        </foreignObject>
      )}
      {isCategory && safeWidth > 90 && safeHeight > 36 && (
        <foreignObject
          x={safeX + 8}
          y={safeY + 6}
          width={Math.max(0, safeWidth - 16)}
          height={20}
          pointerEvents="none"
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">
            {name}
          </div>
        </foreignObject>
      )}
    </g>
  )
}

export const TechTreemap = memo(({
  tech,
  title = "Tech Stack",
  heightClass = "h-[320px] lg:h-[420px]",
  showTitle = true,
}: TechTreemapProps) => {
  const data = React.useMemo(() => {
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

    return Array.from(categoryMap.entries()).map(([category, softwareMap], index) => {
      const categoryColor = CHART_COLORS[index % CHART_COLORS.length]
      return {
        name: category,
        fill: categoryColor,
        children: Array.from(softwareMap.entries()).map(([software, count]) => ({
          name: software,
          size: count,
          count,
          category,
          fill: hexToRgba(categoryColor, 0.85),
        })),
      }
    })
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
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={data}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="#ffffff"
            content={<CustomNode />}
            isAnimationActive={false}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  )
})

TechTreemap.displayName = "TechTreemap"
