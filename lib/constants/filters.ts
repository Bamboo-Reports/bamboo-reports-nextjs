import type { Filters } from "@/lib/types"

export const DEFAULT_RANGE: [number, number] = [0, 1000000]

export const DEFAULT_FILTERS: Filters = {
  accountCountries: [],
  accountIndustries: [],
  accountPrimaryCategories: [],
  accountPrimaryNatures: [],
  accountNasscomStatuses: [],
  accountEmployeesRanges: [],
  accountCenterEmployees: [],
  accountRevenueRange: DEFAULT_RANGE,
  includeNullRevenue: true,
  accountYearsInIndiaRange: DEFAULT_RANGE,
  includeNullYearsInIndia: true,
  accountFirstCenterYearRange: DEFAULT_RANGE,
  includeNullFirstCenterYear: true,
  accountNameKeywords: [],
  centerTypes: [],
  centerFocus: [],
  centerCities: [],
  centerStates: [],
  centerCountries: [],
  centerEmployees: [],
  centerStatuses: [],
  centerIncYearRange: DEFAULT_RANGE,
  includeNullCenterIncYear: true,
  functionTypes: [],
  centerSoftwareInUseKeywords: [],
  prospectDepartments: [],
  prospectLevels: [],
  prospectCities: [],
  prospectTitleKeywords: [],
}

export const EMPTY_AVAILABLE_OPTIONS = {
  accountCountries: [],
  accountIndustries: [],
  accountPrimaryCategories: [],
  accountPrimaryNatures: [],
  accountNasscomStatuses: [],
  accountEmployeesRanges: [],
  accountCenterEmployees: [],
  centerTypes: [],
  centerFocus: [],
  centerCities: [],
  centerStates: [],
  centerCountries: [],
  centerEmployees: [],
  centerStatuses: [],
  functionTypes: [],
  prospectDepartments: [],
  prospectLevels: [],
  prospectCities: [],
}

export interface RangeState {
  min: number
  max: number
}

export const DEFAULT_RANGE_STATE: RangeState = { min: 0, max: 1000000 }

/**
 * Creates a fresh copy of default filters with optional range overrides
 */
export function createDefaultFilters(overrides?: {
  revenueRange?: RangeState
  yearsInIndiaRange?: RangeState
  firstCenterYearRange?: RangeState
  centerIncYearRange?: RangeState
}): Filters {
  return {
    ...DEFAULT_FILTERS,
    accountRevenueRange: overrides?.revenueRange 
      ? [overrides.revenueRange.min, overrides.revenueRange.max] 
      : [...DEFAULT_RANGE] as [number, number],
    accountYearsInIndiaRange: overrides?.yearsInIndiaRange 
      ? [overrides.yearsInIndiaRange.min, overrides.yearsInIndiaRange.max] 
      : [...DEFAULT_RANGE] as [number, number],
    accountFirstCenterYearRange: overrides?.firstCenterYearRange 
      ? [overrides.firstCenterYearRange.min, overrides.firstCenterYearRange.max] 
      : [...DEFAULT_RANGE] as [number, number],
    centerIncYearRange: overrides?.centerIncYearRange 
      ? [overrides.centerIncYearRange.min, overrides.centerIncYearRange.max] 
      : [...DEFAULT_RANGE] as [number, number],
  }
}
