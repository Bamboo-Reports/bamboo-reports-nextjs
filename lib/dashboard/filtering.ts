import type {
  Account,
  Center,
  Function,
  Service,
  Prospect,
  Tech,
  Filters,
  FilterOption,
  AvailableOptions,
} from "@/lib/types"
import { parseRevenue } from "@/lib/utils/helpers"
import { createValueMatcher, createKeywordMatcher } from "@/lib/utils/filter-helpers"

export type FilteredData = {
  filteredAccounts: Account[]
  filteredCenters: Center[]
  filteredFunctions: Function[]
  filteredServices: Service[]
  filteredProspects: Prospect[]
}

export type RevenueRangeFilterState = Pick<
  Filters,
  | "accountCountries"
  | "accountIndustries"
  | "accountPrimaryCategories"
  | "accountPrimaryNatures"
  | "accountNasscomStatuses"
  | "accountEmployeesRanges"
  | "accountCenterEmployees"
  | "accountYearsInIndiaRange"
  | "includeNullYearsInIndia"
  | "accountFirstCenterYearRange"
  | "includeNullFirstCenterYear"
>

type AvailableOptionsFilterState = Pick<
  Filters,
  | "accountCountries"
  | "accountIndustries"
  | "accountPrimaryCategories"
  | "accountPrimaryNatures"
  | "accountNasscomStatuses"
  | "accountEmployeesRanges"
  | "accountCenterEmployees"
  | "accountYearsInIndiaRange"
  | "includeNullYearsInIndia"
  | "accountFirstCenterYearRange"
  | "includeNullFirstCenterYear"
  | "centerTypes"
  | "centerFocus"
  | "centerCities"
  | "centerStates"
  | "centerCountries"
  | "centerEmployees"
  | "centerStatuses"
  | "centerIncYearRange"
  | "includeNullCenterIncYear"
  | "functionTypes"
  | "centerSoftwareInUseKeywords"
  | "prospectDepartments"
  | "prospectLevels"
  | "prospectCities"
  | "accountNameKeywords"
  | "accountRevenueRange"
  | "includeNullRevenue"
>

const normalizeNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return 0
  const num = typeof value === "number" ? value : Number(value)
  return Number.isFinite(num) ? num : 0
}

const parseRevenueValue = (value: number | string | null | undefined) => parseRevenue(value ?? 0)

const rangeFilterMatch = (
  range: [number, number],
  value: number | string | null | undefined,
  includeNull: boolean,
  parser: (value: number | string | null | undefined) => number = normalizeNumber
) => {
  const numValue = parser(value)

  if (includeNull && (numValue === 0 || value === null || value === undefined || value === "")) {
    return true
  }

  if (!includeNull && (numValue === 0 || value === null || value === undefined || value === "")) {
    return false
  }

  return numValue >= range[0] && numValue <= range[1]
}

const buildCenterSoftwareIndex = (tech: Tech[]) => {
  const centerSoftwareIndex = new Map<string, string>()
  for (const techRow of tech) {
    const software = techRow.software_in_use?.trim()
    if (!software || !techRow.cn_unique_key) continue
    const existing = centerSoftwareIndex.get(techRow.cn_unique_key)
    centerSoftwareIndex.set(techRow.cn_unique_key, existing ? `${existing} | ${software}` : software)
  }
  return centerSoftwareIndex
}

export function getAccountNames(accounts: Account[]) {
  return Array.from(
    new Set(accounts.map((account) => account.account_global_legal_name).filter(Boolean))
  )
}

export function getFilteredData(
  accounts: Account[],
  centers: Center[],
  functions: Function[],
  services: Service[],
  prospects: Prospect[],
  tech: Tech[],
  filters: Filters
): FilteredData {
  const matchAccountCountry = createValueMatcher(filters.accountCountries)
  const matchAccountIndustry = createValueMatcher(filters.accountIndustries)
  const matchAccountPrimaryCategory = createValueMatcher(filters.accountPrimaryCategories)
  const matchAccountPrimaryNature = createValueMatcher(filters.accountPrimaryNatures)
  const matchAccountNasscom = createValueMatcher(filters.accountNasscomStatuses)
  const matchAccountEmployeesRange = createValueMatcher(filters.accountEmployeesRanges)
  const matchAccountCenterEmployees = createValueMatcher(filters.accountCenterEmployees)
  const matchAccountName = createKeywordMatcher(filters.accountNameKeywords)
  const matchAccountRevenue = (value: number | string | null | undefined) =>
    rangeFilterMatch(filters.accountRevenueRange, value, filters.includeNullRevenue, parseRevenueValue)
  const matchAccountYearsInIndia = (value: number | string | null | undefined) =>
    rangeFilterMatch(filters.accountYearsInIndiaRange, value, filters.includeNullYearsInIndia)
  const matchAccountFirstCenterYear = (value: number | string | null | undefined) =>
    rangeFilterMatch(filters.accountFirstCenterYearRange, value, filters.includeNullFirstCenterYear)

  const matchCenterType = createValueMatcher(filters.centerTypes)
  const matchCenterFocus = createValueMatcher(filters.centerFocus)
  const matchCenterCity = createValueMatcher(filters.centerCities)
  const matchCenterState = createValueMatcher(filters.centerStates)
  const matchCenterCountry = createValueMatcher(filters.centerCountries)
  const matchCenterEmployees = createValueMatcher(filters.centerEmployees)
  const matchCenterStatus = createValueMatcher(filters.centerStatuses)
  const matchCenterIncYear = (value: number | string | null | undefined) =>
    rangeFilterMatch(filters.centerIncYearRange, value, filters.includeNullCenterIncYear)

  const matchFunctionType = createValueMatcher(filters.functionTypes)
  const matchCenterSoftwareInUse = createKeywordMatcher(filters.centerSoftwareInUseKeywords)

  const matchProspectDepartment = createValueMatcher(filters.prospectDepartments)
  const matchProspectLevel = createValueMatcher(filters.prospectLevels)
  const matchProspectCity = createValueMatcher(filters.prospectCities)
  const matchProspectTitle = createKeywordMatcher(filters.prospectTitleKeywords)

  const hasAccountFilters =
    filters.accountCountries.length > 0 ||
    filters.accountIndustries.length > 0 ||
    filters.accountPrimaryCategories.length > 0 ||
    filters.accountPrimaryNatures.length > 0 ||
    filters.accountNasscomStatuses.length > 0 ||
    filters.accountEmployeesRanges.length > 0 ||
    filters.accountCenterEmployees.length > 0 ||
    filters.accountRevenueRange[0] > 0 ||
    filters.accountRevenueRange[1] < Number.MAX_SAFE_INTEGER ||
    filters.includeNullRevenue ||
    filters.accountYearsInIndiaRange[0] > 0 ||
    filters.accountYearsInIndiaRange[1] < Number.MAX_SAFE_INTEGER ||
    filters.includeNullYearsInIndia ||
    filters.accountFirstCenterYearRange[0] > 0 ||
    filters.accountFirstCenterYearRange[1] < Number.MAX_SAFE_INTEGER ||
    filters.includeNullFirstCenterYear ||
    filters.accountNameKeywords.length > 0

  const hasProspectFilters =
    filters.prospectDepartments.length > 0 ||
    filters.prospectLevels.length > 0 ||
    filters.prospectCities.length > 0 ||
    filters.prospectTitleKeywords.length > 0

  const hasFunctionFilters = filters.functionTypes.length > 0
  const hasCenterSoftwareFilters = filters.centerSoftwareInUseKeywords.length > 0

  let filteredAccounts: Account[] = []
  let filteredCenters: Center[] = []
  let filteredFunctions: Function[] = []
  let filteredProspects: Prospect[] = []

  let accountNameSet = new Set<string>()
  let centerKeySet = new Set<string>()

  const centerSoftwareIndex = buildCenterSoftwareIndex(tech)

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

  if (hasFunctionFilters) {
    filteredCenters = filteredCenters.filter((center) => functionCenterKeySet.has(center.cn_unique_key))
    centerKeySet = functionCenterKeySet
  }

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

  const filteredServices: Service[] = []
  for (const service of services) {
    if (centerKeySet.has(service.cn_unique_key)) {
      filteredServices.push(service)
    }
  }

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
}

export function getDynamicRevenueRange(accounts: Account[], filters: RevenueRangeFilterState) {
  const matchCountry = createValueMatcher(filters.accountCountries)
  const matchIndustry = createValueMatcher(filters.accountIndustries)
  const matchPrimaryCategory = createValueMatcher(filters.accountPrimaryCategories)
  const matchPrimaryNature = createValueMatcher(filters.accountPrimaryNatures)
  const matchNasscom = createValueMatcher(filters.accountNasscomStatuses)
  const matchEmployeesRange = createValueMatcher(filters.accountEmployeesRanges)
  const matchCenterEmployees = createValueMatcher(filters.accountCenterEmployees)
  const matchYearsInIndiaRange = (value: number | string | null | undefined) =>
    rangeFilterMatch(filters.accountYearsInIndiaRange, value, filters.includeNullYearsInIndia)
  const matchFirstCenterYearRange = (value: number | string | null | undefined) =>
    rangeFilterMatch(filters.accountFirstCenterYearRange, value, filters.includeNullFirstCenterYear)

  const tempFilteredAccounts = accounts.filter((account) => {
    return (
      matchCountry(account.account_hq_country) &&
      matchIndustry(account.account_hq_industry) &&
      matchPrimaryCategory(account.account_primary_category) &&
      matchPrimaryNature(account.account_primary_nature) &&
      matchNasscom(account.account_nasscom_status) &&
      matchEmployeesRange(account.account_hq_employee_range) &&
      matchCenterEmployees(account.account_center_employees_range || "") &&
      matchYearsInIndiaRange(account.years_in_india) &&
      matchFirstCenterYearRange(account.account_first_center_year)
    )
  })

  const validRevenues = tempFilteredAccounts
    .map((account) => parseRevenue(account.account_hq_revenue))
    .filter((rev) => rev > 0)

  if (validRevenues.length === 0) {
    return { min: 0, max: 1000000 }
  }

  return {
    min: Math.min(...validRevenues),
    max: Math.max(...validRevenues),
  }
}

export function getAvailableOptions(
  accounts: Account[],
  centers: Center[],
  functions: Function[],
  prospects: Prospect[],
  tech: Tech[],
  filters: AvailableOptionsFilterState
): AvailableOptions {
  const matchAccountCountry = createValueMatcher(filters.accountCountries)
  const matchAccountIndustry = createValueMatcher(filters.accountIndustries)
  const matchAccountPrimaryCategory = createValueMatcher(filters.accountPrimaryCategories)
  const matchAccountPrimaryNature = createValueMatcher(filters.accountPrimaryNatures)
  const matchAccountNasscom = createValueMatcher(filters.accountNasscomStatuses)
  const matchAccountEmployeesRange = createValueMatcher(filters.accountEmployeesRanges)
  const matchAccountCenterEmployees = createValueMatcher(filters.accountCenterEmployees)
  const matchAccountName = createKeywordMatcher(filters.accountNameKeywords)
  const matchAccountYearsInIndia = (value: number | string | null | undefined) =>
    rangeFilterMatch(filters.accountYearsInIndiaRange, value, filters.includeNullYearsInIndia)
  const matchAccountFirstCenterYear = (value: number | string | null | undefined) =>
    rangeFilterMatch(filters.accountFirstCenterYearRange, value, filters.includeNullFirstCenterYear)

  const matchCenterType = createValueMatcher(filters.centerTypes)
  const matchCenterFocus = createValueMatcher(filters.centerFocus)
  const matchCenterCity = createValueMatcher(filters.centerCities)
  const matchCenterState = createValueMatcher(filters.centerStates)
  const matchCenterCountry = createValueMatcher(filters.centerCountries)
  const matchCenterEmployees = createValueMatcher(filters.centerEmployees)
  const matchCenterStatus = createValueMatcher(filters.centerStatuses)
  const matchCenterIncYear = (value: number | string | null | undefined) =>
    rangeFilterMatch(filters.centerIncYearRange, value, filters.includeNullCenterIncYear)
  const matchCenterSoftwareInUse = createKeywordMatcher(filters.centerSoftwareInUseKeywords)

  const matchProspectDepartment = createValueMatcher(filters.prospectDepartments)
  const matchProspectLevel = createValueMatcher(filters.prospectLevels)
  const matchProspectCity = createValueMatcher(filters.prospectCities)

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
      filters.accountRevenueRange,
      account.account_hq_revenue,
      filters.includeNullRevenue,
      parseRevenueValue
    )

    if (!matchesRevenue) return

    const matchesYearsInIndia = matchAccountYearsInIndia(account.years_in_india)
    if (!matchesYearsInIndia) return

    const matchesFirstCenterYear = matchAccountFirstCenterYear(account.account_first_center_year)
    if (!matchesFirstCenterYear) return

    const country = account.account_hq_country
    const industry = account.account_hq_industry
    const category = account.account_primary_category
    const nature = account.account_primary_nature
    const nasscom = account.account_nasscom_status
    const empRange = account.account_hq_employee_range
    const centerEmp = account.account_center_employees_range || ""

    const matchesCountry = matchAccountCountry(country)
    const matchesIndustry = matchAccountIndustry(industry)
    const matchesCategory = matchAccountPrimaryCategory(category)
    const matchesNature = matchAccountPrimaryNature(nature)
    const matchesNasscom = matchAccountNasscom(nasscom)
    const matchesEmpRange = matchAccountEmployeesRange(empRange)
    const matchesCenterEmp = matchAccountCenterEmployees(centerEmp)

    if (
      matchesIndustry &&
      matchesCategory &&
      matchesNature &&
      matchesNasscom &&
      matchesEmpRange &&
      matchesCenterEmp
    ) {
      accountCounts.countries.set(country, (accountCounts.countries.get(country) || 0) + 1)
    }
    if (
      matchesCountry &&
      matchesCategory &&
      matchesNature &&
      matchesNasscom &&
      matchesEmpRange &&
      matchesCenterEmp
    ) {
      accountCounts.industries.set(industry, (accountCounts.industries.get(industry) || 0) + 1)
    }
    if (
      matchesCountry &&
      matchesIndustry &&
      matchesNature &&
      matchesNasscom &&
      matchesEmpRange &&
      matchesCenterEmp
    ) {
      accountCounts.primaryCategories.set(category, (accountCounts.primaryCategories.get(category) || 0) + 1)
    }
    if (
      matchesCountry &&
      matchesIndustry &&
      matchesCategory &&
      matchesNasscom &&
      matchesEmpRange &&
      matchesCenterEmp
    ) {
      accountCounts.primaryNatures.set(nature, (accountCounts.primaryNatures.get(nature) || 0) + 1)
    }
    if (
      matchesCountry &&
      matchesIndustry &&
      matchesCategory &&
      matchesNature &&
      matchesEmpRange &&
      matchesCenterEmp
    ) {
      accountCounts.nasscomStatuses.set(nasscom, (accountCounts.nasscomStatuses.get(nasscom) || 0) + 1)
    }
    if (
      matchesCountry &&
      matchesIndustry &&
      matchesCategory &&
      matchesNature &&
      matchesNasscom &&
      matchesCenterEmp
    ) {
      accountCounts.employeesRanges.set(empRange, (accountCounts.employeesRanges.get(empRange) || 0) + 1)
    }
    if (
      matchesCountry &&
      matchesIndustry &&
      matchesCategory &&
      matchesNature &&
      matchesNasscom &&
      matchesEmpRange
    ) {
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

  const centerSoftwareIndex = buildCenterSoftwareIndex(tech)

  centers.forEach((center) => {
    if (!validAccountNames.has(center.account_global_legal_name)) return

    const type = center.center_type
    const focus = center.center_focus
    const city = center.center_city
    const state = center.center_state
    const country = center.center_country
    const employees = center.center_employees_range
    const status = center.center_status

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

  const functionCounts = new Map<string, number>()

  functions.forEach((func) => {
    if (!validCenterKeys.has(func.cn_unique_key)) return
    const funcType = func.function_name
    functionCounts.set(funcType, (functionCounts.get(funcType) || 0) + 1)
  })

  const prospectCounts = {
    departments: new Map<string, number>(),
    levels: new Map<string, number>(),
    cities: new Map<string, number>(),
  }

  prospects.forEach((prospect) => {
    if (!validAccountNames.has(prospect.account_global_legal_name)) return

    const department = prospect.prospect_department
    const level = prospect.prospect_level
    const city = prospect.prospect_city

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

  const mapToSortedArray = (map: Map<string, number>): FilterOption[] => {
    return Array.from(map.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
  }

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
}
