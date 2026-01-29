import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { EnhancedMultiSelect } from "@/components/enhanced-multi-select"
import { AccountAutocomplete } from "@/components/filters/account-autocomplete"
import { TitleKeywordInput } from "@/components/filters/title-keyword-input"
import type { AvailableOptions, FilterOption, Filters, FilterValue } from "@/lib/types"

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

type MultiSelectKey = keyof Pick<
  Filters,
  | "accountCountries"
  | "accountIndustries"
  | "accountPrimaryCategories"
  | "accountPrimaryNatures"
  | "accountNasscomStatuses"
  | "accountEmployeesRanges"
  | "accountCenterEmployees"
  | "centerTypes"
  | "centerFocus"
  | "centerCities"
  | "centerStates"
  | "centerCountries"
  | "centerEmployees"
  | "centerStatuses"
  | "functionTypes"
  | "prospectDepartments"
  | "prospectLevels"
  | "prospectCities"
>

interface MultiSelectFieldProps {
  label: string
  options: FilterOption[]
  selected: FilterValue[]
  placeholder: string
  isApplying: boolean
  onChange: (selected: FilterValue[]) => void
}

interface RangeFilterSectionProps {
  label: string
  includeNullId: string
  includeNull: boolean
  onIncludeNullChange: (include: boolean) => void
  minInputId: string
  maxInputId: string
  minLabel: string
  maxLabel: string
  minValue: number
  maxValue: number
  rangeMin: number
  rangeMax: number
  step: number
  minDisplay: string
  maxDisplay: string
  onMinChange: (value: string) => void
  onMaxChange: (value: string) => void
  onSliderChange: (value: [number, number]) => void
}

const MultiSelectField = ({
  label,
  options,
  selected,
  placeholder,
  isApplying,
  onChange,
}: MultiSelectFieldProps): JSX.Element => (
  <div className="space-y-2">
    <Label className="text-xs font-medium">{label}</Label>
    <EnhancedMultiSelect
      options={options}
      selected={selected}
      onChange={onChange}
      placeholder={placeholder}
      isApplying={isApplying}
    />
  </div>
)

const RangeFilterSection = ({
  label,
  includeNullId,
  includeNull,
  onIncludeNullChange,
  minInputId,
  maxInputId,
  minLabel,
  maxLabel,
  minValue,
  maxValue,
  rangeMin,
  rangeMax,
  step,
  minDisplay,
  maxDisplay,
  onMinChange,
  onMaxChange,
  onSliderChange,
}: RangeFilterSectionProps): JSX.Element => (
  <div className="space-y-3 pt-4 mt-4 border-t border-border">
    <div className="flex items-center justify-between">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="flex items-center gap-2">
        <Checkbox
          id={includeNullId}
          checked={includeNull}
          onCheckedChange={(checked) => onIncludeNullChange(checked === true)}
          className="h-3.5 w-3.5"
        />
        <Label
          htmlFor={includeNullId}
          className="text-xs text-muted-foreground cursor-pointer select-none"
        >
          Include all
        </Label>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-1">
        <Label htmlFor={minInputId} className="text-xs">
          {minLabel}
        </Label>
        <Input
          id={minInputId}
          type="number"
          value={minValue}
          onChange={(e) => onMinChange(e.target.value)}
          min={rangeMin}
          max={maxValue}
          className="text-xs h-8"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={maxInputId} className="text-xs">
          {maxLabel}
        </Label>
        <Input
          id={maxInputId}
          type="number"
          value={maxValue}
          onChange={(e) => onMaxChange(e.target.value)}
          min={minValue}
          max={rangeMax}
          className="text-xs h-8"
        />
      </div>
    </div>
    <div className="px-2">
      <Slider
        value={[minValue, maxValue]}
        onValueChange={(value) => onSliderChange(value as [number, number])}
        min={rangeMin}
        max={rangeMax}
        step={step}
        className="w-full"
      />
    </div>
    <div className="flex justify-between text-xs text-muted-foreground px-2">
      <span>{minDisplay}</span>
      <span>{maxDisplay}</span>
    </div>
  </div>
)

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
}: AccountFilterSectionProps): JSX.Element {
  const handleMultiSelectChange = (key: MultiSelectKey, selected: FilterValue[]) => {
    setPendingFilters((prev) => ({ ...prev, [key]: selected }))
    setActiveFilter(key)
  }

  const accountSelects: Array<{
    key: MultiSelectKey
    label: string
    options: FilterOption[]
    placeholder: string
  }> = [
    {
      key: "accountCountries",
      label: "Countries",
      options: availableOptions.accountCountries ?? [],
      placeholder: "Select countries...",
    },
    {
      key: "accountIndustries",
      label: "Industries",
      options: availableOptions.accountIndustries,
      placeholder: "Select industries...",
    },
    {
      key: "accountPrimaryCategories",
      label: "Primary Categories",
      options: availableOptions.accountPrimaryCategories,
      placeholder: "Select categories...",
    },
    {
      key: "accountPrimaryNatures",
      label: "Primary Nature",
      options: availableOptions.accountPrimaryNatures,
      placeholder: "Select nature...",
    },
    {
      key: "accountNasscomStatuses",
      label: "NASSCOM Status",
      options: availableOptions.accountNasscomStatuses,
      placeholder: "Select NASSCOM status...",
    },
    {
      key: "accountEmployeesRanges",
      label: "Employees Range",
      options: availableOptions.accountEmployeesRanges,
      placeholder: "Select employees range...",
    },
    {
      key: "accountCenterEmployees",
      label: "Center Employees",
      options: availableOptions.accountCenterEmployees,
      placeholder: "Select center employees...",
    },
  ]

  return (
    <div className="max-h-[320px] overflow-y-auto pr-2">
      <div className="space-y-4 pt-2">
        <div className="space-y-2 pb-4 border-b border-border">
          <Label className="text-xs font-medium">Search Account Name</Label>
          <AccountAutocomplete
            accountNames={accountNames}
            selectedAccounts={pendingFilters.accountNameKeywords}
            onChange={(keywords) => setPendingFilters((prev) => ({ ...prev, accountNameKeywords: keywords }))}
            placeholder="Type to search account names..."
          />
        </div>

        <div className="space-y-3">
          {accountSelects.map((config) => (
            <MultiSelectField
              key={config.key}
              label={config.label}
              options={config.options}
              selected={pendingFilters[config.key]}
              placeholder={config.placeholder}
              isApplying={isApplying && activeFilter === config.key}
              onChange={(selected) => handleMultiSelectChange(config.key, selected)}
            />
          ))}

          <RangeFilterSection
            label="Revenue"
            includeNullId="include-null-revenue"
            includeNull={pendingFilters.includeNullRevenue}
            onIncludeNullChange={(include) =>
              setPendingFilters((prev) => ({ ...prev, includeNullRevenue: include }))
            }
            minInputId="min-revenue"
            maxInputId="max-revenue"
            minLabel="Min (M)"
            maxLabel="Max (M)"
            minValue={pendingFilters.accountRevenueRange[0]}
            maxValue={pendingFilters.accountRevenueRange[1]}
            rangeMin={revenueRange.min}
            rangeMax={revenueRange.max}
            step={Math.max(1, Math.floor((revenueRange.max - revenueRange.min) / 1000))}
            minDisplay={formatRevenueInMillions(revenueRange.min)}
            maxDisplay={formatRevenueInMillions(revenueRange.max)}
            onMinChange={handleMinRevenueChange}
            onMaxChange={handleMaxRevenueChange}
            onSliderChange={handleRevenueRangeChange}
          />

          <RangeFilterSection
            label="Total India Headcount"
            includeNullId="include-null-years-in-india"
            includeNull={pendingFilters.includeNullYearsInIndia}
            onIncludeNullChange={(include) =>
              setPendingFilters((prev) => ({ ...prev, includeNullYearsInIndia: include }))
            }
            minInputId="min-years-in-india"
            maxInputId="max-years-in-india"
            minLabel="Min"
            maxLabel="Max"
            minValue={pendingFilters.accountYearsInIndiaRange[0]}
            maxValue={pendingFilters.accountYearsInIndiaRange[1]}
            rangeMin={yearsInIndiaRange.min}
            rangeMax={yearsInIndiaRange.max}
            step={1}
            minDisplay={yearsInIndiaRange.min.toLocaleString()}
            maxDisplay={yearsInIndiaRange.max.toLocaleString()}
            onMinChange={handleMinYearsInIndiaChange}
            onMaxChange={handleMaxYearsInIndiaChange}
            onSliderChange={handleYearsInIndiaRangeChange}
          />

          <RangeFilterSection
            label="Years In India"
            includeNullId="include-null-first-center-year"
            includeNull={pendingFilters.includeNullFirstCenterYear}
            onIncludeNullChange={(include) =>
              setPendingFilters((prev) => ({ ...prev, includeNullFirstCenterYear: include }))
            }
            minInputId="min-first-center-year"
            maxInputId="max-first-center-year"
            minLabel="Min"
            maxLabel="Max"
            minValue={pendingFilters.accountFirstCenterYearRange[0]}
            maxValue={pendingFilters.accountFirstCenterYearRange[1]}
            rangeMin={firstCenterYearRange.min}
            rangeMax={firstCenterYearRange.max}
            step={1}
            minDisplay={firstCenterYearRange.min.toLocaleString()}
            maxDisplay={firstCenterYearRange.max.toLocaleString()}
            onMinChange={handleMinFirstCenterYearChange}
            onMaxChange={handleMaxFirstCenterYearChange}
            onSliderChange={handleFirstCenterYearRangeChange}
          />
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
}: CenterFilterSectionProps): JSX.Element {
  const handleMultiSelectChange = (key: MultiSelectKey, selected: FilterValue[]) => {
    setPendingFilters((prev) => ({ ...prev, [key]: selected }))
    setActiveFilter(key)
  }

  const centerSelects: Array<{
    key: MultiSelectKey
    label: string
    options: FilterOption[]
    placeholder: string
  }> = [
    {
      key: "centerTypes",
      label: "Center Types",
      options: availableOptions.centerTypes,
      placeholder: "Select types...",
    },
    {
      key: "centerFocus",
      label: "Center Focus",
      options: availableOptions.centerFocus,
      placeholder: "Select focus...",
    },
    {
      key: "centerCities",
      label: "Cities",
      options: availableOptions.centerCities,
      placeholder: "Select cities...",
    },
    {
      key: "centerStates",
      label: "States",
      options: availableOptions.centerStates,
      placeholder: "Select states...",
    },
    {
      key: "centerCountries",
      label: "Countries",
      options: availableOptions.centerCountries,
      placeholder: "Select countries...",
    },
    {
      key: "centerEmployees",
      label: "Center Employees",
      options: availableOptions.centerEmployees,
      placeholder: "Select employees range...",
    },
    {
      key: "centerStatuses",
      label: "Center Status",
      options: availableOptions.centerStatuses,
      placeholder: "Select status...",
    },
  ]

  return (
    <div className="max-h-[320px] overflow-y-auto pr-2">
      <div className="space-y-4 pt-2">
        <div className="space-y-3">
          {centerSelects.map((config) => (
            <MultiSelectField
              key={config.key}
              label={config.label}
              options={config.options}
              selected={pendingFilters[config.key]}
              placeholder={config.placeholder}
              isApplying={isApplying && activeFilter === config.key}
              onChange={(selected) => handleMultiSelectChange(config.key, selected)}
            />
          ))}

          <RangeFilterSection
            label="Timeline"
            includeNullId="include-null-center-inc-year"
            includeNull={pendingFilters.includeNullCenterIncYear}
            onIncludeNullChange={(include) =>
              setPendingFilters((prev) => ({ ...prev, includeNullCenterIncYear: include }))
            }
            minInputId="min-center-inc-year"
            maxInputId="max-center-inc-year"
            minLabel="Min"
            maxLabel="Max"
            minValue={pendingFilters.centerIncYearRange[0]}
            maxValue={pendingFilters.centerIncYearRange[1]}
            rangeMin={centerIncYearRange.min}
            rangeMax={centerIncYearRange.max}
            step={1}
            minDisplay={centerIncYearRange.min.toLocaleString()}
            maxDisplay={centerIncYearRange.max.toLocaleString()}
            onMinChange={handleMinCenterIncYearChange}
            onMaxChange={handleMaxCenterIncYearChange}
            onSliderChange={handleCenterIncYearRangeChange}
          />

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
}: ProspectFilterSectionProps): JSX.Element {
  const handleMultiSelectChange = (key: MultiSelectKey, selected: FilterValue[]) => {
    setPendingFilters((prev) => ({ ...prev, [key]: selected }))
    setActiveFilter(key)
  }

  const prospectSelects: Array<{
    key: MultiSelectKey
    label: string
    options: FilterOption[]
    placeholder: string
  }> = [
    {
      key: "prospectDepartments",
      label: "Departments",
      options: availableOptions.prospectDepartments ?? [],
      placeholder: "Select departments...",
    },
    {
      key: "prospectLevels",
      label: "Levels",
      options: availableOptions.prospectLevels ?? [],
      placeholder: "Select levels...",
    },
    {
      key: "prospectCities",
      label: "Cities",
      options: availableOptions.prospectCities ?? [],
      placeholder: "Select cities...",
    },
  ]

  return (
    <div className="max-h-[320px] overflow-y-auto pr-2">
      <div className="space-y-4 pt-2">
        <div className="space-y-3">
          {prospectSelects.map((config) => (
            <MultiSelectField
              key={config.key}
              label={config.label}
              options={config.options}
              selected={pendingFilters[config.key]}
              placeholder={config.placeholder}
              isApplying={isApplying && activeFilter === config.key}
              onChange={(selected) => handleMultiSelectChange(config.key, selected)}
            />
          ))}
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
