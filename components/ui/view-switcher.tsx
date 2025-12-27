"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type SwitcherOption<V extends string> = {
  value: V
  label: string
  icon?: React.ReactNode
}

interface ViewSwitcherProps<V extends string> {
  value: V
  onValueChange: (value: V) => void
  options: SwitcherOption<V>[]
  className?: string
}

export function ViewSwitcher<V extends string>({
  value,
  onValueChange,
  options,
  className,
}: ViewSwitcherProps<V>) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as V)} className={cn("w-fit", className)}>
      <TabsList className="gap-2 bg-muted/80 shadow-sm">
        {options.map(({ value: optionValue, label, icon }) => (
          <TabsTrigger key={optionValue} value={optionValue} className="gap-2 data-[state=active]:shadow-sm">
            {icon}
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
