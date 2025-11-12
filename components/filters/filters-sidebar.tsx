"use client"

import React from "react"
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
} from "lucide-react"
import { MultiSelect } from "@/components/multi-select"
import { SavedFiltersManager } from "@/components/saved-filters-manager"
import type { Filters, AvailableOptions } from "@/lib/types"

interface FiltersSidebarProps {
  // State values
  filters: Filters
  availableOptions: AvailableOptions
  revenueRange: { min: number; max: number }

  // Callback functions
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
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
  availableOptions,
  revenueRange,
  setFilters,
  resetFilters,
  handleExportAll,
  handleMinRevenueChange,
  handleMaxRevenueChange,
  getTotalActiveFilters,
  handleLoadSavedFilters,
  formatRevenueInMillions,
}: FiltersSidebarProps) {
  return (
    <div className="w-[30%] border-r bg-sidebar overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Filter Actions */}
        <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Filters</span>
            {getTotalActiveFilters() > 0 && (
              <Badge variant="secondary" className="ml-auto">{getTotalActiveFilters()} active</Badge>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <SavedFiltersManager
              currentFilters={filters}
              onLoadFilters={handleLoadSavedFilters}
              totalActiveFilters={getTotalActiveFilters()}
            />
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
                {/* Account Names Multi-Select */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Account Names ({availableOptions.accountNames?.length || 0})</Label>
                  <MultiSelect
                    options={availableOptions.accountNames || []}
                    selected={filters.selectedAccountNames}
                    onChange={(selected) => setFilters((prev) => ({ ...prev, selectedAccountNames: selected }))}
                    placeholder="Select accounts..."
                  />
                </div>

                {/* Account Filters */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Countries ({availableOptions.accountCountries?.length || 0})</Label>
                    <MultiSelect
                      options={availableOptions.accountCountries || []}
                      selected={filters.accountCountries}
                      onChange={(selected) => setFilters((prev) => ({ ...prev, accountCountries: selected }))}
                      placeholder="Select countries..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Regions ({availableOptions.accountRegions?.length || 0})</Label>
                    <MultiSelect
                      options={availableOptions.accountRegions || []}
                      selected={filters.accountRegions}
                      onChange={(selected) => setFilters((prev) => ({ ...prev, accountRegions: selected }))}
                      placeholder="Select regions..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Industries ({availableOptions.accountIndustries.length})</Label>
                    <MultiSelect
                      options={availableOptions.accountIndustries}
                      selected={filters.accountIndustries}
                      onChange={(selected) => setFilters((prev) => ({ ...prev, accountIndustries: selected }))}
                      placeholder="Select industries..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Sub Industries ({availableOptions.accountSubIndustries.length})</Label>
                    <MultiSelect
                      options={availableOptions.accountSubIndustries}
                      selected={filters.accountSubIndustries}
                      onChange={(selected) =>
                        setFilters((prev) => ({ ...prev, accountSubIndustries: selected }))
                      }
                      placeholder="Select sub industries..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Primary Categories ({availableOptions.accountPrimaryCategories.length})</Label>
                    <MultiSelect
                      options={availableOptions.accountPrimaryCategories}
                      selected={filters.accountPrimaryCategories}
                      onChange={(selected) =>
                        setFilters((prev) => ({ ...prev, accountPrimaryCategories: selected }))
                      }
                      placeholder="Select categories..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Primary Nature ({availableOptions.accountPrimaryNatures.length})</Label>
                    <MultiSelect
                      options={availableOptions.accountPrimaryNatures}
                      selected={filters.accountPrimaryNatures}
                      onChange={(selected) =>
                        setFilters((prev) => ({ ...prev, accountPrimaryNatures: selected }))
                      }
                      placeholder="Select nature..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">NASSCOM Status ({availableOptions.accountNasscomStatuses.length})</Label>
                    <MultiSelect
                      options={availableOptions.accountNasscomStatuses}
                      selected={filters.accountNasscomStatuses}
                      onChange={(selected) =>
                        setFilters((prev) => ({ ...prev, accountNasscomStatuses: selected }))
                      }
                      placeholder="Select NASSCOM status..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Employees Range ({availableOptions.accountEmployeesRanges.length})</Label>
                    <MultiSelect
                      options={availableOptions.accountEmployeesRanges}
                      selected={filters.accountEmployeesRanges}
                      onChange={(selected) =>
                        setFilters((prev) => ({ ...prev, accountEmployeesRanges: selected }))
                      }
                      placeholder="Select employees range..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Center Employees ({availableOptions.accountCenterEmployees.length})</Label>
                    <MultiSelect
                      options={availableOptions.accountCenterEmployees}
                      selected={filters.accountCenterEmployees}
                      onChange={(selected) =>
                        setFilters((prev) => ({ ...prev, accountCenterEmployees: selected }))
                      }
                      placeholder="Select center employees..."
                    />
                  </div>

                  {/* Revenue Range */}
                  <div className="space-y-3 pt-4 mt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">
                        Revenue: {formatRevenueInMillions(filters.accountRevenueRange[0])} -{" "}
                        {formatRevenueInMillions(filters.accountRevenueRange[1])}
                      </Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="include-null-revenue"
                          checked={filters.includeNullRevenue || false}
                          onChange={(e) =>
                            setFilters((prev) => ({
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
                          value={filters.accountRevenueRange[0]}
                          onChange={(e) => handleMinRevenueChange(e.target.value)}
                          min={revenueRange.min}
                          max={filters.accountRevenueRange[1]}
                          className="text-xs h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="max-revenue" className="text-xs">Max (M)</Label>
                        <Input
                          id="max-revenue"
                          type="number"
                          value={filters.accountRevenueRange[1]}
                          onChange={(e) => handleMaxRevenueChange(e.target.value)}
                          min={filters.accountRevenueRange[0]}
                          max={revenueRange.max}
                          className="text-xs h-8"
                        />
                      </div>
                    </div>
                    <div className="px-2">
                      <Slider
                        value={filters.accountRevenueRange}
                        onValueChange={(value) =>
                          setFilters((prev) => ({
                            ...prev,
                            accountRevenueRange: value as [number, number],
                          }))
                        }
                        min={revenueRange.min}
                        max={revenueRange.max}
                        step={Math.max(1, Math.floor((revenueRange.max - revenueRange.min) / 100))}
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
                      selected={filters.centerTypes}
                      onChange={(selected) => setFilters((prev) => ({ ...prev, centerTypes: selected }))}
                      placeholder="Select types..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Center Focus ({availableOptions.centerFocus.length})</Label>
                    <MultiSelect
                      options={availableOptions.centerFocus}
                      selected={filters.centerFocus}
                      onChange={(selected) => setFilters((prev) => ({ ...prev, centerFocus: selected }))}
                      placeholder="Select focus..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Cities ({availableOptions.centerCities.length})</Label>
                    <MultiSelect
                      options={availableOptions.centerCities}
                      selected={filters.centerCities}
                      onChange={(selected) => setFilters((prev) => ({ ...prev, centerCities: selected }))}
                      placeholder="Select cities..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">States ({availableOptions.centerStates.length})</Label>
                    <MultiSelect
                      options={availableOptions.centerStates}
                      selected={filters.centerStates}
                      onChange={(selected) => setFilters((prev) => ({ ...prev, centerStates: selected }))}
                      placeholder="Select states..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Countries ({availableOptions.centerCountries.length})</Label>
                    <MultiSelect
                      options={availableOptions.centerCountries}
                      selected={filters.centerCountries}
                      onChange={(selected) => setFilters((prev) => ({ ...prev, centerCountries: selected }))}
                      placeholder="Select countries..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Center Employees ({availableOptions.centerEmployees.length})</Label>
                    <MultiSelect
                      options={availableOptions.centerEmployees}
                      selected={filters.centerEmployees}
                      onChange={(selected) => setFilters((prev) => ({ ...prev, centerEmployees: selected }))}
                      placeholder="Select employees range..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Center Status ({availableOptions.centerStatuses.length})</Label>
                    <MultiSelect
                      options={availableOptions.centerStatuses}
                      selected={filters.centerStatuses}
                      onChange={(selected) => setFilters((prev) => ({ ...prev, centerStatuses: selected }))}
                      placeholder="Select status..."
                    />
                  </div>

                  {/* Functions nested inside Centers */}
                  <div className="space-y-2 pt-4 mt-4 border-t border-border">
                    <Label className="text-xs font-medium">Functions ({availableOptions.functionTypes.length})</Label>
                    <MultiSelect
                      options={availableOptions.functionTypes}
                      selected={filters.functionTypes}
                      onChange={(selected) => setFilters((prev) => ({ ...prev, functionTypes: selected }))}
                      placeholder="Select functions..."
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
