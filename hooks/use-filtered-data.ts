"use client"

import { useMemo } from "react"
import { parseRevenue } from "@/lib/utils/helpers"
import {
  createValueMatcher,
  createKeywordMatcher,
} from "@/lib/utils/filter-helpers"
import type { Account, Center, Function, Service, Prospect, Tech, Filters } from "@/lib/types"

export interface FilteredDataResult {
  filteredAccounts: Account[]
  filteredCenters: Center[]
  filteredFunctions: Function[]
  filteredServices: Service[]
  filteredProspects: Prospect[]
}

interface DataInput {
  accounts: Account[]
  centers: Center[]
  functions: Function[]
  services: Service[]
  tech: Tech[]
  prospects: Prospect[]
}

function normalizeNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0
  const num = typeof value === "number" ? value : Number(value)
  return Number.isFinite(num) ? num : 0
}

function parseRevenueValue(value: number | string | null | undefined): number {
  return parseRevenue(value ?? 0)
}

function rangeFilterMatch(
  range: [number, number],
  value: number | string | null | undefined,
  includeNull: boolean,
  parser: (value: number | string | null | undefined) => number = normalizeNumber
): boolean {
  const numValue = parser(value)

  if (includeNull && (numValue === 0 || value === null || value === undefined || value === "")) {
    return true
  }

  if (!includeNull && (numValue === 0 || value === null || value === undefined || value === "")) {
    return false
  }

  return numValue >= range[0] && numValue <= range[1]
}

export function useFilteredData(
  data: DataInput,
  filters: Filters
): FilteredDataResult {
  return useMemo(() => {
    const { accounts, centers, functions, services, tech, prospects } = data
    const activeFilters = filters

    // Create matchers for account filters
    const matchAccountCountry = createValueMatcher(activeFilters.accountCountries)
    const matchAccountIndustry = createValueMatcher(activeFilters.accountIndustries)
    const matchAccountPrimaryCategory = createValueMatcher(activeFilters.accountPrimaryCategories)
    const matchAccountPrimaryNature = createValueMatcher(activeFilters.accountPrimaryNatures)
    const matchAccountNasscom = createValueMatcher(activeFilters.accountNasscomStatuses)
    const matchAccountEmployeesRange = createValueMatcher(activeFilters.accountEmployeesRanges)
    const matchAccountCenterEmployees = createValueMatcher(activeFilters.accountCenterEmployees)
    const matchAccountName = createKeywordMatcher(activeFilters.accountNameKeywords)
    const matchAccountRevenue = (value: number | string | null | undefined) =>
      rangeFilterMatch(activeFilters.accountRevenueRange, value, activeFilters.includeNullRevenue, parseRevenueValue)
    const matchAccountYearsInIndia = (value: number | string | null | undefined) =>
      rangeFilterMatch(activeFilters.accountYearsInIndiaRange, value, activeFilters.includeNullYearsInIndia)
    const matchAccountFirstCenterYear = (value: number | string | null | undefined) =>
      rangeFilterMatch(activeFilters.accountFirstCenterYearRange, value, activeFilters.includeNullFirstCenterYear)

    // Create matchers for center filters
    const matchCenterType = createValueMatcher(activeFilters.centerTypes)
    const matchCenterFocus = createValueMatcher(activeFilters.centerFocus)
    const matchCenterCity = createValueMatcher(activeFilters.centerCities)
    const matchCenterState = createValueMatcher(activeFilters.centerStates)
    const matchCenterCountry = createValueMatcher(activeFilters.centerCountries)
    const matchCenterEmployees = createValueMatcher(activeFilters.centerEmployees)
    const matchCenterStatus = createValueMatcher(activeFilters.centerStatuses)
    const matchCenterIncYear = (value: number | string | null | undefined) =>
      rangeFilterMatch(activeFilters.centerIncYearRange, value, activeFilters.includeNullCenterIncYear)

    const matchFunctionType = createValueMatcher(activeFilters.functionTypes)
    const matchCenterSoftwareInUse = createKeywordMatcher(activeFilters.centerSoftwareInUseKeywords)

    // Create matchers for prospect filters
    const matchProspectDepartment = createValueMatcher(activeFilters.prospectDepartments)
    const matchProspectLevel = createValueMatcher(activeFilters.prospectLevels)
    const matchProspectCity = createValueMatcher(activeFilters.prospectCities)
    const matchProspectTitle = createKeywordMatcher(activeFilters.prospectTitleKeywords)

    // Check if filters are active
    const hasAccountFilters =
      activeFilters.accountCountries.length > 0 ||
      activeFilters.accountIndustries.length > 0 ||
      activeFilters.accountPrimaryCategories.length > 0 ||
      activeFilters.accountPrimaryNatures.length > 0 ||
      activeFilters.accountNasscomStatuses.length > 0 ||
      activeFilters.accountEmployeesRanges.length > 0 ||
      activeFilters.accountCenterEmployees.length > 0 ||
      activeFilters.accountRevenueRange[0] > 0 ||
      activeFilters.accountRevenueRange[1] < Number.MAX_SAFE_INTEGER ||
      activeFilters.includeNullRevenue ||
      activeFilters.accountYearsInIndiaRange[0] > 0 ||
      activeFilters.accountYearsInIndiaRange[1] < Number.MAX_SAFE_INTEGER ||
      activeFilters.includeNullYearsInIndia ||
      activeFilters.accountFirstCenterYearRange[0] > 0 ||
      activeFilters.accountFirstCenterYearRange[1] < Number.MAX_SAFE_INTEGER ||
      activeFilters.includeNullFirstCenterYear ||
      activeFilters.accountNameKeywords.length > 0

    const hasProspectFilters =
      activeFilters.prospectDepartments.length > 0 ||
      activeFilters.prospectLevels.length > 0 ||
      activeFilters.prospectCities.length > 0 ||
      activeFilters.prospectTitleKeywords.length > 0

    const hasFunctionFilters = activeFilters.functionTypes.length > 0
    const hasCenterSoftwareFilters = activeFilters.centerSoftwareInUseKeywords.length > 0

    let filteredAccounts: Account[] = []
    let filteredCenters: Center[] = []
    let filteredFunctions: Function[] = []
    let filteredProspects: Prospect[] = []

    let accountNameSet = new Set<string>()
    let centerKeySet = new Set<string>()

    // Build center software index
    const centerSoftwareIndex = new Map<string, string>()
    for (const techRow of tech) {
      const software = techRow.software_in_use?.trim()
      if (!software || !techRow.cn_unique_key) continue
      const existing = centerSoftwareIndex.get(techRow.cn_unique_key)
      centerSoftwareIndex.set(techRow.cn_unique_key, existing ? `${existing} | ${software}` : software)
    }

    // Filter accounts
    for (const account of accounts) {
      if (!matchAccountCountry(account.account_hq_country)) continue
      if (!matchAccountIndustry(account.account_hq_industry)) continue
      if (!matchAccountPrimaryCategory(account.account_primary_category)) continue
      if (!matchAccountPrimaryNature(account.account_primary_nature)) continue
      if (!matchAccountNasscom(account.account_nasscom_status)) continue
      if (!matchAccountEmployeesRange(account.account_hq_employee_range)) continue
      if (!matchAccountCenterEmployees(account.account_center_employees_range || "")) continue
      if (!matchAccountRevenue(account.account_hq_revenue)) continue
      if (!matchAccountYearsInIndia(account.years_in_india)) continue
      if (!matchAccountFirstCenterYear(account.account_first_center_year)) continue
      if (!matchAccountName(account.account_global_legal_name)) continue

      filteredAccounts.push(account)
      accountNameSet.add(account.account_global_legal_name)
    }

    // Filter centers
    for (const center of centers) {
      if (hasAccountFilters && !accountNameSet.has(center.account_global_legal_name)) continue
      if (!matchCenterType(center.center_type)) continue
      if (!matchCenterFocus(center.center_focus)) continue
      if (!matchCenterCity(center.center_city)) continue
      if (!matchCenterState(center.center_state)) continue
      if (!matchCenterCountry(center.center_country)) continue
      if (!matchCenterEmployees(center.center_employees_range)) continue
      if (!matchCenterStatus(center.center_status)) continue
      if (!matchCenterIncYear(center.center_inc_year)) continue
      if (hasCenterSoftwareFilters && !matchCenterSoftwareInUse(centerSoftwareIndex.get(center.cn_unique_key) ?? "")) {
        continue
      }

      filteredCenters.push(center)
      centerKeySet.add(center.cn_unique_key)
    }

    // Filter functions
    const functionCenterKeySet = new Set<string>()
    for (const func of functions) {
      if (!centerKeySet.has(func.cn_unique_key)) continue
      if (!hasFunctionFilters || matchFunctionType(func.function_name)) {
        filteredFunctions.push(func)
        if (hasFunctionFilters) {
          functionCenterKeySet.add(func.cn_unique_key)
        }
      }
    }

    // Re-filter centers if function filters are active
    if (hasFunctionFilters) {
      filteredCenters = filteredCenters.filter((center) => functionCenterKeySet.has(center.cn_unique_key))
      centerKeySet = functionCenterKeySet
    }

    // Filter prospects
    for (const prospect of prospects) {
      if (hasAccountFilters && !accountNameSet.has(prospect.account_global_legal_name)) continue
      const matchesProspect =
        matchProspectDepartment(prospect.prospect_department) &&
        matchProspectLevel(prospect.prospect_level) &&
        matchProspectCity(prospect.prospect_city) &&
        matchProspectTitle(prospect.prospect_title)

      if (matchesProspect || !hasProspectFilters) {
        filteredProspects.push(prospect)
      }
    }

    // Cross-filter if prospect filters are active
    if (hasProspectFilters) {
      const accountNamesWithProspects = new Set<string>()
      for (const prospect of filteredProspects) {
        accountNamesWithProspects.add(prospect.account_global_legal_name)
      }

      filteredAccounts = filteredAccounts.filter((account) =>
        accountNamesWithProspects.has(account.account_global_legal_name)
      )
      accountNameSet = accountNamesWithProspects

      filteredCenters = filteredCenters.filter((center) => accountNameSet.has(center.account_global_legal_name))
      centerKeySet = new Set<string>()
      for (const center of filteredCenters) {
        centerKeySet.add(center.cn_unique_key)
      }
    }

    // Filter services
    const filteredServices: Service[] = []
    for (const service of services) {
      if (centerKeySet.has(service.cn_unique_key)) {
        filteredServices.push(service)
      }
    }

    // Final filtering to ensure consistency
    const finalAccountNameSet = new Set<string>()
    for (const center of filteredCenters) {
      finalAccountNameSet.add(center.account_global_legal_name)
    }

    const finalFilteredAccounts = filteredAccounts.filter((account) =>
      finalAccountNameSet.has(account.account_global_legal_name)
    )
    const finalFilteredFunctions = filteredFunctions.filter((func) => centerKeySet.has(func.cn_unique_key))
    const finalFilteredProspects = filteredProspects.filter((prospect) =>
      finalAccountNameSet.has(prospect.account_global_legal_name)
    )

    return {
      filteredAccounts: finalFilteredAccounts,
      filteredCenters: filteredCenters,
      filteredFunctions: finalFilteredFunctions,
      filteredServices: filteredServices,
      filteredProspects: finalFilteredProspects,
    }
  }, [data, filters])
}
