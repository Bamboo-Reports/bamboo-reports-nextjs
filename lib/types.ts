export interface Account {
  "ACCOUNT LAST UPDATE DATE"?: string
  "ACCOUNT NASSCOM STATUS"?: string
  "ACCOUNT NASSCOM MEMBER STATUS"?: string
  "ACCOUNT GLOBAL LEGAL NAME": string
  "ACCOUNT ABOUT"?: string
  "ACCOUNT HQ ADDRESS"?: string
  "ACCOUNT HQ CITY"?: string
  "ACCOUNT HQ STATE"?: string
  "ACCOUNT HQ ZIP CODE"?: string
  "ACCOUNT HQ COUNTRY"?: string
  "ACCOUNT HQ REGION"?: string
  "ACCOUNT HQ BOARDLINE"?: string
  "ACCOUNT HQ WEBSITE"?: string
  "ACCOUNT HQ KEY OFFERINGS"?: string
  "ACCOUNT KEY OFFERINGS SOURCE LINK"?: string
  "ACCOUNT HQ SUB INDUSTRY"?: string
  "ACCOUNT HQ INDUSTRY"?: string
  "ACCOUNT PRIMARY CATEGORY"?: string
  "ACCOUNT PRIMARY NATURE"?: string
  "ACCOUNT HQ FORBES 2000 RANK"?: number
  "ACCOUNT HQ FORTUNE 500 RANK"?: string
  "ACCOUNT HQ COMPANY TYPE"?: string
  "ACCOUNT HQ REVNUE"?: number
  "ACCOUNT HQ REVENUE RANGE"?: string
  "ACCOUNT HQ FY END"?: string
  "ACCOUNT HQ REVENUE YEAR"?: number
  "ACCOUNT HQ REVENUE SOURCE TYPE"?: string
  "ACCOUNT HQ REVENUE SOURCE LINK"?: string
  "ACCOUNT HQ EMPLOYEE COUNT"?: string
  "ACCOUNT HQ EMPLOYEE RANGE"?: string
  "ACCOUNT HQ EMPLOYEE RANGE.1"?: string
  "ACCOUNT HQ EMPLOYEE SOURCE TYPE"?: string
  "ACCOUNT CENTER EMPLOYEES"?: number
  "ACCOUNT CENTER EMPLOYEES RANGE"?: string
  "YEARS IN INDIA"?: number
  "ACCOUNT FIRST CENTER"?: number
  "ACCOUNTS COMMENTS"?: string
  "ACCOUNT COVERAGE"?: string
}

export interface Center {
  "LAST UPDATE DATE"?: string
  "CN UNIQUE KEY": string
  "ACCOUNT GLOBAL LEGAL NAME": string
  "CENTER STATUS"?: string
  "CENTER INC YEAR"?: number
  "CENTER INC YEAR NOTES"?: string
  "CENTER INC YEAR UPDATED LINK"?: string
  "CENTER TIMELINE"?: string
  "CENTER END YEAR"?: string
  "CENTER NAME"?: string
  "CENTER BUSINESS SEGMENT"?: string
  "CENTER BUSINESS SUB-SEGMENT"?: string
  "CENTER MANAGEMENT PARTNER"?: string
  "CENTER JV STTAUS"?: string
  "CENTER JV NAME"?: string
  "CENTER TYPE"?: string
  "CENTER FOCUS"?: string
  "CENTER SOURCE LINK"?: string
  "CENTER WEBSITE"?: string
  "CENTER LINKEDIN"?: string
  "CENTER ADDRESS"?: string
  "CENTER CITY"?: string
  "CENTER STATE"?: string
  "CENTER ZIP CODE"?: string
  "CENTER COUNTRY"?: string
  LAT?: number
  LANG?: number
  "CENTER REGION"?: string
  "CENTER BOARDLINE"?: string
  "CENTER EMPLOYEES"?: number
  "CENTER EMPLOYEES RANGE"?: string
  "CENTER EMPLOYEES RANGE SOURCE LINK"?: string
  "CENTER SERVICES"?: string
  "CENTER FIRST CENTER"?: number
  COMMENTS?: string
}

export interface Function {
  "CN UNIQUE KEY": string
  FUNCTION: string
}

export interface Service {
  "LAST UPDATE DATE"?: string
  "ACCOUNT GLOBAL LEGAL NAME"?: string
  "CN UNIQUE KEY": string
  "CENTER NAME"?: string
  "CENTER TYPE"?: string
  "CENTER FOCUS"?: string
  "CENTER CITY"?: string
  "PRIMARY SERVICE"?: string
  "FOCUS REGION"?: string
  IT?: string
  "ER&D"?: string
  FnA?: string
  HR?: string
  PROCUREMENT?: string
  "SALES & MARKETING"?: string
  "CUSTOMER SUPPORT"?: string
  OTHERS?: string
  "SOFTWARE VENDOR"?: string
  "SOFTWARE IN USE"?: string
}

export interface Prospect {
  "LAST UPDATE DATE"?: number
  "ACCOUNT GLOBAL LEGAL NAME"?: string
  "CENTER NAME"?: string
  "PROSPECT FIRST NAME"?: string
  "PROSPECT LAST NAME"?: string
  "PROSPECT TITLE"?: string
  "PROSPECT DEPARTMENT"?: string
  "PROSPECT LEVEL"?: string
  "PROSPECT LINKEDIN LINK"?: string
  "PROSPECT EMAIL"?: string
  "PROSPECT CITY"?: string
  "PROSPECT STATE"?: string
  "PROSPECT COUNTRY"?: string
}

export interface FilterValue {
  value: string
  mode: 'include' | 'exclude'
}

export interface Filters {
  accountCountries: FilterValue[]
  accountRegions: FilterValue[]
  accountIndustries: FilterValue[]
  accountSubIndustries: FilterValue[]
  accountPrimaryCategories: FilterValue[]
  accountPrimaryNatures: FilterValue[]
  accountNasscomStatuses: FilterValue[]
  accountEmployeesRanges: FilterValue[]
  accountCenterEmployees: FilterValue[]
  accountRevenueRange: [number, number]
  includeNullRevenue: boolean
  accountNameKeywords: FilterValue[]
  centerTypes: FilterValue[]
  centerFocus: FilterValue[]
  centerCities: FilterValue[]
  centerStates: FilterValue[]
  centerCountries: FilterValue[]
  centerEmployees: FilterValue[]
  centerStatuses: FilterValue[]
  functionTypes: FilterValue[]
  prospectDepartments: FilterValue[]
  prospectLevels: FilterValue[]
  prospectCities: FilterValue[]
  prospectTitleKeywords: FilterValue[]
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
