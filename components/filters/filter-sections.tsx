import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { EnhancedMultiSelect } from "@/components/enhanced-multi-select"
import { AccountAutocomplete } from "@/components/filters/account-autocomplete"
import { TitleKeywordInput } from "@/components/filters/title-keyword-input"
import type { Filters, AvailableOptions } from "@/lib/types"

interface FilterSectionBaseProps {
  pendingFilters: Filters
  availableOptions: AvailableOptions
  isApplying: boolean
  activeFilter: string | null
  setPendingFilters: React.Dispatch<React.SetStateAction<Filters>>
  setActiveFilter: (filter: string | null) => void
}

interface AccountFilterSectionProps extends FilterSectionBaseProps {
  accountNames: string[]
  revenueRange: { min: number; max: number }
  yearsInIndiaRange: { min: number; max: number }
  firstCenterYearRange: { min: number; max: number }
  handleMinRevenueChange: (value: string) => void
  handleMaxRevenueChange: (value: string) => void
  handleRevenueRangeChange: (value: [number, number]) => void
  handleMinYearsInIndiaChange: (value: string) => void
  handleMaxYearsInIndiaChange: (value: string) => void
  handleYearsInIndiaRangeChange: (value: [number, number]) => void
  handleMinFirstCenterYearChange: (value: string) => void
  handleMaxFirstCenterYearChange: (value: string) => void
  handleFirstCenterYearRangeChange: (value: [number, number]) => void
  formatRevenueInMillions: (value: number) => string
}

interface CenterFilterSectionProps extends FilterSectionBaseProps {
  centerIncYearRange: { min: number; max: number }
  handleMinCenterIncYearChange: (value: string) => void
  handleMaxCenterIncYearChange: (value: string) => void
  handleCenterIncYearRangeChange: (value: [number, number]) => void
}

interface ProspectFilterSectionProps extends FilterSectionBaseProps {}

export function AccountFiltersSection({
  pendingFilters,
  availableOptions,
  isApplying,
  activeFilter,
  setPendingFilters,
  setActiveFilter,
  accountNames,
  revenueRange,
  yearsInIndiaRange,
  firstCenterYearRange,
  handleMinRevenueChange,
  handleMaxRevenueChange,
  handleRevenueRangeChange,
  handleMinYearsInIndiaChange,
  handleMaxYearsInIndiaChange,
  handleYearsInIndiaRangeChange,
  handleMinFirstCenterYearChange,
  handleMaxFirstCenterYearChange,
  handleFirstCenterYearRangeChange,
  formatRevenueInMillions,
}: AccountFilterSectionProps) {
  return (
    <div className="max-h-[320px] overflow-y-auto pr-2">
        <div className="space-y-4 pt-2">
          <div className="space-y-3">
            <div className="space-y-3 pt-4 mt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Revenue</Label>
                <div className="flex items-center gap-2">
                <Checkbox
                  id="include-null-revenue"
                  checked={pendingFilters.includeNullRevenue}
                  onCheckedChange={(checked) =>
                    setPendingFilters((prev) => ({
                      ...prev,
                      includeNullRevenue: checked === true,
                    }))
                  }
                  className="h-3.5 w-3.5"
                />
                <Label
                  htmlFor="include-null-revenue"
                  className="text-xs text-muted-foreground cursor-pointer select-none"
                >
                  Include all
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

          <div className="space-y-2 pb-4 border-b border-border">
            <Label className="text-xs font-medium">Search Account Name</Label>
            <AccountAutocomplete
              accountNames={accountNames}
              selectedAccounts={pendingFilters.accountNameKeywords}
              onChange={(keywords) => setPendingFilters((prev) => ({ ...prev, accountNameKeywords: keywords }))}
              placeholder="Type to search account names..."
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Total India Headcount</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="include-null-years-in-india"
                  checked={pendingFilters.includeNullYearsInIndia}
                  onCheckedChange={(checked) =>
                    setPendingFilters((prev) => ({
                      ...prev,
                      includeNullYearsInIndia: checked === true,
                    }))
                  }
                  className="h-3.5 w-3.5"
                />
                <Label
                  htmlFor="include-null-years-in-india"
                  className="text-xs text-muted-foreground cursor-pointer select-none"
                >
                  Include all
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Years In India</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="include-null-first-center-year"
                  checked={pendingFilters.includeNullFirstCenterYear}
                  onCheckedChange={(checked) =>
                    setPendingFilters((prev) => ({
                      ...prev,
                      includeNullFirstCenterYear: checked === true,
                    }))
                  }
                  className="h-3.5 w-3.5"
                />
                <Label
                  htmlFor="include-null-first-center-year"
                  className="text-xs text-muted-foreground cursor-pointer select-none"
                >
                  Include all
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
        </div>
      </div>
    </div>
  )
}

export function CenterFiltersSection({
  pendingFilters,
  availableOptions,
  isApplying,
  activeFilter,
  setPendingFilters,
  setActiveFilter,
  centerIncYearRange,
  handleMinCenterIncYearChange,
  handleMaxCenterIncYearChange,
  handleCenterIncYearRangeChange,
}: CenterFilterSectionProps) {
  return (
    <div className="max-h-[320px] overflow-y-auto pr-2">
      <div className="space-y-4 pt-2">
        <div className="space-y-3">
          <div className="space-y-3 pt-4 mt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Timeline</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="include-null-center-inc-year"
                  checked={pendingFilters.includeNullCenterIncYear}
                  onCheckedChange={(checked) =>
                    setPendingFilters((prev) => ({
                      ...prev,
                      includeNullCenterIncYear: checked === true,
                    }))
                  }
                  className="h-3.5 w-3.5"
                />
                <Label
                  htmlFor="include-null-center-inc-year"
                  className="text-xs text-muted-foreground cursor-pointer select-none"
                >
                  Include all
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
  )
}

export function ProspectFiltersSection({
  pendingFilters,
  availableOptions,
  isApplying,
  activeFilter,
  setPendingFilters,
  setActiveFilter,
}: ProspectFilterSectionProps) {
  return (
    <div className="max-h-[320px] overflow-y-auto pr-2">
      <div className="space-y-4 pt-2">
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
  )
}
