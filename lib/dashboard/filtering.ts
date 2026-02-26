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
  | "accountHqRegionValues"
  | "accountHqCountryValues"
  | "accountHqIndustryValues"
  | "accountDataCoverageValues"
  | "accountSourceValues"
  | "accountTypeValues"
  | "accountPrimaryCategoryValues"
  | "accountPrimaryNatureValues"
  | "accountNasscomStatusValues"
  | "accountHqEmployeeRangeValues"
  | "accountCenterEmployeesRangeValues"
  | "accountYearsInIndiaRange"
  | "yearsInIndiaIncludeNull"
>

type AvailableOptionsFilterState = Pick<
  Filters,
  | "accountHqRegionValues"
  | "accountHqCountryValues"
  | "accountHqIndustryValues"
  | "accountDataCoverageValues"
  | "accountSourceValues"
  | "accountTypeValues"
  | "accountPrimaryCategoryValues"
  | "accountPrimaryNatureValues"
  | "accountNasscomStatusValues"
  | "accountHqEmployeeRangeValues"
  | "accountCenterEmployeesRangeValues"
  | "accountYearsInIndiaRange"
  | "yearsInIndiaIncludeNull"
  | "centerTypeValues"
  | "centerFocusValues"
  | "centerCityValues"
  | "centerStateValues"
  | "centerCountryValues"
  | "centerEmployeesRangeValues"
  | "centerStatusValues"
  | "centerIncYearRange"
  | "centerIncYearIncludeNull"
  | "functionNameValues"
  | "techSoftwareInUseKeywords"
  | "prospectDepartmentValues"
  | "prospectLevelValues"
  | "prospectCityValues"
  | "accountGlobalLegalNameKeywords"
  | "accountHqRevenueRange"
  | "accountHqRevenueIncludeNull"
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
  const matchAccountRegion = createValueMatcher(filters.accountHqRegionValues)
  const matchAccountCountry = createValueMatcher(filters.accountHqCountryValues)
  const matchAccountIndustry = createValueMatcher(filters.accountHqIndustryValues)
  const matchAccountDataCoverage = createValueMatcher(filters.accountDataCoverageValues)
  const matchAccountSource = createValueMatcher(filters.accountSourceValues)
  const matchAccountType = createValueMatcher(filters.accountTypeValues)
  const matchAccountPrimaryCategory = createValueMatcher(filters.accountPrimaryCategoryValues)
  const matchAccountPrimaryNature = createValueMatcher(filters.accountPrimaryNatureValues)
  const matchAccountNasscom = createValueMatcher(filters.accountNasscomStatusValues)
  const matchAccountEmployeesRange = createValueMatcher(filters.accountHqEmployeeRangeValues)
  const matchAccountCenterEmployees = createValueMatcher(filters.accountCenterEmployeesRangeValues)
  const matchAccountName = createKeywordMatcher(filters.accountGlobalLegalNameKeywords)
  const matchAccountRevenue = (value: number | string | null | undefined) =>
    rangeFilterMatch(filters.accountHqRevenueRange, value, filters.accountHqRevenueIncludeNull, parseRevenueValue)
  const matchAccountYearsInIndia = (value: number | string | null | undefined) =>
    rangeFilterMatch(filters.accountYearsInIndiaRange, value, filters.yearsInIndiaIncludeNull)

  const matchCenterType = createValueMatcher(filters.centerTypeValues)
  const matchCenterFocus = createValueMatcher(filters.centerFocusValues)
  const matchCenterCity = createValueMatcher(filters.centerCityValues)
  const matchCenterState = createValueMatcher(filters.centerStateValues)
  const matchCenterCountry = createValueMatcher(filters.centerCountryValues)
  const matchCenterEmployees = createValueMatcher(filters.centerEmployeesRangeValues)
  const matchCenterStatus = createValueMatcher(filters.centerStatusValues)
  const matchCenterIncYear = (value: number | string | null | undefined) =>
    rangeFilterMatch(filters.centerIncYearRange, value, filters.centerIncYearIncludeNull)

  const matchFunctionType = createValueMatcher(filters.functionNameValues)
  const matchCenterSoftwareInUse = createKeywordMatcher(filters.techSoftwareInUseKeywords)

  const matchProspectDepartment = createValueMatcher(filters.prospectDepartmentValues)
  const matchProspectLevel = createValueMatcher(filters.prospectLevelValues)
  const matchProspectCity = createValueMatcher(filters.prospectCityValues)
  const matchProspectTitle = createKeywordMatcher(filters.prospectTitleKeywords)

  const hasAccountFilters =
    filters.accountHqRegionValues.length > 0 ||
    filters.accountHqCountryValues.length > 0 ||
    filters.accountHqIndustryValues.length > 0 ||
    filters.accountDataCoverageValues.length > 0 ||
    filters.accountSourceValues.length > 0 ||
    filters.accountTypeValues.length > 0 ||
    filters.accountPrimaryCategoryValues.length > 0 ||
    filters.accountPrimaryNatureValues.length > 0 ||
    filters.accountNasscomStatusValues.length > 0 ||
    filters.accountHqEmployeeRangeValues.length > 0 ||
    filters.accountCenterEmployeesRangeValues.length > 0 ||
    filters.accountHqRevenueRange[0] > 0 ||
    filters.accountHqRevenueRange[1] < Number.MAX_SAFE_INTEGER ||
    filters.accountHqRevenueIncludeNull ||
    filters.accountYearsInIndiaRange[0] > 0 ||
    filters.accountYearsInIndiaRange[1] < Number.MAX_SAFE_INTEGER ||
    filters.yearsInIndiaIncludeNull ||
    filters.accountGlobalLegalNameKeywords.length > 0

  const hasProspectFilters =
    filters.prospectDepartmentValues.length > 0 ||
    filters.prospectLevelValues.length > 0 ||
    filters.prospectCityValues.length > 0 ||
    filters.prospectTitleKeywords.length > 0

  const hasFunctionFilters = filters.functionNameValues.length > 0
  const hasCenterSoftwareFilters = filters.techSoftwareInUseKeywords.length > 0

  let filteredAccounts: Account[] = []
  let filteredCenters: Center[] = []
  let filteredFunctions: Function[] = []
  let filteredProspects: Prospect[] = []

  let accountNameSet = new Set<string>()
  let centerKeySet = new Set<string>()

  const centerSoftwareIndex = buildCenterSoftwareIndex(tech)

  for (const account of accounts) {
    if (!matchAccountRegion(account.account_hq_region)) continue
    if (!matchAccountCountry(account.account_hq_country)) continue
    if (!matchAccountIndustry(account.account_hq_industry)) continue
    if (!matchAccountDataCoverage(account.account_data_coverage)) continue
    if (!matchAccountSource(account.account_source)) continue
    if (!matchAccountType(account.account_type)) continue
    if (!matchAccountPrimaryCategory(account.account_primary_category)) continue
    if (!matchAccountPrimaryNature(account.account_primary_nature)) continue
    if (!matchAccountNasscom(account.account_nasscom_status)) continue
    if (!matchAccountEmployeesRange(account.account_hq_employee_range)) continue
    if (!matchAccountCenterEmployees(account.account_center_employees_range || "")) continue
    if (!matchAccountRevenue(account.account_hq_revenue)) continue
    if (!matchAccountYearsInIndia(account.years_in_india)) continue
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
  const matchRegion = createValueMatcher(filters.accountHqRegionValues)
  const matchCountry = createValueMatcher(filters.accountHqCountryValues)
  const matchIndustry = createValueMatcher(filters.accountHqIndustryValues)
  const matchDataCoverage = createValueMatcher(filters.accountDataCoverageValues)
  const matchSource = createValueMatcher(filters.accountSourceValues)
  const matchType = createValueMatcher(filters.accountTypeValues)
  const matchPrimaryCategory = createValueMatcher(filters.accountPrimaryCategoryValues)
  const matchPrimaryNature = createValueMatcher(filters.accountPrimaryNatureValues)
  const matchNasscom = createValueMatcher(filters.accountNasscomStatusValues)
  const matchEmployeesRange = createValueMatcher(filters.accountHqEmployeeRangeValues)
  const matchCenterEmployees = createValueMatcher(filters.accountCenterEmployeesRangeValues)
  const matchYearsInIndiaRange = (value: number | string | null | undefined) =>
    rangeFilterMatch(filters.accountYearsInIndiaRange, value, filters.yearsInIndiaIncludeNull)

  const tempFilteredAccounts = accounts.filter((account) => {
    return (
      matchRegion(account.account_hq_region) &&
      matchCountry(account.account_hq_country) &&
      matchIndustry(account.account_hq_industry) &&
      matchDataCoverage(account.account_data_coverage) &&
      matchSource(account.account_source) &&
      matchType(account.account_type) &&
      matchPrimaryCategory(account.account_primary_category) &&
      matchPrimaryNature(account.account_primary_nature) &&
      matchNasscom(account.account_nasscom_status) &&
      matchEmployeesRange(account.account_hq_employee_range) &&
      matchCenterEmployees(account.account_center_employees_range || "") &&
      matchYearsInIndiaRange(account.years_in_india)
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
  const matchAccountRegion = createValueMatcher(filters.accountHqRegionValues)
  const matchAccountCountry = createValueMatcher(filters.accountHqCountryValues)
  const matchAccountIndustry = createValueMatcher(filters.accountHqIndustryValues)
  const matchAccountDataCoverage = createValueMatcher(filters.accountDataCoverageValues)
  const matchAccountSource = createValueMatcher(filters.accountSourceValues)
  const matchAccountType = createValueMatcher(filters.accountTypeValues)
  const matchAccountPrimaryCategory = createValueMatcher(filters.accountPrimaryCategoryValues)
  const matchAccountPrimaryNature = createValueMatcher(filters.accountPrimaryNatureValues)
  const matchAccountNasscom = createValueMatcher(filters.accountNasscomStatusValues)
  const matchAccountEmployeesRange = createValueMatcher(filters.accountHqEmployeeRangeValues)
  const matchAccountCenterEmployees = createValueMatcher(filters.accountCenterEmployeesRangeValues)
  const matchAccountName = createKeywordMatcher(filters.accountGlobalLegalNameKeywords)
  const matchAccountYearsInIndia = (value: number | string | null | undefined) =>
    rangeFilterMatch(filters.accountYearsInIndiaRange, value, filters.yearsInIndiaIncludeNull)

  const matchCenterType = createValueMatcher(filters.centerTypeValues)
  const matchCenterFocus = createValueMatcher(filters.centerFocusValues)
  const matchCenterCity = createValueMatcher(filters.centerCityValues)
  const matchCenterState = createValueMatcher(filters.centerStateValues)
  const matchCenterCountry = createValueMatcher(filters.centerCountryValues)
  const matchCenterEmployees = createValueMatcher(filters.centerEmployeesRangeValues)
  const matchCenterStatus = createValueMatcher(filters.centerStatusValues)
  const matchCenterIncYear = (value: number | string | null | undefined) =>
    rangeFilterMatch(filters.centerIncYearRange, value, filters.centerIncYearIncludeNull)
  const matchCenterSoftwareInUse = createKeywordMatcher(filters.techSoftwareInUseKeywords)

  const matchProspectDepartment = createValueMatcher(filters.prospectDepartmentValues)
  const matchProspectLevel = createValueMatcher(filters.prospectLevelValues)
  const matchProspectCity = createValueMatcher(filters.prospectCityValues)

  const accountCounts = {
    regions: new Map<string, number>(),
    countries: new Map<string, number>(),
    industries: new Map<string, number>(),
    dataCoverage: new Map<string, number>(),
    sources: new Map<string, number>(),
    accountTypes: new Map<string, number>(),
    primaryCategories: new Map<string, number>(),
    primaryNatures: new Map<string, number>(),
    nasscomStatuses: new Map<string, number>(),
    employeesRanges: new Map<string, number>(),
    centerEmployeesRangeValues: new Map<string, number>(),
  }

  const validAccountNames = new Set<string>()

  accounts.forEach((account) => {
    const matchesAccountName = matchAccountName(account.account_global_legal_name)
    if (!matchesAccountName) return

    const matchesRevenue = rangeFilterMatch(
      filters.accountHqRevenueRange,
      account.account_hq_revenue,
      filters.accountHqRevenueIncludeNull,
      parseRevenueValue
    )

    if (!matchesRevenue) return

    const matchesYearsInIndia = matchAccountYearsInIndia(account.years_in_india)
    if (!matchesYearsInIndia) return

    const country = account.account_hq_country
    const industry = account.account_hq_industry
    const dataCoverage = account.account_data_coverage
    const source = account.account_source
    const accountType = account.account_type
    const region = account.account_hq_region
    const category = account.account_primary_category
    const nature = account.account_primary_nature
    const nasscom = account.account_nasscom_status
    const empRange = account.account_hq_employee_range
    const centerEmp = account.account_center_employees_range || ""

    const matchesRegion = matchAccountRegion(region)
    const matchesCountry = matchAccountCountry(country)
    const matchesIndustry = matchAccountIndustry(industry)
    const matchesDataCoverage = matchAccountDataCoverage(dataCoverage)
    const matchesSource = matchAccountSource(source)
    const matchesAccountType = matchAccountType(accountType)
    const matchesCategory = matchAccountPrimaryCategory(category)
    const matchesNature = matchAccountPrimaryNature(nature)
    const matchesNasscom = matchAccountNasscom(nasscom)
    const matchesEmpRange = matchAccountEmployeesRange(empRange)
    const matchesCenterEmp = matchAccountCenterEmployees(centerEmp)

    if (
      matchesCountry &&
      matchesIndustry &&
      matchesDataCoverage &&
      matchesSource &&
      matchesAccountType &&
      matchesCategory &&
      matchesNature &&
      matchesNasscom &&
      matchesEmpRange &&
      matchesCenterEmp
    ) {
      accountCounts.regions.set(region, (accountCounts.regions.get(region) || 0) + 1)
    }
    if (
      matchesRegion &&
      matchesIndustry &&
      matchesDataCoverage &&
      matchesSource &&
      matchesAccountType &&
      matchesCategory &&
      matchesNature &&
      matchesNasscom &&
      matchesEmpRange &&
      matchesCenterEmp
    ) {
      accountCounts.countries.set(country, (accountCounts.countries.get(country) || 0) + 1)
    }
    if (
      matchesRegion &&
      matchesCountry &&
      matchesDataCoverage &&
      matchesSource &&
      matchesAccountType &&
      matchesCategory &&
      matchesNature &&
      matchesNasscom &&
      matchesEmpRange &&
      matchesCenterEmp
    ) {
      accountCounts.industries.set(industry, (accountCounts.industries.get(industry) || 0) + 1)
    }
    if (
      matchesRegion &&
      matchesCountry &&
      matchesIndustry &&
      matchesSource &&
      matchesAccountType &&
      matchesCategory &&
      matchesNature &&
      matchesNasscom &&
      matchesEmpRange &&
      matchesCenterEmp
    ) {
      accountCounts.dataCoverage.set(dataCoverage, (accountCounts.dataCoverage.get(dataCoverage) || 0) + 1)
    }
    if (
      matchesRegion &&
      matchesCountry &&
      matchesIndustry &&
      matchesDataCoverage &&
      matchesAccountType &&
      matchesCategory &&
      matchesNature &&
      matchesNasscom &&
      matchesEmpRange &&
      matchesCenterEmp
    ) {
      accountCounts.sources.set(source, (accountCounts.sources.get(source) || 0) + 1)
    }
    if (
      matchesRegion &&
      matchesCountry &&
      matchesIndustry &&
      matchesDataCoverage &&
      matchesSource &&
      matchesCategory &&
      matchesNature &&
      matchesNasscom &&
      matchesEmpRange &&
      matchesCenterEmp
    ) {
      accountCounts.accountTypes.set(accountType, (accountCounts.accountTypes.get(accountType) || 0) + 1)
    }
    if (
      matchesRegion &&
      matchesCountry &&
      matchesIndustry &&
      matchesDataCoverage &&
      matchesSource &&
      matchesAccountType &&
      matchesNature &&
      matchesNasscom &&
      matchesEmpRange &&
      matchesCenterEmp
    ) {
      accountCounts.primaryCategories.set(category, (accountCounts.primaryCategories.get(category) || 0) + 1)
    }
    if (
      matchesRegion &&
      matchesCountry &&
      matchesIndustry &&
      matchesDataCoverage &&
      matchesSource &&
      matchesAccountType &&
      matchesCategory &&
      matchesNasscom &&
      matchesEmpRange &&
      matchesCenterEmp
    ) {
      accountCounts.primaryNatures.set(nature, (accountCounts.primaryNatures.get(nature) || 0) + 1)
    }
    if (
      matchesRegion &&
      matchesCountry &&
      matchesIndustry &&
      matchesDataCoverage &&
      matchesSource &&
      matchesAccountType &&
      matchesCategory &&
      matchesNature &&
      matchesEmpRange &&
      matchesCenterEmp
    ) {
      accountCounts.nasscomStatuses.set(nasscom, (accountCounts.nasscomStatuses.get(nasscom) || 0) + 1)
    }
    if (
      matchesRegion &&
      matchesCountry &&
      matchesIndustry &&
      matchesDataCoverage &&
      matchesSource &&
      matchesAccountType &&
      matchesCategory &&
      matchesNature &&
      matchesNasscom &&
      matchesCenterEmp
    ) {
      accountCounts.employeesRanges.set(empRange, (accountCounts.employeesRanges.get(empRange) || 0) + 1)
    }
    if (
      matchesRegion &&
      matchesCountry &&
      matchesIndustry &&
      matchesDataCoverage &&
      matchesSource &&
      matchesAccountType &&
      matchesCategory &&
      matchesNature &&
      matchesNasscom &&
      matchesEmpRange
    ) {
      accountCounts.centerEmployeesRangeValues.set(
        centerEmp,
        (accountCounts.centerEmployeesRangeValues.get(centerEmp) || 0) + 1
      )
    }

    if (
      matchesRegion &&
      matchesCountry &&
      matchesIndustry &&
      matchesDataCoverage &&
      matchesSource &&
      matchesAccountType &&
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
    accountHqRegionValues: mapToSortedArray(accountCounts.regions),
    accountHqCountryValues: mapToSortedArray(accountCounts.countries),
    accountHqIndustryValues: mapToSortedArray(accountCounts.industries),
    accountDataCoverageValues: mapToSortedArray(accountCounts.dataCoverage),
    accountSourceValues: mapToSortedArray(accountCounts.sources),
    accountTypeValues: mapToSortedArray(accountCounts.accountTypes),
    accountPrimaryCategoryValues: mapToSortedArray(accountCounts.primaryCategories),
    accountPrimaryNatureValues: mapToSortedArray(accountCounts.primaryNatures),
    accountNasscomStatusValues: mapToSortedArray(accountCounts.nasscomStatuses),
    accountHqEmployeeRangeValues: mapToSortedArray(accountCounts.employeesRanges),
    accountCenterEmployeesRangeValues: mapToSortedArray(accountCounts.centerEmployeesRangeValues),
    centerTypeValues: mapToSortedArray(centerCounts.types),
    centerFocusValues: mapToSortedArray(centerCounts.focus),
    centerCityValues: mapToSortedArray(centerCounts.cities),
    centerStateValues: mapToSortedArray(centerCounts.states),
    centerCountryValues: mapToSortedArray(centerCounts.countries),
    centerEmployeesRangeValues: mapToSortedArray(centerCounts.employees),
    centerStatusValues: mapToSortedArray(centerCounts.statuses),
    functionNameValues: mapToSortedArray(functionCounts),
    prospectDepartmentValues: mapToSortedArray(prospectCounts.departments),
    prospectLevelValues: mapToSortedArray(prospectCounts.levels),
    prospectCityValues: mapToSortedArray(prospectCounts.cities),
  }
}
