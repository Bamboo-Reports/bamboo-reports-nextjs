"use client"

import React, { useState } from "react"
import { Filter, Building, Briefcase, Users } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { SavedFiltersManager } from "@/components/saved-filters-manager"
import type { Filters, AvailableOptions } from "@/lib/types"
import {
  AccountFiltersSection,
  CenterFiltersSection,
  ProspectFiltersSection,
} from "@/components/filters/filter-sections"

interface FiltersSidebarProps {
  filters: Filters
  pendingFilters: Filters
  availableOptions: AvailableOptions
  isApplying: boolean
  revenueRange: { min: number; max: number }
  yearsInIndiaRange: { min: number; max: number }
  firstCenterYearRange: { min: number; max: number }
  centerIncYearRange: { min: number; max: number }
  accountNames: string[]

  setPendingFilters: React.Dispatch<React.SetStateAction<Filters>>
  resetFilters: () => void
  handleExportAll: () => void
  handleMinRevenueChange: (value: string) => void
  handleMaxRevenueChange: (value: string) => void
  handleRevenueRangeChange: (value: [number, number]) => void
  handleMinYearsInIndiaChange: (value: string) => void
  handleMaxYearsInIndiaChange: (value: string) => void
  handleYearsInIndiaRangeChange: (value: [number, number]) => void
  handleMinFirstCenterYearChange: (value: string) => void
  handleMaxFirstCenterYearChange: (value: string) => void
  handleFirstCenterYearRangeChange: (value: [number, number]) => void
  handleMinCenterIncYearChange: (value: string) => void
  handleMaxCenterIncYearChange: (value: string) => void
  handleCenterIncYearRangeChange: (value: [number, number]) => void

  getTotalActiveFilters: () => number
  handleLoadSavedFilters: (savedFilters: Filters) => void
  formatRevenueInMillions: (value: number) => string
}

export function FiltersSidebar({
  filters,
  pendingFilters,
  availableOptions,
  isApplying,
  revenueRange,
  yearsInIndiaRange,
  firstCenterYearRange,
  centerIncYearRange,
  accountNames,
  setPendingFilters,
  resetFilters,
  handleExportAll,
  handleMinRevenueChange,
  handleMaxRevenueChange,
  handleRevenueRangeChange,
  handleMinYearsInIndiaChange,
  handleMaxYearsInIndiaChange,
  handleYearsInIndiaRangeChange,
  handleMinFirstCenterYearChange,
  handleMaxFirstCenterYearChange,
  handleFirstCenterYearRangeChange,
  handleMinCenterIncYearChange,
  handleMaxCenterIncYearChange,
  handleCenterIncYearRangeChange,
  getTotalActiveFilters,
  handleLoadSavedFilters,
  formatRevenueInMillions,
}: FiltersSidebarProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  return (
    <div className="bg-sidebar overflow-y-auto overflow-x-hidden w-[320px] shrink-0 relative ml-6 mt-6 mb-3 rounded-lg border shadow-sm">
      <div className="p-4 space-y-3">
        <div className="flex flex-col gap-2 mb-3 pb-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Filters</span>
          </div>
          <div className="flex flex-col gap-2">
            <SavedFiltersManager
              currentFilters={filters}
              onLoadFilters={handleLoadSavedFilters}
              totalActiveFilters={getTotalActiveFilters()}
              onReset={resetFilters}
              onExport={handleExportAll}
            />
          </div>
        </div>

        <Accordion type="multiple" defaultValue={[]} className="w-full">
          <AccordionItem value="accounts">
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-[hsl(var(--chart-1))]" />
                <span className="uppercase tracking-wider">Account Attributes</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <AccountFiltersSection
                pendingFilters={pendingFilters}
                availableOptions={availableOptions}
                isApplying={isApplying}
                activeFilter={activeFilter}
                setPendingFilters={setPendingFilters}
                setActiveFilter={setActiveFilter}
                accountNames={accountNames}
                revenueRange={revenueRange}
                yearsInIndiaRange={yearsInIndiaRange}
                firstCenterYearRange={firstCenterYearRange}
                handleMinRevenueChange={handleMinRevenueChange}
                handleMaxRevenueChange={handleMaxRevenueChange}
                handleRevenueRangeChange={handleRevenueRangeChange}
                handleMinYearsInIndiaChange={handleMinYearsInIndiaChange}
                handleMaxYearsInIndiaChange={handleMaxYearsInIndiaChange}
                handleYearsInIndiaRangeChange={handleYearsInIndiaRangeChange}
                handleMinFirstCenterYearChange={handleMinFirstCenterYearChange}
                handleMaxFirstCenterYearChange={handleMaxFirstCenterYearChange}
                handleFirstCenterYearRangeChange={handleFirstCenterYearRangeChange}
                formatRevenueInMillions={formatRevenueInMillions}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="centers">
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[hsl(var(--chart-2))]" />
                <span className="uppercase tracking-wider">Center Attributes</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CenterFiltersSection
                pendingFilters={pendingFilters}
                availableOptions={availableOptions}
                isApplying={isApplying}
                activeFilter={activeFilter}
                setPendingFilters={setPendingFilters}
                setActiveFilter={setActiveFilter}
                centerIncYearRange={centerIncYearRange}
                handleMinCenterIncYearChange={handleMinCenterIncYearChange}
                handleMaxCenterIncYearChange={handleMaxCenterIncYearChange}
                handleCenterIncYearRangeChange={handleCenterIncYearRangeChange}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="prospects">
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[hsl(var(--chart-3))]" />
                <span className="uppercase tracking-wider">Prospect Attributes</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ProspectFiltersSection
                pendingFilters={pendingFilters}
                availableOptions={availableOptions}
                isApplying={isApplying}
                activeFilter={activeFilter}
                setPendingFilters={setPendingFilters}
                setActiveFilter={setActiveFilter}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
