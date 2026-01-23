import type { Filters } from "@/lib/types"
import {
  createDefaultFilters,
  DEFAULT_CENTER_INC_YEAR_RANGE,
  DEFAULT_FIRST_CENTER_YEAR_RANGE,
  DEFAULT_REVENUE_RANGE,
  DEFAULT_YEARS_IN_INDIA_RANGE,
} from "@/lib/dashboard/defaults"

const coerceRange = (
  value: number[] | undefined | null,
  fallback: [number, number]
): [number, number] => {
  if (!Array.isArray(value) || value.length !== 2) return fallback
  const [min, max] = value
  return [Number(min), Number(max)]
}

export function withFilterDefaults(filters: Partial<Filters> | null | undefined): Filters {
  const defaults = createDefaultFilters()

  return {
    ...defaults,
    ...filters,
    accountRevenueRange: coerceRange(filters?.accountRevenueRange, DEFAULT_REVENUE_RANGE),
    accountYearsInIndiaRange: coerceRange(filters?.accountYearsInIndiaRange, DEFAULT_YEARS_IN_INDIA_RANGE),
    accountFirstCenterYearRange: coerceRange(filters?.accountFirstCenterYearRange, DEFAULT_FIRST_CENTER_YEAR_RANGE),
    centerIncYearRange: coerceRange(filters?.centerIncYearRange, DEFAULT_CENTER_INC_YEAR_RANGE),
  }
}

export function calculateActiveFilters(filters: Filters) {
  const [minRevenue, maxRevenue] = filters.accountRevenueRange || DEFAULT_REVENUE_RANGE
  const revenueFilterActive = minRevenue !== DEFAULT_REVENUE_RANGE[0] || maxRevenue !== DEFAULT_REVENUE_RANGE[1]
  const [minYearsInIndia, maxYearsInIndia] = filters.accountYearsInIndiaRange || DEFAULT_YEARS_IN_INDIA_RANGE
  const yearsInIndiaFilterActive =
    minYearsInIndia !== DEFAULT_YEARS_IN_INDIA_RANGE[0] || maxYearsInIndia !== DEFAULT_YEARS_IN_INDIA_RANGE[1]
  const [minFirstCenterYear, maxFirstCenterYear] =
    filters.accountFirstCenterYearRange || DEFAULT_FIRST_CENTER_YEAR_RANGE
  const firstCenterYearFilterActive =
    minFirstCenterYear !== DEFAULT_FIRST_CENTER_YEAR_RANGE[0] || maxFirstCenterYear !== DEFAULT_FIRST_CENTER_YEAR_RANGE[1]
  const [minCenterIncYear, maxCenterIncYear] = filters.centerIncYearRange || DEFAULT_CENTER_INC_YEAR_RANGE
  const centerIncYearFilterActive =
    minCenterIncYear !== DEFAULT_CENTER_INC_YEAR_RANGE[0] || maxCenterIncYear !== DEFAULT_CENTER_INC_YEAR_RANGE[1]

  return (
    filters.accountCountries.length +
    filters.accountIndustries.length +
    filters.accountPrimaryCategories.length +
    filters.accountPrimaryNatures.length +
    filters.accountNasscomStatuses.length +
    filters.accountEmployeesRanges.length +
    filters.accountCenterEmployees.length +
    (revenueFilterActive ? 1 : 0) +
    (filters.includeNullRevenue ? 1 : 0) +
    (yearsInIndiaFilterActive ? 1 : 0) +
    (filters.includeNullYearsInIndia ? 1 : 0) +
    (firstCenterYearFilterActive ? 1 : 0) +
    (filters.includeNullFirstCenterYear ? 1 : 0) +
    filters.accountNameKeywords.length +
    filters.centerTypes.length +
    filters.centerFocus.length +
    filters.centerCities.length +
    filters.centerStates.length +
    filters.centerCountries.length +
    filters.centerEmployees.length +
    filters.centerStatuses.length +
    (centerIncYearFilterActive ? 1 : 0) +
    (filters.includeNullCenterIncYear ? 1 : 0) +
    filters.functionTypes.length +
    filters.centerSoftwareInUseKeywords.length +
    filters.prospectDepartments.length +
    filters.prospectLevels.length +
    filters.prospectCities.length +
    filters.prospectTitleKeywords.length
  )
}
