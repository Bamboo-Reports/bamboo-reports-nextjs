"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import {
  Filter,
  RotateCcw,
  Download,

  Building,
  Briefcase,
  Users,
  X,
  PanelLeftOpen,
  PanelLeftClose,
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
  accountNames: string[]

  // Callback functions
  setPendingFilters: React.Dispatch<React.SetStateAction<Filters>>
  resetFilters: () => void
  handleExportAll: () => void
  handleMinRevenueChange: (value: string) => void
  handleMaxRevenueChange: (value: string) => void

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
  accountNames,
  setPendingFilters,
  resetFilters,
  handleExportAll,
  handleMinRevenueChange,
  handleMaxRevenueChange,
  getTotalActiveFilters,
  handleLoadSavedFilters,
  formatRevenueInMillions,
}: FiltersSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  return (
    <div className={cn(
      "border-r bg-sidebar overflow-y-auto overflow-x-hidden transition-all duration-300 relative flex flex-col",
      isCollapsed ? "w-16" : "w-[384px] shrink-0"
    )}>
      {/* Collapsed State */}
      {isCollapsed && (
        <div className="flex flex-col items-center pt-16 space-y-4">
          <div className="flex flex-col items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            {getTotalActiveFilters() > 0 && (
              <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                {getTotalActiveFilters()}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Expanded State */}
      {!isCollapsed && (
        <div className="flex flex-col h-full">
          {/* Filter Header with Toggle */}
          <div className="p-3 pb-3 border-b border-sidebar-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Filters</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-7 w-7 hover:bg-accent rounded-md"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
            <SavedFiltersManager
              currentFilters={filters}
              onLoadFilters={handleLoadSavedFilters}
              totalActiveFilters={getTotalActiveFilters()}
              onReset={resetFilters}
              onExport={handleExportAll}
            />
          </div>

          {/* Accordion Filters */}
          <Accordion type="multiple" defaultValue={["accounts", "centers"]} className="w-full">
            {/* Accounts Accordion */}
            <AccordionItem value="accounts">
              <AccordionTrigger className="text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-[hsl(var(--chart-1))]" />
                  Accounts
                </div>
              </AccordionTrigger>
              <AccordionContent>
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
                      <Label className="text-xs font-medium">Regions</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.accountRegions || []}
                        selected={pendingFilters.accountRegions}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, accountRegions: selected }))
                          setActiveFilter("accountRegions")
                        }}
                        placeholder="Select regions..."
                        isApplying={isApplying && activeFilter === "accountRegions"}
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
                      <Label className="text-xs font-medium">Sub Industries</Label>
                      <EnhancedMultiSelect
                        options={availableOptions.accountSubIndustries}
                        selected={pendingFilters.accountSubIndustries}
                        onChange={(selected) => {
                          setPendingFilters((prev) => ({ ...prev, accountSubIndustries: selected }))
                          setActiveFilter("accountSubIndustries")
                        }}
                        placeholder="Select sub industries..."
                        isApplying={isApplying && activeFilter === "accountSubIndustries"}
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
                          onValueChange={(value) =>
                            setPendingFilters((prev) => ({
                              ...prev,
                              accountRevenueRange: value as [number, number],
                            }))
                          }
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
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Centers Accordion */}
            <AccordionItem value="centers">
              <AccordionTrigger className="text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[hsl(var(--chart-2))]" />
                  Centers
                </div>
              </AccordionTrigger>
              <AccordionContent>
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
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Prospects Accordion */}
            <AccordionItem value="prospects">
              <AccordionTrigger className="text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[hsl(var(--chart-3))]" />
                  Prospects
                </div>
              </AccordionTrigger>
              <AccordionContent>
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
                      <p className="text-xs text-muted-foreground mb-2">
                        Add keywords to search in job titles (press Enter to add)
                      </p>
                      <TitleKeywordInput
                        keywords={pendingFilters.prospectTitleKeywords}
                        onChange={(keywords) => setPendingFilters((prev) => ({ ...prev, prospectTitleKeywords: keywords }))}
                        placeholder="e.g., Manager, Director, VP..."
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
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
