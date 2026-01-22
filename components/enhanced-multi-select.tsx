"use client"

import * as React from "react"
import { ChevronsUpDown, X, Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import type { FilterValue } from "@/lib/types"

interface EnhancedMultiSelectProps {
  options: Array<{ value: string; count?: number; disabled?: boolean }>
  selected: FilterValue[]
  onChange: (selected: FilterValue[]) => void
  placeholder?: string
  className?: string
  isApplying?: boolean
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
        "mr-1 mb-1 flex items-center gap-1 pr-1",
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
          "flex items-center justify-center w-4 h-4 rounded-sm",
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
        className="ml-1"
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
  disabled,
  isSelected,
  filterValue,
  onSelect,
  onSelectInclude,
  onSelectExclude
}: {
  value: string
  disabled: boolean
  isSelected: boolean
  filterValue?: FilterValue
  onSelect: () => void
  onSelectInclude: () => void
  onSelectExclude: () => void
}) => {
  const isInclude = filterValue?.mode === 'include'

  return (
    <CommandItem
      key={value}
      onSelect={onSelect}
      disabled={disabled}
      className={cn(
        "cursor-pointer",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-accent/50",
        isSelected && (isInclude
          ? "bg-green-500/10 hover:bg-green-500/20"
          : "bg-red-500/10 hover:bg-red-500/20")
      )}
    >
      <div className="flex items-center justify-between flex-1">
        <span className="flex-1">{value}</span>
        <div className="flex gap-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900/20"
            onClick={(e) => {
              e.stopPropagation()
              onSelectInclude()
            }}
            title="Include"
          >
            <Plus className="h-3 w-3 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
            onClick={(e) => {
              e.stopPropagation()
              onSelectExclude()
            }}
            title="Exclude"
          >
            <Minus className="h-3 w-3 text-red-600" />
          </Button>
        </div>
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
  isApplying = false,
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

  const handleSelect = React.useCallback((value: string, mode?: 'include' | 'exclude') => {
    const option = options.find((opt) => (typeof opt === "string" ? opt === value : opt.value === value))
    if (typeof option === "object" && option.disabled) return

    const existingIndex = selected.findIndex((i) => i.value === value)

    if (existingIndex >= 0) {
      if (mode) {
        // If mode is explicitly provided, set it
        onChange(
          selected.map((i, idx) =>
            idx === existingIndex ? { ...i, mode } : i
          )
        )
      } else {
        // If already selected and no mode provided, toggle mode
        const currentMode = selected[existingIndex].mode
        onChange(
          selected.map((i, idx) =>
            idx === existingIndex
              ? { ...i, mode: currentMode === 'include' ? 'exclude' : 'include' }
              : i
          )
        )
      }
    } else {
      // Add with specified mode or default to include
      onChange([...selected, { value, mode: mode || 'include' }])
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
      const disabled = typeof option === "object" ? (option.disabled ?? false) : false
      const filterValue = selected.find((s) => s.value === value)
      const isSelected = !!filterValue

      return (
        <EnhancedSelectItem
          key={value}
          value={value}
          disabled={disabled}
          isSelected={isSelected}
          filterValue={filterValue}
          onSelect={() => handleSelect(value)}
          onSelectInclude={() => handleSelect(value, 'include')}
          onSelectExclude={() => handleSelect(value, 'exclude')}
        />
      )
    })
  }, [options, selected, handleSelect])

  // Count include vs exclude
  const includeCount = selected.filter(s => s.mode === 'include').length
  const excludeCount = selected.filter(s => s.mode === 'exclude').length

  // Handle isApplying changes to trigger success state
  const [showSuccess, setShowSuccess] = React.useState(false)
  const prevIsApplying = React.useRef(isApplying)

  React.useEffect(() => {
    if (prevIsApplying.current && !isApplying) {
      // Just finished applying
      setShowSuccess(true)
      const timer = setTimeout(() => {
        setShowSuccess(false)
      }, 500)
      return () => clearTimeout(timer)
    }
    prevIsApplying.current = isApplying
  }, [isApplying])

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2 w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between h-auto min-h-10 bg-transparent hover:bg-accent/30 flex-1"
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
                "h-4 w-4 shrink-0 opacity-50 ml-2",
                open && "rotate-180"
              )} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[200px] p-0" align="start">
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
    </div>
  )
})

EnhancedMultiSelect.displayName = "EnhancedMultiSelect"
