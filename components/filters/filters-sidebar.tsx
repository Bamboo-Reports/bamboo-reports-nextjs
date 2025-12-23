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
  Loader2,
  Building,
  Briefcase,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
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
  handleMinRevenueChange,
  handleMaxRevenueChange,
  getTotalActiveFilters,
  handleLoadSavedFilters,
  formatRevenueInMillions,
}: FiltersSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const activeFilters = getTotalActiveFilters()

  return (
    <div className={cn(
      "relative h-full border-r bg-sidebar/95 overflow-y-auto transition-all duration-300 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm",
      isCollapsed ? "w-14 px-0" : "w-[30%] min-w-[320px] max-w-[380px] px-4 shadow-sm"
    )}>
      {/* Collapse/Expand Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute top-4 z-20 h-9 w-9 rounded-full border-sidebar-border/70 bg-background/90 text-muted-foreground shadow-sm transition hover:shadow",
          isCollapsed ? "left-1/2 -translate-x-1/2" : "right-1"
        )}
        title={isCollapsed ? "Expand filters" : "Collapse filters"}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {/* Collapsed State */}
      {isCollapsed && (
        <div className="flex h-full flex-col items-center justify-between py-10">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-accent text-sidebar-foreground shadow-sm">
              <Filter className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Filters
            </span>
            {activeFilters > 0 && (
              <Badge variant="secondary" className="rounded-full px-2 py-1 text-[10px]">
                {activeFilters}
              </Badge>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 pb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={resetFilters}
              className="border border-sidebar-border/70 bg-sidebar-accent/60 text-foreground hover:bg-sidebar-accent"
              title="Reset filters"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Expanded State */}
      {!isCollapsed && (
        <div className="p-4 space-y-4 pt-16">
        {/* Filter Actions */}
        <div className="space-y-4 rounded-2xl border border-sidebar-border/70 bg-gradient-to-b from-sidebar-accent/80 via-sidebar to-sidebar px-4 py-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Filter className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Filters</span>
                {activeFilters > 0 && (
                  <Badge variant="secondary" className="rounded-full">{activeFilters} active</Badge>
                )}
                {isApplying && (
                  <Badge variant="outline" className="flex items-center gap-1 text-blue-600 border-blue-600">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Auto-applying
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Curate results, save favorite filter sets, or quickly reset and export.
              </p>
            </div>
          </div>

          <SavedFiltersManager
            currentFilters={filters}
            onLoadFilters={handleLoadSavedFilters}
            totalActiveFilters={activeFilters}
          />

          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" size="sm" onClick={resetFilters} className="h-10 justify-center border-dashed">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
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
                    <Label className="text-xs font-medium">Countries ({availableOptions.accountCountries?.length || 0})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.accountCountries || []}
                      selected={pendingFilters.accountCountries}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, accountCountries: selected }))}
                      placeholder="Select countries..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Regions ({availableOptions.accountRegions?.length || 0})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.accountRegions || []}
                      selected={pendingFilters.accountRegions}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, accountRegions: selected }))}
                      placeholder="Select regions..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Industries ({availableOptions.accountIndustries.length})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.accountIndustries}
                      selected={pendingFilters.accountIndustries}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, accountIndustries: selected }))}
                      placeholder="Select industries..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Sub Industries ({availableOptions.accountSubIndustries.length})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.accountSubIndustries}
                      selected={pendingFilters.accountSubIndustries}
                      onChange={(selected) =>
                        setPendingFilters((prev) => ({ ...prev, accountSubIndustries: selected }))
                      }
                      placeholder="Select sub industries..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Primary Categories ({availableOptions.accountPrimaryCategories.length})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.accountPrimaryCategories}
                      selected={pendingFilters.accountPrimaryCategories}
                      onChange={(selected) =>
                        setPendingFilters((prev) => ({ ...prev, accountPrimaryCategories: selected }))
                      }
                      placeholder="Select categories..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Primary Nature ({availableOptions.accountPrimaryNatures.length})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.accountPrimaryNatures}
                      selected={pendingFilters.accountPrimaryNatures}
                      onChange={(selected) =>
                        setPendingFilters((prev) => ({ ...prev, accountPrimaryNatures: selected }))
                      }
                      placeholder="Select nature..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">NASSCOM Status ({availableOptions.accountNasscomStatuses.length})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.accountNasscomStatuses}
                      selected={pendingFilters.accountNasscomStatuses}
                      onChange={(selected) =>
                        setPendingFilters((prev) => ({ ...prev, accountNasscomStatuses: selected }))
                      }
                      placeholder="Select NASSCOM status..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Employees Range ({availableOptions.accountEmployeesRanges.length})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.accountEmployeesRanges}
                      selected={pendingFilters.accountEmployeesRanges}
                      onChange={(selected) =>
                        setPendingFilters((prev) => ({ ...prev, accountEmployeesRanges: selected }))
                      }
                      placeholder="Select employees range..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Center Employees ({availableOptions.accountCenterEmployees.length})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.accountCenterEmployees}
                      selected={pendingFilters.accountCenterEmployees}
                      onChange={(selected) =>
                        setPendingFilters((prev) => ({ ...prev, accountCenterEmployees: selected }))
                      }
                      placeholder="Select center employees..."
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
                    <Label className="text-xs font-medium">Center Types ({availableOptions.centerTypes.length})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.centerTypes}
                      selected={pendingFilters.centerTypes}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerTypes: selected }))}
                      placeholder="Select types..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Center Focus ({availableOptions.centerFocus.length})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.centerFocus}
                      selected={pendingFilters.centerFocus}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerFocus: selected }))}
                      placeholder="Select focus..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Cities ({availableOptions.centerCities.length})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.centerCities}
                      selected={pendingFilters.centerCities}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerCities: selected }))}
                      placeholder="Select cities..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">States ({availableOptions.centerStates.length})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.centerStates}
                      selected={pendingFilters.centerStates}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerStates: selected }))}
                      placeholder="Select states..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Countries ({availableOptions.centerCountries.length})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.centerCountries}
                      selected={pendingFilters.centerCountries}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerCountries: selected }))}
                      placeholder="Select countries..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Center Employees ({availableOptions.centerEmployees.length})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.centerEmployees}
                      selected={pendingFilters.centerEmployees}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerEmployees: selected }))}
                      placeholder="Select employees range..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Center Status ({availableOptions.centerStatuses.length})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.centerStatuses}
                      selected={pendingFilters.centerStatuses}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerStatuses: selected }))}
                      placeholder="Select status..."
                    />
                  </div>

                  {/* Functions nested inside Centers */}
                  <div className="space-y-2 pt-4 mt-4 border-t border-border">
                    <Label className="text-xs font-medium">Functions ({availableOptions.functionTypes.length})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.functionTypes}
                      selected={pendingFilters.functionTypes}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, functionTypes: selected }))}
                      placeholder="Select functions..."
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
                    <Label className="text-xs font-medium">Departments ({availableOptions.prospectDepartments?.length || 0})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.prospectDepartments || []}
                      selected={pendingFilters.prospectDepartments}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, prospectDepartments: selected }))}
                      placeholder="Select departments..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Levels ({availableOptions.prospectLevels?.length || 0})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.prospectLevels || []}
                      selected={pendingFilters.prospectLevels}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, prospectLevels: selected }))}
                      placeholder="Select levels..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Cities ({availableOptions.prospectCities?.length || 0})</Label>
                    <EnhancedMultiSelect
                      options={availableOptions.prospectCities || []}
                      selected={pendingFilters.prospectCities}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, prospectCities: selected }))}
                      placeholder="Select cities..."
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
