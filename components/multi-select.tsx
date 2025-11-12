"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface MultiSelectProps {
  options: Array<{ value: string; count?: number; disabled?: boolean }>
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

// Memoized Badge component for performance
const SelectBadge = React.memo(({ item, onRemove }: { item: string; onRemove: () => void }) => (
  <Badge
    variant="secondary"
    key={item}
    className="mr-1 mb-1 hover:bg-secondary/80 cursor-pointer group"
    onClick={(e) => {
      e.preventDefault()
      e.stopPropagation()
      onRemove()
    }}
  >
    {item}
    <X className="ml-1 h-3 w-3" />
  </Badge>
))
SelectBadge.displayName = "SelectBadge"

// Memoized Command Item for better performance
const SelectItem = React.memo(({
  value,
  count,
  disabled,
  isSelected,
  onSelect
}: {
  value: string
  count?: number
  disabled: boolean
  isSelected: boolean
  onSelect: () => void
}) => (
  <CommandItem
    key={value}
    onSelect={onSelect}
    disabled={disabled}
    className={cn(
      "cursor-pointer",
      disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-accent/50"
    )}
  >
    <div className="flex items-center space-x-2 flex-1">
      <Checkbox
        checked={isSelected}
        disabled={disabled}
        className="h-4 w-4"
      />
      <Check
        className={cn(
          "h-4 w-4",
          isSelected ? "opacity-100" : "opacity-0"
        )}
      />
      <span className="flex-1">{value}</span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground ml-2 font-medium">
          ({count})
        </span>
      )}
    </div>
  </CommandItem>
))
SelectItem.displayName = "SelectItem"

export const MultiSelect = React.memo(function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = React.useCallback((item: string) => {
    onChange(selected.filter((i) => i !== item))
  }, [selected, onChange])

  const handleSelect = React.useCallback((item: string) => {
    const option = options.find((opt) => (typeof opt === "string" ? opt === item : opt.value === item))
    if (typeof option === "object" && option.disabled) return

    if (selected.includes(item)) {
      onChange(selected.filter((i) => i !== item))
    } else {
      onChange([...selected, item])
    }
  }, [options, selected, onChange])

  const renderBadges = React.useMemo(() => {
    return selected.map((item) => (
      <SelectBadge
        key={item}
        item={item}
        onRemove={() => handleUnselect(item)}
      />
    ))
  }, [selected, handleUnselect])

  const renderOptions = React.useMemo(() => {
    return options.map((option) => {
      const value = typeof option === "string" ? option : option.value
      const count = typeof option === "object" ? option.count : undefined
      const disabled = typeof option === "object" ? option.disabled : false

      return (
        <SelectItem
          key={value}
          value={value}
          count={count}
          disabled={disabled}
          isSelected={selected.includes(value)}
          onSelect={() => handleSelect(value)}
        />
      )
    })
  }, [options, selected, handleSelect])

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between h-auto min-h-10 bg-transparent hover:bg-accent/30"
          >
            <div className="flex gap-1 flex-wrap">
              {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
              {renderBadges}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
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

MultiSelect.displayName = "MultiSelect"
