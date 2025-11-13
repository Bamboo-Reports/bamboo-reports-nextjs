export interface Account {
  "ACCOUNT NASSCOM STATUS": string
  "ACCOUNT NAME": string
  "ACCOUNT COUNTRY": string
  "ACCOUNT REGION": string
  "ACCOUNT SUB INDUSTRY": string
  "ACCOUNT INDUSTRY": string
  "ACCOUNT PRIMARY CATEGORY": string
  "ACCOUNT PRIMARY NATURE": string
  "ACCOUNT REVNUE": string
  "ACCOUNT REVENUE RANGE": string
  "ACCOUNT EMPLOYEES": string
  "ACCOUNT EMPLOYEES RANGE": string
  "ACCOUNT CENTER EMPLOYEES": string
}

export interface Center {
  "ACCOUNT NAME": string
  "CN UNIQUE KEY": string
  "CENTER STATUS": string
  "CENTER INC YEAR": string
  "CENTER NAME": string
  "CENTER TYPE": string
  "CENTER FOCUS": string
  "CENTER CITY": string
  "CENTER STATE": string
  "CENTER COUNTRY": string
  "CENTER EMPLOYEES": string
  "CENTER EMPLOYEES RANGE": string
}

export interface Function {
  "CN UNIQUE KEY": string
  FUNCTION: string
}

export interface Service {
  "CN UNIQUE KEY": string
  "CENTER NAME": string
  "CENTER TYPE": string
  "CENTER FOCUS": string
  "CENTER CITY": string
  "PRIMARY SERVICE": string
  "FOCUS REGION": string
  IT: string
  "ER&D": string
  FnA: string
  HR: string
  PROCUREMENT: string
  "SALES & MARKETING": string
  "CUSTOMER SUPPORT": string
  OTHERS: string
  "SOFTWARE VENDOR": string
  "SOFTWARE IN USE": string
}

export interface Prospect {
  "ACCOUNT NAME": string
  "CENTER NAME": string
  "FIRST NAME": string
  "LAST NAME": string
  TITLE: string
  DEPARTMENT: string
  LEVEL: string
  "LINKEDIN LINK": string
  EMAIL: string
  CITY: string
  STATE: string
  COUNTRY: string
}

export interface Filters {
  accountCountries: string[]
  accountRegions: string[]
  accountIndustries: string[]
  accountSubIndustries: string[]
  accountPrimaryCategories: string[]
  accountPrimaryNatures: string[]
  accountNasscomStatuses: string[]
  accountEmployeesRanges: string[]
  accountCenterEmployees: string[]
  accountRevenueRange: [number, number]
  includeNullRevenue: boolean
  centerTypes: string[]
  centerFocus: string[]
  centerCities: string[]
  centerStates: string[]
  centerCountries: string[]
  centerEmployees: string[]
  centerStatuses: string[]
  functionTypes: string[]
  prospectDepartments: string[]
  prospectLevels: string[]
  prospectCities: string[]
  prospectTitleKeywords: string[]
  searchTerm: string
}

export interface FilterOption {
  value: string
  count: number
  disabled?: boolean
}

export interface AvailableOptions {
  accountCountries: FilterOption[]
  accountRegions: FilterOption[]
  accountIndustries: FilterOption[]
  accountSubIndustries: FilterOption[]
  accountPrimaryCategories: FilterOption[]
  accountPrimaryNatures: FilterOption[]
  accountNasscomStatuses: FilterOption[]
  accountEmployeesRanges: FilterOption[]
  accountCenterEmployees: FilterOption[]
  centerTypes: FilterOption[]
  centerFocus: FilterOption[]
  centerCities: FilterOption[]
  centerStates: FilterOption[]
  centerCountries: FilterOption[]
  centerEmployees: FilterOption[]
  centerStatuses: FilterOption[]
  functionTypes: FilterOption[]
  prospectDepartments: FilterOption[]
  prospectLevels: FilterOption[]
  prospectCities: FilterOption[]
}

export interface ChartData {
  name: string
  value: number
}
