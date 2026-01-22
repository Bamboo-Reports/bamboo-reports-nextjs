"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import {
  Filter,
  Building,
  Briefcase,
  Users,
  X,
  Plus,
  Minus,
} from "lucide-react"
import { EnhancedMultiSelect } from "@/components/enhanced-multi-select"
import { SavedFiltersManager } from "@/components/saved-filters-manager"
import { AccountAutocomplete } from "@/components/filters/account-autocomplete"
import type { Filters, AvailableOptions, FilterValue } from "@/lib/types"

interface FiltersSidebarProps {
  // State values
  filters: Filters
  pendingFilters: Filters
  availableOptions: AvailableOptions
  isApplying: boolean
  revenueRange: { min: number; max: number }
  yearsInIndiaRange: { min: number; max: number }
  firstCenterYearRange: { min: number; max: number }
  centerIncYearRange: { min: number; max: number }
  accountNames: string[]

  // Callback functions
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

  // Helper functions
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
          {/* Filter Actions */}
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

          {/* Accordion Filters */}
          <Accordion type="multiple" defaultValue={[]} className="w-full">
            {/* Accounts Accordion */}
            <AccordionItem value="accounts">
              <AccordionTrigger className="text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-[hsl(var(--chart-1))]" />
                  <span className="uppercase tracking-wider">Account Attributes</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="max-h-[320px] overflow-y-auto pr-2">
                  <div className="space-y-4 pt-2">
                  {/* Account Name Search with Autocomplete */}
                  <div className="space-y-2 pb-4 border-b border-border">
                    <Label className="text-xs font-medium">Search Account Name</Label>
                    <AccountAutocomplete
                      accountNames={accountNames}
                      selectedAccounts={pendingFilters.accountNameKeywords}
                      onChange={(keywords) => setPendingFilters((prev) => ({ ...prev, accountNameKeywords: keywords }))}
                      placeholder="Type to search account names..."
                    />
                  </div>

                  {/* Account Filters */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Countries</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.accountCountries || []}
                        selected={pendingFilters.accountCountries}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, accountCountries: selected }))
                          setActiveFilter("accountCountries")
                        }}
                        placeholder="Select countries..."
                        isApplying={isApplying && activeFilter === "accountCountries"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Industries</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.accountIndustries}
                        selected={pendingFilters.accountIndustries}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, accountIndustries: selected }))
                          setActiveFilter("accountIndustries")
                        }}
                        placeholder="Select industries..."
                        isApplying={isApplying && activeFilter === "accountIndustries"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Primary Categories</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.accountPrimaryCategories}
                        selected={pendingFilters.accountPrimaryCategories}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, accountPrimaryCategories: selected }))
                          setActiveFilter("accountPrimaryCategories")
                        }}
                        placeholder="Select categories..."
                        isApplying={isApplying && activeFilter === "accountPrimaryCategories"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Primary Nature</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.accountPrimaryNatures}
                        selected={pendingFilters.accountPrimaryNatures}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, accountPrimaryNatures: selected }))
                          setActiveFilter("accountPrimaryNatures")
                        }}
                        placeholder="Select nature..."
                        isApplying={isApplying && activeFilter === "accountPrimaryNatures"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">NASSCOM Status</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.accountNasscomStatuses}
                        selected={pendingFilters.accountNasscomStatuses}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, accountNasscomStatuses: selected }))
                          setActiveFilter("accountNasscomStatuses")
                        }}
                        placeholder="Select NASSCOM status..."
                        isApplying={isApplying && activeFilter === "accountNasscomStatuses"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Employees Range</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.accountEmployeesRanges}
                        selected={pendingFilters.accountEmployeesRanges}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, accountEmployeesRanges: selected }))
                          setActiveFilter("accountEmployeesRanges")
                        }}
                        placeholder="Select employees range..."
                        isApplying={isApplying && activeFilter === "accountEmployeesRanges"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Center Employees</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.accountCenterEmployees}
                        selected={pendingFilters.accountCenterEmployees}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, accountCenterEmployees: selected }))
                          setActiveFilter("accountCenterEmployees")
                        }}
                        placeholder="Select center employees..."
                        isApplying={isApplying && activeFilter === "accountCenterEmployees"}
                      />
                    </div>

                    {/* Revenue Range */}
                    <div className="space-y-3 pt-4 mt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">
                          Revenue: {formatRevenueInMillions(pendingFilters.accountRevenueRange[0])} -{" "}
                          {formatRevenueInMillions(pendingFilters.accountRevenueRange[1])}
                        </Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="include-null-revenue"
                            checked={pendingFilters.includeNullRevenue || false}
                            onChange={(e) =>
                              setPendingFilters((prev) => ({
                                ...prev,
                                includeNullRevenue: e.target.checked,
                              }))
                            }
                            className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-border rounded"
                          />
                          <Label htmlFor="include-null-revenue" className="text-xs text-foreground cursor-pointer">
                            Include null/zero
                          </Label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="min-revenue" className="text-xs">Min (M)</Label>
                          <Input
                            id="min-revenue"
                            type="number"
                            value={pendingFilters.accountRevenueRange[0]}
                            onChange={(e) => handleMinRevenueChange(e.target.value)}
                            min={revenueRange.min}
                            max={pendingFilters.accountRevenueRange[1]}
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="max-revenue" className="text-xs">Max (M)</Label>
                          <Input
                            id="max-revenue"
                            type="number"
                            value={pendingFilters.accountRevenueRange[1]}
                            onChange={(e) => handleMaxRevenueChange(e.target.value)}
                            min={pendingFilters.accountRevenueRange[0]}
                            max={revenueRange.max}
                            className="text-xs h-8"
                          />
                        </div>
                      </div>
                      <div className="px-2">
                        <Slider
                          value={pendingFilters.accountRevenueRange}
                          onValueChange={(value) => handleRevenueRangeChange(value as [number, number])}
                          min={revenueRange.min}
                          max={revenueRange.max}
                          step={Math.max(1, Math.floor((revenueRange.max - revenueRange.min) / 1000))}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground px-2">
                        <span>{formatRevenueInMillions(revenueRange.min)}</span>
                        <span>{formatRevenueInMillions(revenueRange.max)}</span>
                      </div>
                    </div>

                    {/* Total India Headcount Range */}
                    <div className="space-y-3 pt-4 mt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">
                          Total India Headcount: {pendingFilters.accountYearsInIndiaRange[0].toLocaleString()} -{" "}
                          {pendingFilters.accountYearsInIndiaRange[1].toLocaleString()}
                        </Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="include-null-years-in-india"
                            checked={pendingFilters.includeNullYearsInIndia || false}
                            onChange={(e) =>
                              setPendingFilters((prev) => ({
                                ...prev,
                                includeNullYearsInIndia: e.target.checked,
                              }))
                            }
                            className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-border rounded"
                          />
                          <Label htmlFor="include-null-years-in-india" className="text-xs text-foreground cursor-pointer">
                            Include null/zero
                          </Label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="min-years-in-india" className="text-xs">Min</Label>
                          <Input
                            id="min-years-in-india"
                            type="number"
                            value={pendingFilters.accountYearsInIndiaRange[0]}
                            onChange={(e) => handleMinYearsInIndiaChange(e.target.value)}
                            min={yearsInIndiaRange.min}
                            max={pendingFilters.accountYearsInIndiaRange[1]}
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="max-years-in-india" className="text-xs">Max</Label>
                          <Input
                            id="max-years-in-india"
                            type="number"
                            value={pendingFilters.accountYearsInIndiaRange[1]}
                            onChange={(e) => handleMaxYearsInIndiaChange(e.target.value)}
                            min={pendingFilters.accountYearsInIndiaRange[0]}
                            max={yearsInIndiaRange.max}
                            className="text-xs h-8"
                          />
                        </div>
                      </div>
                      <div className="px-2">
                        <Slider
                          value={pendingFilters.accountYearsInIndiaRange}
                          onValueChange={(value) => handleYearsInIndiaRangeChange(value as [number, number])}
                          min={yearsInIndiaRange.min}
                          max={yearsInIndiaRange.max}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground px-2">
                        <span>{yearsInIndiaRange.min.toLocaleString()}</span>
                        <span>{yearsInIndiaRange.max.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Years In India Range */}
                    <div className="space-y-3 pt-4 mt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">
                          Years In India: {pendingFilters.accountFirstCenterYearRange[0].toLocaleString()} -{" "}
                          {pendingFilters.accountFirstCenterYearRange[1].toLocaleString()}
                        </Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="include-null-first-center-year"
                            checked={pendingFilters.includeNullFirstCenterYear || false}
                            onChange={(e) =>
                              setPendingFilters((prev) => ({
                                ...prev,
                                includeNullFirstCenterYear: e.target.checked,
                              }))
                            }
                            className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-border rounded"
                          />
                          <Label htmlFor="include-null-first-center-year" className="text-xs text-foreground cursor-pointer">
                            Include null/zero
                          </Label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="min-first-center-year" className="text-xs">Min</Label>
                          <Input
                            id="min-first-center-year"
                            type="number"
                            value={pendingFilters.accountFirstCenterYearRange[0]}
                            onChange={(e) => handleMinFirstCenterYearChange(e.target.value)}
                            min={firstCenterYearRange.min}
                            max={pendingFilters.accountFirstCenterYearRange[1]}
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="max-first-center-year" className="text-xs">Max</Label>
                          <Input
                            id="max-first-center-year"
                            type="number"
                            value={pendingFilters.accountFirstCenterYearRange[1]}
                            onChange={(e) => handleMaxFirstCenterYearChange(e.target.value)}
                            min={pendingFilters.accountFirstCenterYearRange[0]}
                            max={firstCenterYearRange.max}
                            className="text-xs h-8"
                          />
                        </div>
                      </div>
                      <div className="px-2">
                        <Slider
                          value={pendingFilters.accountFirstCenterYearRange}
                          onValueChange={(value) => handleFirstCenterYearRangeChange(value as [number, number])}
                          min={firstCenterYearRange.min}
                          max={firstCenterYearRange.max}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground px-2">
                        <span>{firstCenterYearRange.min.toLocaleString()}</span>
                        <span>{firstCenterYearRange.max.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
            </AccordionItem>

            {/* Centers Accordion */}
            <AccordionItem value="centers">
              <AccordionTrigger className="text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[hsl(var(--chart-2))]" />
                  <span className="uppercase tracking-wider">Center Attributes</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="max-h-[320px] overflow-y-auto pr-2">
                  <div className="space-y-4 pt-2">
                  {/* Center Filters */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Center Types</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.centerTypes}
                        selected={pendingFilters.centerTypes}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, centerTypes: selected }))
                          setActiveFilter("centerTypes")
                        }}
                        placeholder="Select types..."
                        isApplying={isApplying && activeFilter === "centerTypes"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Center Focus</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.centerFocus}
                        selected={pendingFilters.centerFocus}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, centerFocus: selected }))
                          setActiveFilter("centerFocus")
                        }}
                        placeholder="Select focus..."
                        isApplying={isApplying && activeFilter === "centerFocus"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Cities</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.centerCities}
                        selected={pendingFilters.centerCities}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, centerCities: selected }))
                          setActiveFilter("centerCities")
                        }}
                        placeholder="Select cities..."
                        isApplying={isApplying && activeFilter === "centerCities"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">States</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.centerStates}
                        selected={pendingFilters.centerStates}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, centerStates: selected }))
                          setActiveFilter("centerStates")
                        }}
                        placeholder="Select states..."
                        isApplying={isApplying && activeFilter === "centerStates"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Countries</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.centerCountries}
                        selected={pendingFilters.centerCountries}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, centerCountries: selected }))
                          setActiveFilter("centerCountries")
                        }}
                        placeholder="Select countries..."
                        isApplying={isApplying && activeFilter === "centerCountries"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Center Employees</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.centerEmployees}
                        selected={pendingFilters.centerEmployees}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, centerEmployees: selected }))
                          setActiveFilter("centerEmployees")
                        }}
                        placeholder="Select employees range..."
                        isApplying={isApplying && activeFilter === "centerEmployees"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Center Status</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.centerStatuses}
                        selected={pendingFilters.centerStatuses}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, centerStatuses: selected }))
                          setActiveFilter("centerStatuses")
                        }}
                        placeholder="Select status..."
                        isApplying={isApplying && activeFilter === "centerStatuses"}
                      />
                    </div>

                    {/* Center Timeline Range */}
                    <div className="space-y-3 pt-4 mt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">
                          Timeline: {pendingFilters.centerIncYearRange[0].toLocaleString()} -{" "}
                          {pendingFilters.centerIncYearRange[1].toLocaleString()}
                        </Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="include-null-center-inc-year"
                            checked={pendingFilters.includeNullCenterIncYear || false}
                            onChange={(e) =>
                              setPendingFilters((prev) => ({
                                ...prev,
                                includeNullCenterIncYear: e.target.checked,
                              }))
                            }
                            className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-border rounded"
                          />
                          <Label htmlFor="include-null-center-inc-year" className="text-xs text-foreground cursor-pointer">
                            Include null/zero
                          </Label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="min-center-inc-year" className="text-xs">Min</Label>
                          <Input
                            id="min-center-inc-year"
                            type="number"
                            value={pendingFilters.centerIncYearRange[0]}
                            onChange={(e) => handleMinCenterIncYearChange(e.target.value)}
                            min={centerIncYearRange.min}
                            max={pendingFilters.centerIncYearRange[1]}
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="max-center-inc-year" className="text-xs">Max</Label>
                          <Input
                            id="max-center-inc-year"
                            type="number"
                            value={pendingFilters.centerIncYearRange[1]}
                            onChange={(e) => handleMaxCenterIncYearChange(e.target.value)}
                            min={pendingFilters.centerIncYearRange[0]}
                            max={centerIncYearRange.max}
                            className="text-xs h-8"
                          />
                        </div>
                      </div>
                      <div className="px-2">
                        <Slider
                          value={pendingFilters.centerIncYearRange}
                          onValueChange={(value) => handleCenterIncYearRangeChange(value as [number, number])}
                          min={centerIncYearRange.min}
                          max={centerIncYearRange.max}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground px-2">
                        <span>{centerIncYearRange.min.toLocaleString()}</span>
                        <span>{centerIncYearRange.max.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Functions nested inside Centers */}
                    <div className="space-y-2 pt-4 mt-4 border-t border-border">
                      <Label className="text-xs font-medium">Functions</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.functionTypes}
                        selected={pendingFilters.functionTypes}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, functionTypes: selected }))
                          setActiveFilter("functionTypes")
                        }}
                        placeholder="Select functions..."
                        isApplying={isApplying && activeFilter === "functionTypes"}
                      />
                    </div>
                    <div className="space-y-2 pt-4 mt-4 border-t border-border">
                      <Label className="text-xs font-medium">Software In Use</Label>
                      <TitleKeywordInput
                        keywords={pendingFilters.centerSoftwareInUseKeywords}
                        onChange={(keywords) =>
                          setPendingFilters((prev) => ({ ...prev, centerSoftwareInUseKeywords: keywords }))
                        }
                        placeholder="e.g., SAP, Oracle, Workday..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
            </AccordionItem>

            {/* Prospects Accordion */}
            <AccordionItem value="prospects">
              <AccordionTrigger className="text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[hsl(var(--chart-3))]" />
                  <span className="uppercase tracking-wider">Prospect Attributes</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="max-h-[320px] overflow-y-auto pr-2">
                  <div className="space-y-4 pt-2">
                  {/* Prospect Filters */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Departments</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.prospectDepartments || []}
                        selected={pendingFilters.prospectDepartments}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, prospectDepartments: selected }))
                          setActiveFilter("prospectDepartments")
                        }}
                        placeholder="Select departments..."
                        isApplying={isApplying && activeFilter === "prospectDepartments"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Levels</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.prospectLevels || []}
                        selected={pendingFilters.prospectLevels}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, prospectLevels: selected }))
                          setActiveFilter("prospectLevels")
                        }}
                        placeholder="Select levels..."
                        isApplying={isApplying && activeFilter === "prospectLevels"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Cities</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.prospectCities || []}
                        selected={pendingFilters.prospectCities}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, prospectCities: selected }))
                          setActiveFilter("prospectCities")
                        }}
                        placeholder="Select cities..."
                        isApplying={isApplying && activeFilter === "prospectCities"}
                      />
                    </div>
                    <div className="space-y-2 pt-4 mt-4 border-t border-border">
                      <Label className="text-xs font-medium">Title Keywords</Label>
                      <TitleKeywordInput
                        keywords={pendingFilters.prospectTitleKeywords}
                        onChange={(keywords) => setPendingFilters((prev) => ({ ...prev, prospectTitleKeywords: keywords }))}
                        placeholder="e.g., Manager, Director, VP..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
    </div>
  )
}

// Title Keyword Input Component with include/exclude support
function TitleKeywordInput({
  keywords,
  onChange,
  placeholder = "e.g., Manager, Director, VP..."
}: {
  keywords: FilterValue[]
  onChange: (keywords: FilterValue[]) => void
  placeholder?: string
}) {
  const [inputValue, setInputValue] = useState("")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault()
      const trimmedValue = inputValue.trim()
      if (!keywords.find((k) => k.value === trimmedValue)) {
        onChange([...keywords, { value: trimmedValue, mode: 'include' }])
      }
      setInputValue("")
    }
  }

  const removeKeyword = (keywordToRemove: FilterValue) => {
    onChange(keywords.filter((k) => k.value !== keywordToRemove.value))
  }

  const toggleKeywordMode = (keyword: FilterValue) => {
    onChange(
      keywords.map((k) =>
        k.value === keyword.value
          ? { ...k, mode: k.mode === 'include' ? 'exclude' : 'include' }
          : k
      )
    )
  }

  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="text-sm"
      />
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {keywords.map((keyword) => {
            const isInclude = keyword.mode === 'include'
            return (
              <Badge
                key={keyword.value}
                variant="secondary"
                className={cn(
                  "flex items-center gap-1 pr-1",
                  isInclude
                    ? "bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-300 border-green-500/50 hover:bg-green-500/30"
                    : "bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-300 border-red-500/50 hover:bg-red-500/30"
                )}
              >
                <button
                  onClick={() => toggleKeywordMode(keyword)}
                  className={cn(
                    "flex items-center justify-center w-4 h-4 rounded-sm",
                    isInclude
                      ? "bg-green-600/30 hover:bg-green-600/50"
                      : "bg-red-600/30 hover:bg-red-600/50"
                  )}
                  title={isInclude ? "Click to exclude" : "Click to include"}
                  type="button"
                >
                  {isInclude ? (
                    <Plus className="h-3 w-3" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                </button>
                <span className="text-xs">{keyword.value}</span>
                <button
                  onClick={() => removeKeyword(keyword)}
                  className="ml-1 rounded-sm opacity-70 hover:opacity-100 hover:bg-accent p-0.5"
                  type="button"
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
