"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X, Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { FilterValue } from "@/lib/types"

interface EnhancedMultiSelectProps {
  options: Array<{ value: string; count?: number; disabled?: boolean }>
  selected: FilterValue[]
  onChange: (selected: FilterValue[]) => void
  placeholder?: string
  className?: string
}

// Memoized Badge component with include/exclude toggle
const EnhancedSelectBadge = React.memo(({
  item,
  onRemove,
  onToggleMode
}: {
  item: FilterValue
  onRemove: () => void
  onToggleMode: () => void
}) => {
  const isInclude = item.mode === 'include'

  return (
    <Badge
      variant="secondary"
      className={cn(
        "mr-1 mb-1 animate-badge-in transition-all duration-200 flex items-center gap-1 pr-1",
        isInclude
          ? "bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-300 border-green-500/50 hover:bg-green-500/30"
          : "bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-300 border-red-500/50 hover:bg-red-500/30"
      )}
    >
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onToggleMode()
        }}
        className={cn(
          "flex items-center justify-center w-4 h-4 rounded-sm transition-all duration-200",
          isInclude
            ? "bg-green-600/30 hover:bg-green-600/50"
            : "bg-red-600/30 hover:bg-red-600/50"
        )}
        title={isInclude ? "Click to exclude" : "Click to include"}
      >
        {isInclude ? (
          <Plus className="h-3 w-3" />
        ) : (
          <Minus className="h-3 w-3" />
        )}
      </button>
      <span className="text-xs">{item.value}</span>
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onRemove()
        }}
        className="ml-1 hover:scale-110 transition-transform duration-100"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
})
EnhancedSelectBadge.displayName = "EnhancedSelectBadge"

// Memoized Command Item
const EnhancedSelectItem = React.memo(({
  value,
  count,
  disabled,
  isSelected,
  filterValue,
  onSelect
}: {
  value: string
  count?: number
  disabled: boolean
  isSelected: boolean
  filterValue?: FilterValue
  onSelect: () => void
}) => {
  const isInclude = filterValue?.mode === 'include'

  return (
    <CommandItem
      key={value}
      onSelect={onSelect}
      disabled={disabled}
      className={cn(
        "cursor-pointer transition-all duration-100",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-accent/50",
        isSelected && (isInclude
          ? "bg-green-500/10 hover:bg-green-500/20"
          : "bg-red-500/10 hover:bg-red-500/20")
      )}
    >
      <div className="flex items-center space-x-2 flex-1">
        <Checkbox
          checked={isSelected}
          disabled={disabled}
          className={cn(
            "h-4 w-4 transition-all duration-100",
            isSelected && (isInclude
              ? "border-green-500 data-[state=checked]:bg-green-500"
              : "border-red-500 data-[state=checked]:bg-red-500")
          )}
        />
        <Check
          className={cn(
            "h-4 w-4 transition-all duration-100",
            isSelected ? "opacity-100 scale-100" : "opacity-0 scale-75",
            isInclude ? "text-green-600" : "text-red-600"
          )}
        />
        <span className="flex-1">{value}</span>
        {count !== undefined && (
          <span className="text-xs text-muted-foreground ml-2 font-medium">
            ({count})
          </span>
        )}
        {isSelected && (
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded",
            isInclude
              ? "bg-green-500/20 text-green-700 dark:text-green-300"
              : "bg-red-500/20 text-red-700 dark:text-red-300"
          )}>
            {isInclude ? "Include" : "Exclude"}
          </span>
        )}
      </div>
    </CommandItem>
  )
})
EnhancedSelectItem.displayName = "EnhancedSelectItem"

export const EnhancedMultiSelect = React.memo(function EnhancedMultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
}: EnhancedMultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = React.useCallback((item: FilterValue) => {
    onChange(selected.filter((i) => i.value !== item.value))
  }, [selected, onChange])

  const handleToggleMode = React.useCallback((item: FilterValue) => {
    onChange(
      selected.map((i) =>
        i.value === item.value
          ? { ...i, mode: i.mode === 'include' ? 'exclude' : 'include' }
          : i
      )
    )
  }, [selected, onChange])

  const handleSelect = React.useCallback((value: string) => {
    const option = options.find((opt) => (typeof opt === "string" ? opt === value : opt.value === value))
    if (typeof option === "object" && option.disabled) return

    const existingIndex = selected.findIndex((i) => i.value === value)

    if (existingIndex >= 0) {
      // If already selected, toggle mode instead of removing
      const currentMode = selected[existingIndex].mode
      onChange(
        selected.map((i, idx) =>
          idx === existingIndex
            ? { ...i, mode: currentMode === 'include' ? 'exclude' : 'include' }
            : i
        )
      )
    } else {
      // Add as include by default
      onChange([...selected, { value, mode: 'include' }])
    }
  }, [options, selected, onChange])

  const renderBadges = React.useMemo(() => {
    return selected.map((item) => (
      <EnhancedSelectBadge
        key={item.value}
        item={item}
        onRemove={() => handleUnselect(item)}
        onToggleMode={() => handleToggleMode(item)}
      />
    ))
  }, [selected, handleUnselect, handleToggleMode])

  const renderOptions = React.useMemo(() => {
    return options.map((option) => {
      const value = typeof option === "string" ? option : option.value
      const count = typeof option === "object" ? option.count : undefined
      const disabled = typeof option === "object" ? option.disabled : false
      const filterValue = selected.find((s) => s.value === value)
      const isSelected = !!filterValue

      return (
        <EnhancedSelectItem
          key={value}
          value={value}
          count={count}
          disabled={disabled}
          isSelected={isSelected}
          filterValue={filterValue}
          onSelect={() => handleSelect(value)}
        />
      )
    })
  }, [options, selected, handleSelect])

  // Count include vs exclude
  const includeCount = selected.filter(s => s.mode === 'include').length
  const excludeCount = selected.filter(s => s.mode === 'exclude').length

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between h-auto min-h-10 bg-transparent hover:bg-accent/30 transition-all duration-150"
          >
            <div className="flex gap-1 flex-wrap items-center w-full">
              {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
              {selected.length > 0 && (
                <div className="flex items-center gap-2 mr-2">
                  {includeCount > 0 && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      +{includeCount}
                    </span>
                  )}
                  {excludeCount > 0 && (
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                      -{excludeCount}
                    </span>
                  )}
                </div>
              )}
              {renderBadges}
            </div>
            <ChevronsUpDown className={cn(
              "h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 ml-2",
              open && "rotate-180"
            )} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 animate-slide-down" align="start">
          <Command>
            <CommandInput placeholder="Search..." className="h-9" />
            <CommandList className="max-h-64">
              <CommandEmpty>No item found.</CommandEmpty>
              <CommandGroup>
                {renderOptions}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
})

EnhancedMultiSelect.displayName = "EnhancedMultiSelect"
