"use client"

import React, { useState } from "react"
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
  Loader2,
  Building,
  Briefcase,
  Users,
  X,
} from "lucide-react"
import { MultiSelect } from "@/components/multi-select"
import { SavedFiltersManager } from "@/components/saved-filters-manager"
import type { Filters, AvailableOptions } from "@/lib/types"

interface FiltersSidebarProps {
  // State values
  filters: Filters
  pendingFilters: Filters
  availableOptions: AvailableOptions
  isApplying: boolean
  revenueRange: { min: number; max: number }

  // Callback functions
  setPendingFilters: React.Dispatch<React.SetStateAction<Filters>>
  applyFilters: () => void
  resetFilters: () => void
  handleExportAll: () => void
  handleMinRevenueChange: (value: string) => void
  handleMaxRevenueChange: (value: string) => void

  // Helper functions
  getTotalActiveFilters: () => number
  getTotalPendingFilters: () => number
  hasUnappliedChanges: () => boolean
  handleLoadSavedFilters: (savedFilters: Filters) => void
  formatRevenueInMillions: (value: number) => string
}

export function FiltersSidebar({
  filters,
  pendingFilters,
  availableOptions,
  isApplying,
  revenueRange,
  setPendingFilters,
  applyFilters,
  resetFilters,
  handleExportAll,
  handleMinRevenueChange,
  handleMaxRevenueChange,
  getTotalActiveFilters,
  getTotalPendingFilters,
  hasUnappliedChanges,
  handleLoadSavedFilters,
  formatRevenueInMillions,
}: FiltersSidebarProps) {
  return (
    <div className="w-[30%] border-r bg-sidebar overflow-y-auto animate-slide-in will-change-auto">
      <div className="p-4 space-y-4">
        {/* Filter Actions */}
        <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Filters</span>
            {getTotalActiveFilters() > 0 && (
              <Badge variant="secondary" className="ml-auto">{getTotalActiveFilters()} active</Badge>
            )}
            {hasUnappliedChanges() && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Pending
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <SavedFiltersManager
              currentFilters={filters}
              onLoadFilters={handleLoadSavedFilters}
              totalActiveFilters={getTotalActiveFilters()}
            />
            <Button
              variant="default"
              size="sm"
              onClick={applyFilters}
              disabled={!hasUnappliedChanges() || isApplying}
              className="w-full flex items-center justify-center gap-2"
            >
              {isApplying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Filter className="h-4 w-4" />
                  Apply Filters {getTotalPendingFilters() > 0 && `(${getTotalPendingFilters()})`}
                </>
              )}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetFilters} className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button variant="default" size="sm" onClick={handleExportAll} className="flex-1 flex items-center justify-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
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
                {/* Account Name Search Keywords */}
                <div className="space-y-2 pb-4 border-b border-border">
                  <Label className="text-xs font-medium">Search Account Name</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Add keywords to search in account names (press Enter to add)
                  </p>
                  <TitleKeywordInput
                    keywords={pendingFilters.accountNameKeywords}
                    onChange={(keywords) => setPendingFilters((prev) => ({ ...prev, accountNameKeywords: keywords }))}
                    placeholder="e.g., 3M, ABB, Google..."
                  />
                </div>

                {/* Account Filters */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Countries ({availableOptions.accountCountries?.length || 0})</Label>
                    <MultiSelect
                      options={availableOptions.accountCountries || []}
                      selected={pendingFilters.accountCountries}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, accountCountries: selected }))}
                      placeholder="Select countries..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Regions ({availableOptions.accountRegions?.length || 0})</Label>
                    <MultiSelect
                      options={availableOptions.accountRegions || []}
                      selected={pendingFilters.accountRegions}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, accountRegions: selected }))}
                      placeholder="Select regions..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Industries ({availableOptions.accountIndustries.length})</Label>
                    <MultiSelect
                      options={availableOptions.accountIndustries}
                      selected={pendingFilters.accountIndustries}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, accountIndustries: selected }))}
                      placeholder="Select industries..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Sub Industries ({availableOptions.accountSubIndustries.length})</Label>
                    <MultiSelect
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
                    <MultiSelect
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
                    <MultiSelect
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
                    <MultiSelect
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
                    <MultiSelect
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
                    <MultiSelect
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
                    <MultiSelect
                      options={availableOptions.centerTypes}
                      selected={pendingFilters.centerTypes}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerTypes: selected }))}
                      placeholder="Select types..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Center Focus ({availableOptions.centerFocus.length})</Label>
                    <MultiSelect
                      options={availableOptions.centerFocus}
                      selected={pendingFilters.centerFocus}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerFocus: selected }))}
                      placeholder="Select focus..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Cities ({availableOptions.centerCities.length})</Label>
                    <MultiSelect
                      options={availableOptions.centerCities}
                      selected={pendingFilters.centerCities}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerCities: selected }))}
                      placeholder="Select cities..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">States ({availableOptions.centerStates.length})</Label>
                    <MultiSelect
                      options={availableOptions.centerStates}
                      selected={pendingFilters.centerStates}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerStates: selected }))}
                      placeholder="Select states..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Countries ({availableOptions.centerCountries.length})</Label>
                    <MultiSelect
                      options={availableOptions.centerCountries}
                      selected={pendingFilters.centerCountries}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerCountries: selected }))}
                      placeholder="Select countries..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Center Employees ({availableOptions.centerEmployees.length})</Label>
                    <MultiSelect
                      options={availableOptions.centerEmployees}
                      selected={pendingFilters.centerEmployees}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerEmployees: selected }))}
                      placeholder="Select employees range..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Center Status ({availableOptions.centerStatuses.length})</Label>
                    <MultiSelect
                      options={availableOptions.centerStatuses}
                      selected={pendingFilters.centerStatuses}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerStatuses: selected }))}
                      placeholder="Select status..."
                    />
                  </div>

                  {/* Functions nested inside Centers */}
                  <div className="space-y-2 pt-4 mt-4 border-t border-border">
                    <Label className="text-xs font-medium">Functions ({availableOptions.functionTypes.length})</Label>
                    <MultiSelect
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
                    <MultiSelect
                      options={availableOptions.prospectDepartments || []}
                      selected={pendingFilters.prospectDepartments}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, prospectDepartments: selected }))}
                      placeholder="Select departments..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Levels ({availableOptions.prospectLevels?.length || 0})</Label>
                    <MultiSelect
                      options={availableOptions.prospectLevels || []}
                      selected={pendingFilters.prospectLevels}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, prospectLevels: selected }))}
                      placeholder="Select levels..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Cities ({availableOptions.prospectCities?.length || 0})</Label>
                    <MultiSelect
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
    </div>
  )
}

// Title Keyword Input Component
function TitleKeywordInput({ keywords, onChange, placeholder = "e.g., Manager, Director, VP..." }: { keywords: string[]; onChange: (keywords: string[]) => void; placeholder?: string }) {
  const [inputValue, setInputValue] = useState("")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault()
      const trimmedValue = inputValue.trim()
      if (!keywords.includes(trimmedValue)) {
        onChange([...keywords, trimmedValue])
      }
      setInputValue("")
    }
  }

  const removeKeyword = (keywordToRemove: string) => {
    onChange(keywords.filter((k) => k !== keywordToRemove))
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
          {keywords.map((keyword) => (
            <Badge
              key={keyword}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 text-xs"
            >
              {keyword}
              <button
                onClick={() => removeKeyword(keyword)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
