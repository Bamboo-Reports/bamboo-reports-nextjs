"use client"

import { ArrowDownAZ, ArrowUpAZ, ArrowUpDown } from "lucide-react"

interface SortButtonProps<T extends string = string> {
  label: string
  sortKey: T
  currentKey: T
  direction: "asc" | "desc" | null
  onClick: (key: T) => void
}

export function SortButton<T extends string = string>({
  label,
  sortKey,
  currentKey,
  direction,
  onClick,
}: SortButtonProps<T>) {
  return (
    <button
      type="button"
      onClick={() => onClick(sortKey)}
      className="inline-flex items-center gap-1 font-medium text-foreground"
    >
      <span>{label}</span>
      {currentKey !== sortKey || direction === null ? (
        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
      ) : direction === "asc" ? (
        <ArrowUpAZ className="h-3.5 w-3.5 text-muted-foreground" />
      ) : (
        <ArrowDownAZ className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </button>
  )
}
