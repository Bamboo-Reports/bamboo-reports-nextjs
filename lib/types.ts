export interface Account {
  account_nasscom_status: string | null
  account_global_legal_name: string
  account_hq_company_type?: string | null
  account_about?: string | null
  account_hq_key_offerings?: string | null
  account_hq_city?: string | null
  account_hq_country: string | null
  account_hq_region: string | null
  account_hq_sub_industry?: string | null
  account_hq_industry?: string | null
  account_primary_category?: string | null
  account_primary_nature?: string | null
  account_hq_revenue?: number | null
  account_hq_revenue_range?: string | null
  account_hq_employee_count?: number | null
  account_hq_employee_range?: string | null
  account_hq_forbes_2000_rank?: number | null
  account_hq_fortune_500_rank?: number | null
  account_first_center_year?: number | null
  years_in_india?: number | null
  account_hq_website?: string | null
  account_center_employees_range?: string | null
  account_comments?: string | null
  account_coverage?: string | null
}

export interface Center {
  account_global_legal_name: string
  cn_unique_key: string
  center_status: string | null
  center_inc_year?: number | null
  center_name: string | null
  center_type: string | null
  center_focus: string | null
  center_city: string | null
  center_state: string | null
  center_country: string | null
  center_employees?: number | null
  center_employees_range?: string | null
  center_business_segment?: string | null
  center_business_sub_segment?: string | null
  center_boardline?: string | null
  center_account_website?: string | null
  lat?: number | null
  lng?: number | null
}

export interface Function {
  cn_unique_key: string
  function_name: string
}

export interface Service {
  cn_unique_key: string
  center_name: string | null
  center_type: string | null
  center_focus: string | null
  center_city: string | null
  primary_service: string | null
  focus_region: string | null
  service_it: string | null
  service_erd: string | null
  service_fna: string | null
  service_hr: string | null
  service_procurement: string | null
  service_sales_marketing: string | null
  service_customer_support: string | null
  service_others: string | null
  software_vendor: string | null
  software_in_use: string | null
  account_global_legal_name?: string | null
}

export interface Prospect {
  account_global_legal_name: string
  center_name: string | null
  prospect_full_name?: string | null
  prospect_first_name: string | null
  prospect_last_name: string | null
  prospect_title: string | null
  prospect_department: string | null
  prospect_level: string | null
  prospect_linkedin_url: string | null
  prospect_email: string | null
  prospect_city: string | null
  prospect_state: string | null
  prospect_country: string | null
}

export interface Profile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
}

export interface FilterValue {
  value: string
  mode: 'include' | 'exclude'
}

export interface Filters {
  accountCountries: FilterValue[]
  accountIndustries: FilterValue[]
  accountPrimaryCategories: FilterValue[]
  accountPrimaryNatures: FilterValue[]
  accountNasscomStatuses: FilterValue[]
  accountEmployeesRanges: FilterValue[]
  accountCenterEmployees: FilterValue[]
  accountRevenueRange: [number, number]
  includeNullRevenue: boolean
  accountYearsInIndiaRange: [number, number]
  includeNullYearsInIndia: boolean
  accountFirstCenterYearRange: [number, number]
  includeNullFirstCenterYear: boolean
  accountNameKeywords: FilterValue[]
  centerTypes: FilterValue[]
  centerFocus: FilterValue[]
  centerCities: FilterValue[]
  centerStates: FilterValue[]
  centerCountries: FilterValue[]
  centerEmployees: FilterValue[]
  centerStatuses: FilterValue[]
  centerIncYearRange: [number, number]
  includeNullCenterIncYear: boolean
  functionTypes: FilterValue[]
  prospectDepartments: FilterValue[]
  prospectLevels: FilterValue[]
  prospectCities: FilterValue[]
  prospectTitleKeywords: FilterValue[]
}

export interface FilterOption {
  value: string
  count: number
  disabled?: boolean
}

export interface AvailableOptions {
  accountCountries: FilterOption[]
  accountIndustries: FilterOption[]
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
