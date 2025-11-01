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

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item))
  }

  const handleSelect = (item: string) => {
    const option = options.find((opt) => (typeof opt === "string" ? opt === item : opt.value === item))
    if (typeof option === "object" && option.disabled) return

    if (selected.includes(item)) {
      onChange(selected.filter((i) => i !== item))
    } else {
      onChange([...selected, item])
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between h-auto min-h-10 bg-transparent"
          >
            <div className="flex gap-1 flex-wrap">
              {selected.length === 0 && placeholder}
              {selected.map((item) => (
                <Badge
                  variant="secondary"
                  key={item}
                  className="mr-1 mb-1"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleUnselect(item)
                  }}
                >
                  {item}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No item found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {options.map((option) => {
                  const value = typeof option === "string" ? option : option.value
                  const count = typeof option === "object" ? option.count : undefined
                  const disabled = typeof option === "object" ? option.disabled : false

                  return (
                    <CommandItem
                      key={value}
                      onSelect={() => handleSelect(value)}
                      disabled={disabled}
                      className={disabled ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <Checkbox checked={selected.includes(value)} disabled={disabled} className="h-4 w-4" />
                        <Check className={cn("h-4 w-4", selected.includes(value) ? "opacity-100" : "opacity-0")} />
                        <span className="flex-1">{value}</span>
                        {count !== undefined && <span className="text-xs text-gray-500 ml-2">({count})</span>}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
