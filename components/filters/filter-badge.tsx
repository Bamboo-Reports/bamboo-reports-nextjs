import { Badge } from "@/components/ui/badge"
import { memo } from "react"
import type { FilterValue } from "@/lib/types"

type FilterValueLike = FilterValue | string | null | undefined

export const normalizeFilterValue = (value: FilterValueLike) => {
  if (!value) return null
  if (typeof value === "string") return { label: value, mode: "include" as FilterValue["mode"] }
  if (typeof value === "object" && "value" in value) return { label: value.value, mode: value.mode }
  return { label: String(value), mode: "include" as FilterValue["mode"] }
}

export const FilterBadge = memo((
  { filterKey, value, mode }: { filterKey: string; value: string; mode?: FilterValue["mode"] }
) => (
  <Badge variant={mode === "exclude" ? "destructive" : "outline"} className="text-xs">
    {filterKey}: {value}
    {mode === "exclude" ? " (excluded)" : ""}
  </Badge>
))
FilterBadge.displayName = "FilterBadge"

export const renderFilterValues = (values: FilterValueLike[] = [], label: string) =>
  values.map((item, index) => {
    const normalized = normalizeFilterValue(item)
    if (!normalized) return null

    return (
      <FilterBadge
        key={`${label}-${normalized.label}-${index}`}
        filterKey={label}
        value={normalized.label}
        mode={normalized.mode}
      />
    )
  })
