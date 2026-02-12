"use client"

import React, { useState } from 'react'
import { Briefcase, Building, Filter, Users } from 'lucide-react'
import { SavedFiltersManager } from '@/components/saved-filters-manager'
import {
  AccountFiltersSection,
  CenterFiltersSection,
  ProspectFiltersSection,
} from '@/components/filters/filter-sections'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import type { AvailableOptions, Filters } from '@/lib/types'

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
}: FiltersSidebarProps): JSX.Element {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  return (
    <div className="bg-sidebar/90 backdrop-blur-sm overflow-y-auto overflow-x-hidden w-[320px] shrink-0 relative ml-6 mt-[var(--dashboard-content-top-gap)] mb-[var(--dashboard-content-bottom-gap)] rounded-2xl border border-sidebar-border shadow-[0_24px_60px_-45px_rgba(0,0,0,0.55)] transition-colors">
      <div className="p-4 space-y-3">
        <div className="flex flex-col gap-2 mb-3 pb-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Intelligence Filters</span>
          </div>
          <p className="text-xs text-muted-foreground">Slice the market by account profile, center footprint, and prospect signals.</p>
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

        <Accordion type="multiple" defaultValue={["accounts"]} className="w-full space-y-2">
          <AccordionItem value="accounts" className="overflow-hidden rounded-xl border border-border/70 bg-secondary/30 px-3 data-[state=open]:bg-background data-[state=open]:shadow-sm">
            <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
              <div className="flex items-center gap-2.5">
                <Building className="h-4 w-4 text-primary" />
                <span className="uppercase tracking-wider text-[12px]">Account Attributes</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3 pt-1">
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

          <AccordionItem value="centers" className="overflow-hidden rounded-xl border border-border/70 bg-secondary/30 px-3 data-[state=open]:bg-background data-[state=open]:shadow-sm">
            <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
              <div className="flex items-center gap-2.5">
                <Briefcase className="h-4 w-4 text-[hsl(var(--chart-2))]" />
                <span className="uppercase tracking-wider text-[12px]">Center Attributes</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3 pt-1">
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

          <AccordionItem value="prospects" className="overflow-hidden rounded-xl border border-border/70 bg-secondary/30 px-3 data-[state=open]:bg-background data-[state=open]:shadow-sm">
            <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-[hsl(var(--chart-3))]" />
                <span className="uppercase tracking-wider text-[12px]">Prospect Attributes</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3 pt-1">
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
