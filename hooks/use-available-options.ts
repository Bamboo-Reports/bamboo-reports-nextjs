"use client"

import { useMemo, useRef } from "react"
import { parseRevenue } from "@/lib/utils/helpers"
import {
  createValueMatcher,
  createKeywordMatcher,
} from "@/lib/utils/filter-helpers"
import { EMPTY_AVAILABLE_OPTIONS } from "@/lib/constants/filters"
import type { Account, Center, Function, Service, Prospect, Tech, Filters, FilterOption, AvailableOptions } from "@/lib/types"

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

function mapToSortedArray(map: Map<string, number>): FilterOption[] {
  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
}

export function useAvailableOptions(
  data: DataInput,
  filters: Filters
): AvailableOptions {
  const isUpdatingOptions = useRef(false)

  // Memoize filter state to prevent unnecessary recalculations
  const filterStateForOptions = useMemo(() => ({
    accountCountries: filters.accountCountries,
    accountIndustries: filters.accountIndustries,
    accountPrimaryCategories: filters.accountPrimaryCategories,
    accountPrimaryNatures: filters.accountPrimaryNatures,
    accountNasscomStatuses: filters.accountNasscomStatuses,
    accountEmployeesRanges: filters.accountEmployeesRanges,
    accountCenterEmployees: filters.accountCenterEmployees,
    accountYearsInIndiaRange: filters.accountYearsInIndiaRange,
    includeNullYearsInIndia: filters.includeNullYearsInIndia,
    accountFirstCenterYearRange: filters.accountFirstCenterYearRange,
    includeNullFirstCenterYear: filters.includeNullFirstCenterYear,
    centerTypes: filters.centerTypes,
    centerFocus: filters.centerFocus,
    centerCities: filters.centerCities,
    centerStates: filters.centerStates,
    centerCountries: filters.centerCountries,
    centerEmployees: filters.centerEmployees,
    centerStatuses: filters.centerStatuses,
    centerIncYearRange: filters.centerIncYearRange,
    includeNullCenterIncYear: filters.includeNullCenterIncYear,
    functionTypes: filters.functionTypes,
    centerSoftwareInUseKeywords: filters.centerSoftwareInUseKeywords,
    prospectDepartments: filters.prospectDepartments,
    prospectLevels: filters.prospectLevels,
    prospectCities: filters.prospectCities,
    accountNameKeywords: filters.accountNameKeywords,
    accountRevenueRange: filters.accountRevenueRange,
    includeNullRevenue: filters.includeNullRevenue,
  }), [filters])

  return useMemo((): AvailableOptions => {
    const { accounts, centers, functions, tech, prospects } = data
    const activeFilters = filterStateForOptions

    if (isUpdatingOptions.current) {
      return EMPTY_AVAILABLE_OPTIONS
    }

    // Create matchers
    const matchAccountCountry = createValueMatcher(activeFilters.accountCountries)
    const matchAccountIndustry = createValueMatcher(activeFilters.accountIndustries)
    const matchAccountPrimaryCategory = createValueMatcher(activeFilters.accountPrimaryCategories)
    const matchAccountPrimaryNature = createValueMatcher(activeFilters.accountPrimaryNatures)
    const matchAccountNasscom = createValueMatcher(activeFilters.accountNasscomStatuses)
    const matchAccountEmployeesRange = createValueMatcher(activeFilters.accountEmployeesRanges)
    const matchAccountCenterEmployees = createValueMatcher(activeFilters.accountCenterEmployees)
    const matchAccountName = createKeywordMatcher(activeFilters.accountNameKeywords)
    const matchAccountYearsInIndia = (value: number | string | null | undefined) =>
      rangeFilterMatch(activeFilters.accountYearsInIndiaRange, value, activeFilters.includeNullYearsInIndia)
    const matchAccountFirstCenterYear = (value: number | string | null | undefined) =>
      rangeFilterMatch(activeFilters.accountFirstCenterYearRange, value, activeFilters.includeNullFirstCenterYear)

    const matchCenterType = createValueMatcher(activeFilters.centerTypes)
    const matchCenterFocus = createValueMatcher(activeFilters.centerFocus)
    const matchCenterCity = createValueMatcher(activeFilters.centerCities)
    const matchCenterState = createValueMatcher(activeFilters.centerStates)
    const matchCenterCountry = createValueMatcher(activeFilters.centerCountries)
    const matchCenterEmployees = createValueMatcher(activeFilters.centerEmployees)
    const matchCenterStatus = createValueMatcher(activeFilters.centerStatuses)
    const matchCenterIncYear = (value: number | string | null | undefined) =>
      rangeFilterMatch(activeFilters.centerIncYearRange, value, activeFilters.includeNullCenterIncYear)
    const matchCenterSoftwareInUse = createKeywordMatcher(activeFilters.centerSoftwareInUseKeywords)

    const matchProspectDepartment = createValueMatcher(activeFilters.prospectDepartments)
    const matchProspectLevel = createValueMatcher(activeFilters.prospectLevels)
    const matchProspectCity = createValueMatcher(activeFilters.prospectCities)

    // Account counts
    const accountCounts = {
      countries: new Map<string, number>(),
      industries: new Map<string, number>(),
      primaryCategories: new Map<string, number>(),
      primaryNatures: new Map<string, number>(),
      nasscomStatuses: new Map<string, number>(),
      employeesRanges: new Map<string, number>(),
      centerEmployees: new Map<string, number>(),
    }

    const validAccountNames = new Set<string>()

    accounts.forEach((account) => {
      const matchesAccountName = matchAccountName(account.account_global_legal_name)
      if (!matchesAccountName) return

      const matchesRevenue = rangeFilterMatch(
        activeFilters.accountRevenueRange,
        account.account_hq_revenue,
        activeFilters.includeNullRevenue,
        parseRevenueValue
      )
      if (!matchesRevenue) return

      const matchesYearsInIndia = matchAccountYearsInIndia(account.years_in_india)
      if (!matchesYearsInIndia) return

      const matchesFirstCenterYear = matchAccountFirstCenterYear(account.account_first_center_year)
      if (!matchesFirstCenterYear) return

      const country = account.account_hq_country ?? ""
      const industry = account.account_hq_industry ?? ""
      const category = account.account_primary_category ?? ""
      const nature = account.account_primary_nature ?? ""
      const nasscom = account.account_nasscom_status ?? ""
      const empRange = account.account_hq_employee_range ?? ""
      const centerEmp = account.account_center_employees_range || ""

      const matchesCountry = matchAccountCountry(country)
      const matchesIndustry = matchAccountIndustry(industry)
      const matchesCategory = matchAccountPrimaryCategory(category)
      const matchesNature = matchAccountPrimaryNature(nature)
      const matchesNasscom = matchAccountNasscom(nasscom)
      const matchesEmpRange = matchAccountEmployeesRange(empRange)
      const matchesCenterEmp = matchAccountCenterEmployees(centerEmp)

      if (matchesIndustry && matchesCategory && matchesNature && matchesNasscom && matchesEmpRange && matchesCenterEmp) {
        accountCounts.countries.set(country, (accountCounts.countries.get(country) || 0) + 1)
      }
      if (matchesCountry && matchesCategory && matchesNature && matchesNasscom && matchesEmpRange && matchesCenterEmp) {
        accountCounts.industries.set(industry, (accountCounts.industries.get(industry) || 0) + 1)
      }
      if (matchesCountry && matchesIndustry && matchesNature && matchesNasscom && matchesEmpRange && matchesCenterEmp) {
        accountCounts.primaryCategories.set(category, (accountCounts.primaryCategories.get(category) || 0) + 1)
      }
      if (matchesCountry && matchesIndustry && matchesCategory && matchesNasscom && matchesEmpRange && matchesCenterEmp) {
        accountCounts.primaryNatures.set(nature, (accountCounts.primaryNatures.get(nature) || 0) + 1)
      }
      if (matchesCountry && matchesIndustry && matchesCategory && matchesNature && matchesEmpRange && matchesCenterEmp) {
        accountCounts.nasscomStatuses.set(nasscom, (accountCounts.nasscomStatuses.get(nasscom) || 0) + 1)
      }
      if (matchesCountry && matchesIndustry && matchesCategory && matchesNature && matchesNasscom && matchesCenterEmp) {
        accountCounts.employeesRanges.set(empRange, (accountCounts.employeesRanges.get(empRange) || 0) + 1)
      }
      if (matchesCountry && matchesIndustry && matchesCategory && matchesNature && matchesNasscom && matchesEmpRange) {
        accountCounts.centerEmployees.set(centerEmp, (accountCounts.centerEmployees.get(centerEmp) || 0) + 1)
      }

      if (
        matchesCountry &&
        matchesIndustry &&
        matchesCategory &&
        matchesNature &&
        matchesNasscom &&
        matchesEmpRange &&
        matchesCenterEmp
      ) {
        validAccountNames.add(account.account_global_legal_name)
      }
    })

    // Center counts
    const centerCounts = {
      types: new Map<string, number>(),
      focus: new Map<string, number>(),
      cities: new Map<string, number>(),
      states: new Map<string, number>(),
      countries: new Map<string, number>(),
      employees: new Map<string, number>(),
      statuses: new Map<string, number>(),
    }

    const validCenterKeys = new Set<string>()

    // Build center software index
    const centerSoftwareIndex = new Map<string, string>()
    for (const techRow of tech) {
      const software = techRow.software_in_use?.trim()
      if (!software || !techRow.cn_unique_key) continue
      const existing = centerSoftwareIndex.get(techRow.cn_unique_key)
      centerSoftwareIndex.set(techRow.cn_unique_key, existing ? `${existing} | ${software}` : software)
    }

    centers.forEach((center) => {
      if (!validAccountNames.has(center.account_global_legal_name)) return

      const type = center.center_type ?? ""
      const focus = center.center_focus ?? ""
      const city = center.center_city ?? ""
      const state = center.center_state ?? ""
      const country = center.center_country ?? ""
      const employees = center.center_employees_range ?? ""
      const status = center.center_status ?? ""

      const matchesType = matchCenterType(type)
      const matchesFocus = matchCenterFocus(focus)
      const matchesCity = matchCenterCity(city)
      const matchesState = matchCenterState(state)
      const matchesCountry = matchCenterCountry(country)
      const matchesEmployees = matchCenterEmployees(employees)
      const matchesStatus = matchCenterStatus(status)
      const matchesIncYear = matchCenterIncYear(center.center_inc_year)
      const matchesSoftware = matchCenterSoftwareInUse(centerSoftwareIndex.get(center.cn_unique_key) ?? "")

      if (!matchesIncYear) return
      if (!matchesSoftware) return

      if (matchesFocus && matchesCity && matchesState && matchesCountry && matchesEmployees && matchesStatus) {
        centerCounts.types.set(type, (centerCounts.types.get(type) || 0) + 1)
      }
      if (matchesType && matchesCity && matchesState && matchesCountry && matchesEmployees && matchesStatus) {
        centerCounts.focus.set(focus, (centerCounts.focus.get(focus) || 0) + 1)
      }
      if (matchesType && matchesFocus && matchesState && matchesCountry && matchesEmployees && matchesStatus) {
        centerCounts.cities.set(city, (centerCounts.cities.get(city) || 0) + 1)
      }
      if (matchesType && matchesFocus && matchesCity && matchesCountry && matchesEmployees && matchesStatus) {
        centerCounts.states.set(state, (centerCounts.states.get(state) || 0) + 1)
      }
      if (matchesType && matchesFocus && matchesCity && matchesState && matchesEmployees && matchesStatus) {
        centerCounts.countries.set(country, (centerCounts.countries.get(country) || 0) + 1)
      }
      if (matchesType && matchesFocus && matchesCity && matchesState && matchesCountry && matchesStatus) {
        centerCounts.employees.set(employees, (centerCounts.employees.get(employees) || 0) + 1)
      }
      if (matchesType && matchesFocus && matchesCity && matchesState && matchesCountry && matchesEmployees) {
        centerCounts.statuses.set(status, (centerCounts.statuses.get(status) || 0) + 1)
      }

      if (
        matchesType &&
        matchesFocus &&
        matchesCity &&
        matchesState &&
        matchesCountry &&
        matchesEmployees &&
        matchesStatus &&
        matchesSoftware
      ) {
        validCenterKeys.add(center.cn_unique_key)
      }
    })

    // Function counts
    const functionCounts = new Map<string, number>()
    functions.forEach((func) => {
      if (!validCenterKeys.has(func.cn_unique_key)) return
      const funcType = func.function_name
      functionCounts.set(funcType, (functionCounts.get(funcType) || 0) + 1)
    })

    // Prospect counts
    const prospectCounts = {
      departments: new Map<string, number>(),
      levels: new Map<string, number>(),
      cities: new Map<string, number>(),
    }

    prospects.forEach((prospect) => {
      if (!validAccountNames.has(prospect.account_global_legal_name)) return

      const department = prospect.prospect_department ?? ""
      const level = prospect.prospect_level ?? ""
      const city = prospect.prospect_city ?? ""

      const matchesDepartment = matchProspectDepartment(department)
      const matchesLevel = matchProspectLevel(level)
      const matchesCity = matchProspectCity(city)

      if (matchesLevel && matchesCity) {
        prospectCounts.departments.set(department, (prospectCounts.departments.get(department) || 0) + 1)
      }
      if (matchesDepartment && matchesCity) {
        prospectCounts.levels.set(level, (prospectCounts.levels.get(level) || 0) + 1)
      }
      if (matchesDepartment && matchesLevel) {
        prospectCounts.cities.set(city, (prospectCounts.cities.get(city) || 0) + 1)
      }
    })

    return {
      accountCountries: mapToSortedArray(accountCounts.countries),
      accountIndustries: mapToSortedArray(accountCounts.industries),
      accountPrimaryCategories: mapToSortedArray(accountCounts.primaryCategories),
      accountPrimaryNatures: mapToSortedArray(accountCounts.primaryNatures),
      accountNasscomStatuses: mapToSortedArray(accountCounts.nasscomStatuses),
      accountEmployeesRanges: mapToSortedArray(accountCounts.employeesRanges),
      accountCenterEmployees: mapToSortedArray(accountCounts.centerEmployees),
      centerTypes: mapToSortedArray(centerCounts.types),
      centerFocus: mapToSortedArray(centerCounts.focus),
      centerCities: mapToSortedArray(centerCounts.cities),
      centerStates: mapToSortedArray(centerCounts.states),
      centerCountries: mapToSortedArray(centerCounts.countries),
      centerEmployees: mapToSortedArray(centerCounts.employees),
      centerStatuses: mapToSortedArray(centerCounts.statuses),
      functionTypes: mapToSortedArray(functionCounts),
      prospectDepartments: mapToSortedArray(prospectCounts.departments),
      prospectLevels: mapToSortedArray(prospectCounts.levels),
      prospectCities: mapToSortedArray(prospectCounts.cities),
    }
  }, [data, filterStateForOptions])
}
