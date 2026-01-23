import type { Filters } from "@/lib/types"

export const DEFAULT_REVENUE_RANGE: [number, number] = [0, 1000000]
export const DEFAULT_YEARS_IN_INDIA_RANGE: [number, number] = [0, 1000000]
export const DEFAULT_FIRST_CENTER_YEAR_RANGE: [number, number] = [0, 1000000]
export const DEFAULT_CENTER_INC_YEAR_RANGE: [number, number] = [0, 1000000]

export function createDefaultFilters(overrides: Partial<Filters> = {}): Filters {
  return {
    accountCountries: overrides.accountCountries ?? [],
    accountIndustries: overrides.accountIndustries ?? [],
    accountPrimaryCategories: overrides.accountPrimaryCategories ?? [],
    accountPrimaryNatures: overrides.accountPrimaryNatures ?? [],
    accountNasscomStatuses: overrides.accountNasscomStatuses ?? [],
    accountEmployeesRanges: overrides.accountEmployeesRanges ?? [],
    accountCenterEmployees: overrides.accountCenterEmployees ?? [],
    accountRevenueRange: overrides.accountRevenueRange ?? DEFAULT_REVENUE_RANGE,
    includeNullRevenue: overrides.includeNullRevenue ?? true,
    accountYearsInIndiaRange: overrides.accountYearsInIndiaRange ?? DEFAULT_YEARS_IN_INDIA_RANGE,
    includeNullYearsInIndia: overrides.includeNullYearsInIndia ?? true,
    accountFirstCenterYearRange: overrides.accountFirstCenterYearRange ?? DEFAULT_FIRST_CENTER_YEAR_RANGE,
    includeNullFirstCenterYear: overrides.includeNullFirstCenterYear ?? true,
    accountNameKeywords: overrides.accountNameKeywords ?? [],
    centerTypes: overrides.centerTypes ?? [],
    centerFocus: overrides.centerFocus ?? [],
    centerCities: overrides.centerCities ?? [],
    centerStates: overrides.centerStates ?? [],
    centerCountries: overrides.centerCountries ?? [],
    centerEmployees: overrides.centerEmployees ?? [],
    centerStatuses: overrides.centerStatuses ?? [],
    centerIncYearRange: overrides.centerIncYearRange ?? DEFAULT_CENTER_INC_YEAR_RANGE,
    includeNullCenterIncYear: overrides.includeNullCenterIncYear ?? true,
    functionTypes: overrides.functionTypes ?? [],
    centerSoftwareInUseKeywords: overrides.centerSoftwareInUseKeywords ?? [],
    prospectDepartments: overrides.prospectDepartments ?? [],
    prospectLevels: overrides.prospectLevels ?? [],
    prospectCities: overrides.prospectCities ?? [],
    prospectTitleKeywords: overrides.prospectTitleKeywords ?? [],
  }
}
