export interface Account {
  account_nasscom_status: string
  account_nasscom_member_status?: string
  account_global_legal_name: string
  account_hq_company_type?: string
  account_about?: string
  account_hq_key_offerings?: string
  account_key_offerings_source_link?: string
  account_hq_address?: string
  account_hq_city?: string
  account_hq_state?: string
  account_hq_zip_code?: string
  account_hq_country: string
  account_hq_region: string
  account_hq_boardline?: string
  account_hq_website?: string
  account_hq_sub_industry: string
  account_hq_industry: string
  account_primary_category: string
  account_primary_nature: string
  account_hq_revenue?: number
  account_hq_revenue_range: string
  account_hq_fy_end?: string
  account_hq_revenue_year?: number
  account_hq_revenue_source_type?: string
  account_hq_revenue_source_link?: string
  account_hq_employee_count?: number
  account_hq_employee_range: string
  account_hq_employee_source_type?: string
  account_hq_employee_source_link?: string
  account_center_employees?: number
  account_center_employees_range?: string
  account_hq_forbes_2000_rank?: number
  account_hq_fortune_500_rank?: number
  account_first_center_year?: number
  years_in_india?: number
  account_comments?: string
  account_coverage?: string
  account_last_update_date?: string
}

export interface Center {
  account_global_legal_name: string
  cn_unique_key: string
  center_status: string
  center_inc_year?: number
  center_inc_year_notes?: string
  center_inc_year_updated_link?: string
  center_timeline?: string
  center_end_year?: number
  center_name: string
  center_business_segment?: string
  center_business_sub_segment?: string
  center_management_partner?: string
  center_jv_status?: string
  center_jv_name?: string
  center_type: string
  center_focus: string
  center_source_link?: string
  center_website?: string
  center_linkedin?: string
  center_account_website?: string
  center_address?: string
  center_city: string
  center_state: string
  center_zip_code?: string
  center_country: string
  center_region?: string
  center_boardline?: string
  center_employees?: number
  center_employees_range: string
  center_employees_range_source_link?: string
  center_services?: string
  center_first_year?: number
  center_comments?: string
  lat?: number
  lng?: number
  last_update_date?: string
}

export interface Function {
  cn_unique_key: string
  function_name: string
}

export interface Service {
  cn_unique_key: string
  account_global_legal_name?: string
  center_name: string
  center_type: string
  center_focus: string
  center_city: string
  primary_service: string
  focus_region: string
  service_it: string
  service_erd: string
  service_fna: string
  service_hr: string
  service_procurement: string
  service_sales_marketing: string
  service_customer_support: string
  service_others: string
  software_vendor: string
  software_in_use: string
  last_update_date?: string
}

export interface Prospect {
  account_global_legal_name: string
  center_name: string
  prospect_first_name: string
  prospect_last_name: string
  prospect_title: string
  prospect_department: string
  prospect_level: string
  prospect_linkedin_url: string
  prospect_email: string
  prospect_city: string
  prospect_state: string
  prospect_country: string
  last_update_date?: string
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
