import { calculateActiveFilters } from "@/lib/dashboard/filter-summary"
import type { FilterValue, Filters } from "@/lib/types"

export const MAX_TRACKED_VALUES = 100
export const MAX_TRACKED_TEXT_LENGTH = 200

export const normalizeTrackedText = (value: string) => value.trim().slice(0, MAX_TRACKED_TEXT_LENGTH)

export const toTrackedStringArray = (
  values: Array<string | null | undefined>,
  maxValues = MAX_TRACKED_VALUES
) => {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    if (typeof value !== "string") {
      continue
    }

    const normalized = normalizeTrackedText(value)
    if (!normalized || seen.has(normalized)) {
      continue
    }

    seen.add(normalized)
    result.push(normalized)

    if (result.length >= maxValues) {
      break
    }
  }

  return result
}

export const toTrackedFilterValueArray = (values: FilterValue[]) =>
  toTrackedStringArray(values.map((value) => `${value.mode}:${value.value}`))

export const toTrackedFilterPlainValues = (values: FilterValue[]) =>
  toTrackedStringArray(values.map((value) => value.value))

const hasRangeChanged = (range: [number, number], baseline: [number, number]) =>
  range[0] !== baseline[0] || range[1] !== baseline[1]

export const buildTrackedFiltersSnapshot = (
  filters: Filters,
  baselineRanges: Partial<{
    accountRevenueRange: [number, number]
    accountYearsInIndiaRange: [number, number]
    accountFirstCenterYearRange: [number, number]
    centerIncYearRange: [number, number]
  }> = {}
) => {
  const activeFilterKeys: string[] = []

  const pushIfActive = (key: string, isActive: boolean) => {
    if (isActive) {
      activeFilterKeys.push(key)
    }
  }

  pushIfActive("accountCountries", filters.accountCountries.length > 0)
  pushIfActive("accountIndustries", filters.accountIndustries.length > 0)
  pushIfActive("accountPrimaryCategories", filters.accountPrimaryCategories.length > 0)
  pushIfActive("accountPrimaryNatures", filters.accountPrimaryNatures.length > 0)
  pushIfActive("accountNasscomStatuses", filters.accountNasscomStatuses.length > 0)
  pushIfActive("accountEmployeesRanges", filters.accountEmployeesRanges.length > 0)
  pushIfActive("accountCenterEmployees", filters.accountCenterEmployees.length > 0)
  pushIfActive(
    "accountRevenueRange",
    baselineRanges.accountRevenueRange
      ? hasRangeChanged(filters.accountRevenueRange, baselineRanges.accountRevenueRange)
      : true
  )
  pushIfActive("includeNullRevenue", filters.includeNullRevenue)
  pushIfActive(
    "accountYearsInIndiaRange",
    baselineRanges.accountYearsInIndiaRange
      ? hasRangeChanged(filters.accountYearsInIndiaRange, baselineRanges.accountYearsInIndiaRange)
      : true
  )
  pushIfActive("includeNullYearsInIndia", filters.includeNullYearsInIndia)
  pushIfActive(
    "accountFirstCenterYearRange",
    baselineRanges.accountFirstCenterYearRange
      ? hasRangeChanged(filters.accountFirstCenterYearRange, baselineRanges.accountFirstCenterYearRange)
      : true
  )
  pushIfActive("includeNullFirstCenterYear", filters.includeNullFirstCenterYear)
  pushIfActive("accountNameKeywords", filters.accountNameKeywords.length > 0)
  pushIfActive("centerTypes", filters.centerTypes.length > 0)
  pushIfActive("centerFocus", filters.centerFocus.length > 0)
  pushIfActive("centerCities", filters.centerCities.length > 0)
  pushIfActive("centerStates", filters.centerStates.length > 0)
  pushIfActive("centerCountries", filters.centerCountries.length > 0)
  pushIfActive("centerEmployees", filters.centerEmployees.length > 0)
  pushIfActive("centerStatuses", filters.centerStatuses.length > 0)
  pushIfActive(
    "centerIncYearRange",
    baselineRanges.centerIncYearRange
      ? hasRangeChanged(filters.centerIncYearRange, baselineRanges.centerIncYearRange)
      : true
  )
  pushIfActive("includeNullCenterIncYear", filters.includeNullCenterIncYear)
  pushIfActive("functionTypes", filters.functionTypes.length > 0)
  pushIfActive("centerSoftwareInUseKeywords", filters.centerSoftwareInUseKeywords.length > 0)
  pushIfActive("prospectDepartments", filters.prospectDepartments.length > 0)
  pushIfActive("prospectLevels", filters.prospectLevels.length > 0)
  pushIfActive("prospectCities", filters.prospectCities.length > 0)
  pushIfActive("prospectTitleKeywords", filters.prospectTitleKeywords.length > 0)

  return {
    active_filters_count: calculateActiveFilters(filters),
    active_filter_keys: activeFilterKeys,
    account_countries: toTrackedFilterValueArray(filters.accountCountries),
    account_industries: toTrackedFilterValueArray(filters.accountIndustries),
    account_primary_categories: toTrackedFilterValueArray(filters.accountPrimaryCategories),
    account_primary_natures: toTrackedFilterValueArray(filters.accountPrimaryNatures),
    account_nasscom_statuses: toTrackedFilterValueArray(filters.accountNasscomStatuses),
    account_employees_ranges: toTrackedFilterValueArray(filters.accountEmployeesRanges),
    account_center_employees: toTrackedFilterValueArray(filters.accountCenterEmployees),
    account_revenue_range_min: filters.accountRevenueRange[0],
    account_revenue_range_max: filters.accountRevenueRange[1],
    include_null_revenue: filters.includeNullRevenue,
    account_years_in_india_range_min: filters.accountYearsInIndiaRange[0],
    account_years_in_india_range_max: filters.accountYearsInIndiaRange[1],
    include_null_years_in_india: filters.includeNullYearsInIndia,
    account_first_center_year_range_min: filters.accountFirstCenterYearRange[0],
    account_first_center_year_range_max: filters.accountFirstCenterYearRange[1],
    include_null_first_center_year: filters.includeNullFirstCenterYear,
    account_name_keywords: toTrackedFilterValueArray(filters.accountNameKeywords),
    center_types: toTrackedFilterValueArray(filters.centerTypes),
    center_focus: toTrackedFilterValueArray(filters.centerFocus),
    center_cities: toTrackedFilterValueArray(filters.centerCities),
    center_states: toTrackedFilterValueArray(filters.centerStates),
    center_countries: toTrackedFilterValueArray(filters.centerCountries),
    center_employees: toTrackedFilterValueArray(filters.centerEmployees),
    center_statuses: toTrackedFilterValueArray(filters.centerStatuses),
    center_inc_year_range_min: filters.centerIncYearRange[0],
    center_inc_year_range_max: filters.centerIncYearRange[1],
    include_null_center_inc_year: filters.includeNullCenterIncYear,
    function_types: toTrackedFilterValueArray(filters.functionTypes),
    center_software_in_use_keywords: toTrackedFilterValueArray(filters.centerSoftwareInUseKeywords),
    prospect_departments: toTrackedFilterValueArray(filters.prospectDepartments),
    prospect_levels: toTrackedFilterValueArray(filters.prospectLevels),
    prospect_cities: toTrackedFilterValueArray(filters.prospectCities),
    prospect_title_keywords: toTrackedFilterValueArray(filters.prospectTitleKeywords),
  }
}
