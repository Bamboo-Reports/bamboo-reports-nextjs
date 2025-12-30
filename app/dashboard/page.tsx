"use client"

import React, { useState, useCallback, useMemo, useRef, useEffect, useDeferredValue, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Slider } from "@/components/ui/slider"
import {
  Filter,
  RotateCcw,
  Info,
  Download,
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Copy,
  Loader2,
  Building,
  Briefcase,
  PieChartIcon,
  Table as TableIcon,
} from "lucide-react"
import { MultiSelect } from "@/components/multi-select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getAllData, testConnection, getDatabaseStatus, clearCache } from "../actions"
import { LoadingState } from "@/components/states/loading-state"
import { ErrorState } from "@/components/states/error-state"
import { Header } from "@/components/layout/header"
import { FiltersSidebar } from "@/components/filters/filters-sidebar"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { AccountsTab, CentersTab } from "@/components/tabs"
import { ProspectsTab } from "@/components/tabs/prospects-tab"
import {
  parseRevenue,
  formatRevenueInMillions,
  debounce,
  getPaginatedData,
  getTotalPages,
  getPageInfo,
  copyToClipboard,
} from "@/lib/utils/helpers"
import {
  createValueMatcher,
  createKeywordMatcher,
} from "@/lib/utils/filter-helpers"
import {
  calculateChartData,
  calculateCenterChartData,
  calculateCityChartData,
  calculateFunctionChartData,
} from "@/lib/utils/chart-helpers"
import {
  exportToExcel,
  exportAllData as exportAll,
} from "@/lib/utils/export-helpers"
import type { Account, Center, Function, Service, Prospect, Filters, FilterOption, AvailableOptions } from "@/lib/types"

function DashboardContent() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [functions, setFunctions] = useState<Function[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string>("")
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [revenueRange, setRevenueRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000000 })
  const [filters, setFilters] = useState<Filters>({
    accountCountries: [],
    accountRegions: [],
    accountIndustries: [],
    accountSubIndustries: [],
    accountPrimaryCategories: [],
    accountPrimaryNatures: [],
    accountNasscomStatuses: [],
    accountEmployeesRanges: [],
    accountCenterEmployees: [],
    accountRevenueRange: [0, 1000000],
    includeNullRevenue: false,
    accountNameKeywords: [],
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
    prospectTitleKeywords: [],
    searchTerm: "",
  })
  const [pendingFilters, setPendingFilters] = useState<Filters>({
    accountCountries: [],
    accountRegions: [],
    accountIndustries: [],
    accountSubIndustries: [],
    accountPrimaryCategories: [],
    accountPrimaryNatures: [],
    accountNasscomStatuses: [],
    accountEmployeesRanges: [],
    accountCenterEmployees: [],
    accountRevenueRange: [0, 1000000],
    includeNullRevenue: false,
    accountNameKeywords: [],
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
    prospectTitleKeywords: [],
    searchTerm: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [isApplying, setIsApplying] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const [accountsView, setAccountsView] = useState<"chart" | "data">("chart")
  const [centersView, setCentersView] = useState<"chart" | "data" | "map">("chart")
  const [prospectsView, setProspectsView] = useState<"chart" | "data">("chart")
  const [, startFilterTransition] = useTransition()
  const deferredFilters = useDeferredValue(filters)

  // Debounced search handler - optimized for fast response
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setPendingFilters((prev) => ({ ...prev, searchTerm: value }))
      }, 150),
    [setPendingFilters]
  )

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    debouncedSearch(value)
  }

  const checkDatabaseStatus = useCallback(async () => {
    try {
      const status = await getDatabaseStatus()
      setDbStatus(status)
      console.log("Database status:", status)
      return status
    } catch (err) {
      console.error("Failed to check database status:", err)
      return null
    }
  }, [])

  const testDatabaseConnection = useCallback(async () => {
    try {
      const result = await testConnection()
      setConnectionStatus(result.message)
      return result.success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Connection test failed"
      setConnectionStatus(errorMessage)
      return false
    }
  }, [])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setConnectionStatus("Checking database configuration...")

      const status = await checkDatabaseStatus()
      if (status && !status.hasUrl) {
        setError("Database URL not configured. Please check environment variables.")
        setConnectionStatus("Database URL missing")
        return
      }

      if (status && !status.hasConnection) {
        setError("Database connection could not be initialized.")
        setConnectionStatus("Connection initialization failed")
        return
      }

      setConnectionStatus("Testing database connection...")

      const connectionOk = await testDatabaseConnection()
      if (!connectionOk) {
        setError("Database connection test failed. Please check your database configuration.")
        return
      }

      setConnectionStatus("Loading data from database...")
      const data = await getAllData()

      if (data.error) {
        setError(`Database error: ${data.error}`)
        setConnectionStatus("Data loading failed")
        return
      }

      const accountsData = Array.isArray(data.accounts) ? data.accounts : []
      const centersData = Array.isArray(data.centers) ? data.centers : []
      const functionsData = Array.isArray(data.functions) ? data.functions : []
      const servicesData = Array.isArray(data.services) ? data.services : []
      const prospectsData = Array.isArray(data.prospects) ? data.prospects : []

      if (
        accountsData.length === 0 &&
        centersData.length === 0 &&
        functionsData.length === 0 &&
        servicesData.length === 0 &&
        prospectsData.length === 0
      ) {
        setError("No data found in database tables. Please check if your tables contain data.")
        setConnectionStatus("No data available")
        return
      }

      setAccounts(accountsData as Account[])
      setCenters(centersData as Center[])
      setFunctions(functionsData as Function[])
      setServices(servicesData as Service[])
      setProspects(prospectsData as Prospect[])

      const revenues = accountsData
        .map((account: Account) => parseRevenue(account.account_hq_revenue))
        .filter((rev: number) => rev > 0)

      if (revenues.length > 0) {
        const minRevenue = Math.min(...revenues)
        const maxRevenue = Math.max(...revenues)
        setRevenueRange({ min: minRevenue, max: maxRevenue })

        const newRange: [number, number] = [minRevenue, maxRevenue]
        setFilters((prev) => ({ ...prev, accountRevenueRange: newRange }))
        setPendingFilters((prev) => ({ ...prev, accountRevenueRange: newRange }))
      }

      setConnectionStatus(
        `Successfully loaded: ${accountsData.length} accounts, ${centersData.length} centers, ${functionsData.length} functions, ${servicesData.length} services, ${prospectsData.length} prospects`
      )
    } catch (err) {
      console.error("Error loading data:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load data from database"
      setError(errorMessage)
      setConnectionStatus("Database connection failed")
    } finally {
      setLoading(false)
    }
  }, [checkDatabaseStatus, testDatabaseConnection])

  // Load data from database on component mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Auto-apply filters with debouncing for smooth performance
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      startFilterTransition(() => {
        setFilters(pendingFilters)
        setIsApplying(false)
      })
    }, 300) // 300ms debounce for optimal responsiveness

    setIsApplying(true)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [pendingFilters, startFilterTransition])

  // Clear cache and reload data
  const handleClearCache = async () => {
    try {
      setConnectionStatus("Clearing cache...")
      await clearCache()
      await loadData()
    } catch (err) {
      console.error("Error clearing cache:", err)
      setError("Failed to clear cache")
    }
  }

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const isUpdatingOptions = useRef(false)

  // Extract unique account names for autocomplete - memoized for performance
  const accountNames = useMemo(() => {
    return Array.from(
      new Set(accounts.map((account) => account.account_global_legal_name).filter(Boolean))
    )
  }, [accounts])

  // Main filtering logic - single pass optimized
  const filteredData = useMemo(() => {
    const activeFilters = deferredFilters
    const rangeFilterMatch = (range: [number, number], value: string | number, includeNull: boolean) => {
      const numValue = parseRevenue(value)

      if (includeNull && (numValue === 0 || value === null || value === undefined || value === "")) {
        return true
      }

      if (!includeNull && (numValue === 0 || value === null || value === undefined || value === "")) {
        return false
      }

      return numValue >= range[0] && numValue <= range[1]
    }

    const matchAccountCountry = createValueMatcher(activeFilters.accountCountries)
    const matchAccountRegion = createValueMatcher(activeFilters.accountRegions)
    const matchAccountIndustry = createValueMatcher(activeFilters.accountIndustries)
    const matchAccountSubIndustry = createValueMatcher(activeFilters.accountSubIndustries)
    const matchAccountPrimaryCategory = createValueMatcher(activeFilters.accountPrimaryCategories)
    const matchAccountPrimaryNature = createValueMatcher(activeFilters.accountPrimaryNatures)
    const matchAccountNasscom = createValueMatcher(activeFilters.accountNasscomStatuses)
    const matchAccountEmployeesRange = createValueMatcher(activeFilters.accountEmployeesRanges)
    const matchAccountCenterEmployees = createValueMatcher(activeFilters.accountCenterEmployees)
    const matchAccountName = createKeywordMatcher(activeFilters.accountNameKeywords)

    const matchCenterType = createValueMatcher(activeFilters.centerTypes)
    const matchCenterFocus = createValueMatcher(activeFilters.centerFocus)
    const matchCenterCity = createValueMatcher(activeFilters.centerCities)
    const matchCenterState = createValueMatcher(activeFilters.centerStates)
    const matchCenterCountry = createValueMatcher(activeFilters.centerCountries)
    const matchCenterEmployees = createValueMatcher(activeFilters.centerEmployees)
    const matchCenterStatus = createValueMatcher(activeFilters.centerStatuses)

    const matchFunctionType = createValueMatcher(activeFilters.functionTypes)

    const matchProspectDepartment = createValueMatcher(activeFilters.prospectDepartments)
    const matchProspectLevel = createValueMatcher(activeFilters.prospectLevels)
    const matchProspectCity = createValueMatcher(activeFilters.prospectCities)
    const matchProspectTitle = createKeywordMatcher(activeFilters.prospectTitleKeywords)

    const hasAccountFilters =
      activeFilters.accountCountries.length > 0 ||
      activeFilters.accountRegions.length > 0 ||
      activeFilters.accountIndustries.length > 0 ||
      activeFilters.accountSubIndustries.length > 0 ||
      activeFilters.accountPrimaryCategories.length > 0 ||
      activeFilters.accountPrimaryNatures.length > 0 ||
      activeFilters.accountNasscomStatuses.length > 0 ||
      activeFilters.accountEmployeesRanges.length > 0 ||
      activeFilters.accountCenterEmployees.length > 0 ||
      activeFilters.accountRevenueRange[0] > 0 ||
      activeFilters.accountRevenueRange[1] < Number.MAX_SAFE_INTEGER ||
      activeFilters.includeNullRevenue ||
      activeFilters.accountNameKeywords.length > 0

    const hasProspectFilters =
      activeFilters.prospectDepartments.length > 0 ||
      activeFilters.prospectLevels.length > 0 ||
      activeFilters.prospectCities.length > 0 ||
      activeFilters.prospectTitleKeywords.length > 0

    const hasFunctionFilters = activeFilters.functionTypes.length > 0

    let filteredAccounts: Account[] = []
    let filteredCenters: Center[] = []
    let filteredFunctions: Function[] = []
    let filteredProspects: Prospect[] = []

    let accountNameSet = new Set<string>()
    let centerKeySet = new Set<string>()

    for (const account of accounts) {
      if (!matchAccountCountry(account.account_hq_country)) continue
      if (!matchAccountRegion(account.account_hq_region)) continue
      if (!matchAccountIndustry(account.account_hq_industry)) continue
      if (!matchAccountSubIndustry(account.account_hq_sub_industry)) continue
      if (!matchAccountPrimaryCategory(account.account_primary_category)) continue
      if (!matchAccountPrimaryNature(account.account_primary_nature)) continue
      if (!matchAccountNasscom(account.account_nasscom_status)) continue
      if (!matchAccountEmployeesRange(account.account_hq_employee_range)) continue
      if (!matchAccountCenterEmployees(account.account_center_employees_range || "")) continue
      if (!rangeFilterMatch(activeFilters.accountRevenueRange, account.account_hq_revenue, activeFilters.includeNullRevenue)) {
        continue
      }
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
  }, [accounts, centers, functions, services, prospects, deferredFilters])

  // Calculate chart data for accounts
  const accountChartData = useMemo(() => {
    const accounts = filteredData.filteredAccounts

    return {
      regionData: calculateChartData(accounts, "account_hq_region"),
      primaryNatureData: calculateChartData(accounts, "account_primary_nature"),
      revenueRangeData: calculateChartData(accounts, "account_hq_revenue_range"),
      employeesRangeData: calculateChartData(accounts, "account_hq_employee_range"),
    }
  }, [filteredData.filteredAccounts])

  // Calculate chart data for centers
  const centerChartData = useMemo(() => {
    const centers = filteredData.filteredCenters
    const centerKeys = centers.map((c) => c.cn_unique_key)

    return {
      centerTypeData: calculateCenterChartData(centers, "center_type"),
      employeesRangeData: calculateCenterChartData(centers, "center_employees_range"),
      cityData: calculateCityChartData(centers),
      functionData: calculateFunctionChartData(filteredData.filteredFunctions, centerKeys),
    }
  }, [filteredData.filteredCenters, filteredData.filteredFunctions])

  // Calculate chart data for prospects
  const prospectChartData = useMemo(() => {
    const prospects = filteredData.filteredProspects

    return {
      departmentData: calculateChartData(prospects, "prospect_department"),
      levelData: calculateChartData(prospects, "prospect_level"),
    }
  }, [filteredData.filteredProspects])

  // Dynamic revenue range calculation - optimized with selective filter state
  const filterStateForRevenue = useMemo(() => ({
    accountCountries: deferredFilters.accountCountries,
    accountRegions: deferredFilters.accountRegions,
    accountIndustries: deferredFilters.accountIndustries,
    accountSubIndustries: deferredFilters.accountSubIndustries,
    accountPrimaryCategories: deferredFilters.accountPrimaryCategories,
    accountPrimaryNatures: deferredFilters.accountPrimaryNatures,
    accountNasscomStatuses: deferredFilters.accountNasscomStatuses,
    accountEmployeesRanges: deferredFilters.accountEmployeesRanges,
    accountCenterEmployees: deferredFilters.accountCenterEmployees,
    searchTerm: deferredFilters.searchTerm,
  }), [deferredFilters.accountCountries, deferredFilters.accountRegions, deferredFilters.accountIndustries, deferredFilters.accountSubIndustries, deferredFilters.accountPrimaryCategories, deferredFilters.accountPrimaryNatures, deferredFilters.accountNasscomStatuses, deferredFilters.accountEmployeesRanges, deferredFilters.accountCenterEmployees, deferredFilters.searchTerm])

  const dynamicRevenueRange = useMemo(() => {
    const activeFilters = filterStateForRevenue
    const tempFilters = {
      ...activeFilters,
      accountRevenueRange: [0, Number.MAX_SAFE_INTEGER] as [number, number],
      includeNullRevenue: true,
    }

    const matchCountry = createValueMatcher(tempFilters.accountCountries)
    const matchRegion = createValueMatcher(tempFilters.accountRegions)
    const matchIndustry = createValueMatcher(tempFilters.accountIndustries)
    const matchSubIndustry = createValueMatcher(tempFilters.accountSubIndustries)
    const matchPrimaryCategory = createValueMatcher(tempFilters.accountPrimaryCategories)
    const matchPrimaryNature = createValueMatcher(tempFilters.accountPrimaryNatures)
    const matchNasscom = createValueMatcher(tempFilters.accountNasscomStatuses)
    const matchEmployeesRange = createValueMatcher(tempFilters.accountEmployeesRanges)
    const matchCenterEmployees = createValueMatcher(tempFilters.accountCenterEmployees)

    const searchTermLower = tempFilters.searchTerm.trim().toLowerCase()

    const tempFilteredAccounts = accounts.filter((account) => {
      const matchesSearch =
        searchTermLower === "" ||
        account.account_global_legal_name.toLowerCase().includes(searchTermLower)

      return (
        matchCountry(account.account_hq_country) &&
        matchRegion(account.account_hq_region) &&
        matchIndustry(account.account_hq_industry) &&
        matchSubIndustry(account.account_hq_sub_industry) &&
        matchPrimaryCategory(account.account_primary_category) &&
        matchPrimaryNature(account.account_primary_nature) &&
        matchNasscom(account.account_nasscom_status) &&
        matchEmployeesRange(account.account_hq_employee_range) &&
        matchCenterEmployees(account.account_center_employees_range || "") &&
        matchesSearch
      )
    })

    const validRevenues = tempFilteredAccounts
      .map((account) => parseRevenue(account.account_hq_revenue))
      .filter((rev) => rev > 0)

    if (validRevenues.length === 0) {
      return { min: 0, max: 1000000 }
    }

    const minRevenue = Math.min(...validRevenues)
    const maxRevenue = Math.max(...validRevenues)

    return { min: minRevenue, max: maxRevenue }
  }, [accounts, filterStateForRevenue])

  // Update revenueRange when dynamicRevenueRange changes
  useEffect(() => {
    setRevenueRange(dynamicRevenueRange)

    setPendingFilters((prev) => {
      const newMin = Math.max(prev.accountRevenueRange[0], dynamicRevenueRange.min)
      const newMax = Math.min(prev.accountRevenueRange[1], dynamicRevenueRange.max)

      if (newMin !== prev.accountRevenueRange[0] || newMax !== prev.accountRevenueRange[1]) {
        return {
          ...prev,
          accountRevenueRange: [newMin, newMax] as [number, number],
        }
      }

      return prev
    })
  }, [dynamicRevenueRange])

  // Calculate available options - OPTIMIZED with memoization of filter-relevant state
  const filterStateForOptions = useMemo(() => ({
    accountCountries: deferredFilters.accountCountries,
    accountRegions: deferredFilters.accountRegions,
    accountIndustries: deferredFilters.accountIndustries,
    accountSubIndustries: deferredFilters.accountSubIndustries,
    accountPrimaryCategories: deferredFilters.accountPrimaryCategories,
    accountPrimaryNatures: deferredFilters.accountPrimaryNatures,
    accountNasscomStatuses: deferredFilters.accountNasscomStatuses,
    accountEmployeesRanges: deferredFilters.accountEmployeesRanges,
    accountCenterEmployees: deferredFilters.accountCenterEmployees,
    centerTypes: deferredFilters.centerTypes,
    centerFocus: deferredFilters.centerFocus,
    centerCities: deferredFilters.centerCities,
    centerStates: deferredFilters.centerStates,
    centerCountries: deferredFilters.centerCountries,
    centerEmployees: deferredFilters.centerEmployees,
    centerStatuses: deferredFilters.centerStatuses,
    functionTypes: deferredFilters.functionTypes,
    prospectDepartments: deferredFilters.prospectDepartments,
    prospectLevels: deferredFilters.prospectLevels,
    prospectCities: deferredFilters.prospectCities,
    accountNameKeywords: deferredFilters.accountNameKeywords,
    accountRevenueRange: deferredFilters.accountRevenueRange,
    includeNullRevenue: deferredFilters.includeNullRevenue,
    searchTerm: deferredFilters.searchTerm,
  }), [deferredFilters])

  const availableOptions = useMemo((): AvailableOptions => {
    const activeFilters = filterStateForOptions
    if (isUpdatingOptions.current) {
      return {
        accountCountries: [],
        accountRegions: [],
        accountIndustries: [],
        accountSubIndustries: [],
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
    }

    const matchAccountCountry = createValueMatcher(activeFilters.accountCountries)
    const matchAccountRegion = createValueMatcher(activeFilters.accountRegions)
    const matchAccountIndustry = createValueMatcher(activeFilters.accountIndustries)
    const matchAccountSubIndustry = createValueMatcher(activeFilters.accountSubIndustries)
    const matchAccountPrimaryCategory = createValueMatcher(activeFilters.accountPrimaryCategories)
    const matchAccountPrimaryNature = createValueMatcher(activeFilters.accountPrimaryNatures)
    const matchAccountNasscom = createValueMatcher(activeFilters.accountNasscomStatuses)
    const matchAccountEmployeesRange = createValueMatcher(activeFilters.accountEmployeesRanges)
    const matchAccountCenterEmployees = createValueMatcher(activeFilters.accountCenterEmployees)
    const matchAccountName = createKeywordMatcher(activeFilters.accountNameKeywords)

    const matchCenterType = createValueMatcher(activeFilters.centerTypes)
    const matchCenterFocus = createValueMatcher(activeFilters.centerFocus)
    const matchCenterCity = createValueMatcher(activeFilters.centerCities)
    const matchCenterState = createValueMatcher(activeFilters.centerStates)
    const matchCenterCountry = createValueMatcher(activeFilters.centerCountries)
    const matchCenterEmployees = createValueMatcher(activeFilters.centerEmployees)
    const matchCenterStatus = createValueMatcher(activeFilters.centerStatuses)

    const matchProspectDepartment = createValueMatcher(activeFilters.prospectDepartments)
    const matchProspectLevel = createValueMatcher(activeFilters.prospectLevels)
    const matchProspectCity = createValueMatcher(activeFilters.prospectCities)

    const accountCounts = {
      countries: new Map<string, number>(),
      regions: new Map<string, number>(),
      industries: new Map<string, number>(),
      subIndustries: new Map<string, number>(),
      primaryCategories: new Map<string, number>(),
      primaryNatures: new Map<string, number>(),
      nasscomStatuses: new Map<string, number>(),
      employeesRanges: new Map<string, number>(),
      centerEmployees: new Map<string, number>(),
    }

    const validAccountNames = new Set<string>()

    const searchTermLower = (activeFilters.searchTerm || "").trim().toLowerCase()

    accounts.forEach((account) => {
      const matchesSearch =
        searchTermLower === "" || account.account_global_legal_name.toLowerCase().includes(searchTermLower)

      if (!matchesSearch) return

      const matchesAccountName = matchAccountName(account.account_global_legal_name)

      if (!matchesAccountName) return

      const revenue = parseRevenue(account.account_hq_revenue)
      const matchesRevenue = activeFilters.includeNullRevenue
        ? true
        : revenue >= activeFilters.accountRevenueRange[0] && revenue <= activeFilters.accountRevenueRange[1]

      if (!matchesRevenue) return

      const country = account.account_hq_country
      const region = account.account_hq_region
      const industry = account.account_hq_industry
      const subIndustry = account.account_hq_sub_industry
      const category = account.account_primary_category
      const nature = account.account_primary_nature
      const nasscom = account.account_nasscom_status
      const empRange = account.account_hq_employee_range
      const centerEmp = account.account_center_employees_range || ""

      const matchesCountry = matchAccountCountry(country)
      const matchesRegion = matchAccountRegion(region)
      const matchesIndustry = matchAccountIndustry(industry)
      const matchesSubIndustry = matchAccountSubIndustry(subIndustry)
      const matchesCategory = matchAccountPrimaryCategory(category)
      const matchesNature = matchAccountPrimaryNature(nature)
      const matchesNasscom = matchAccountNasscom(nasscom)
      const matchesEmpRange = matchAccountEmployeesRange(empRange)
      const matchesCenterEmp = matchAccountCenterEmployees(centerEmp)

      if (
        matchesRegion &&
        matchesIndustry &&
        matchesSubIndustry &&
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
        matchesIndustry &&
        matchesSubIndustry &&
        matchesCategory &&
        matchesNature &&
        matchesNasscom &&
        matchesEmpRange &&
        matchesCenterEmp
      ) {
        accountCounts.regions.set(region, (accountCounts.regions.get(region) || 0) + 1)
      }
      if (
        matchesCountry &&
        matchesRegion &&
        matchesSubIndustry &&
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
        matchesRegion &&
        matchesIndustry &&
        matchesCategory &&
        matchesNature &&
        matchesNasscom &&
        matchesEmpRange &&
        matchesCenterEmp
      ) {
        accountCounts.subIndustries.set(subIndustry, (accountCounts.subIndustries.get(subIndustry) || 0) + 1)
      }
      if (
        matchesCountry &&
        matchesRegion &&
        matchesIndustry &&
        matchesSubIndustry &&
        matchesNature &&
        matchesNasscom &&
        matchesEmpRange &&
        matchesCenterEmp
      ) {
        accountCounts.primaryCategories.set(category, (accountCounts.primaryCategories.get(category) || 0) + 1)
      }
      if (
        matchesCountry &&
        matchesRegion &&
        matchesIndustry &&
        matchesSubIndustry &&
        matchesCategory &&
        matchesNasscom &&
        matchesEmpRange &&
        matchesCenterEmp
      ) {
        accountCounts.primaryNatures.set(nature, (accountCounts.primaryNatures.get(nature) || 0) + 1)
      }
      if (
        matchesCountry &&
        matchesRegion &&
        matchesIndustry &&
        matchesSubIndustry &&
        matchesCategory &&
        matchesNature &&
        matchesEmpRange &&
        matchesCenterEmp
      ) {
        accountCounts.nasscomStatuses.set(nasscom, (accountCounts.nasscomStatuses.get(nasscom) || 0) + 1)
      }
      if (
        matchesCountry &&
        matchesRegion &&
        matchesIndustry &&
        matchesSubIndustry &&
        matchesCategory &&
        matchesNature &&
        matchesNasscom &&
        matchesCenterEmp
      ) {
        accountCounts.employeesRanges.set(empRange, (accountCounts.employeesRanges.get(empRange) || 0) + 1)
      }
      if (
        matchesCountry &&
        matchesRegion &&
        matchesIndustry &&
        matchesSubIndustry &&
        matchesCategory &&
        matchesNature &&
        matchesNasscom &&
        matchesEmpRange
      ) {
        accountCounts.centerEmployees.set(centerEmp, (accountCounts.centerEmployees.get(centerEmp) || 0) + 1)
      }

      if (
        matchesCountry &&
        matchesRegion &&
        matchesIndustry &&
        matchesSubIndustry &&
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
        matchesStatus
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

    // Calculate prospect counts
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
      accountRegions: mapToSortedArray(accountCounts.regions),
      accountIndustries: mapToSortedArray(accountCounts.industries),
      accountSubIndustries: mapToSortedArray(accountCounts.subIndustries),
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
  }, [accounts, centers, functions, prospects, filterStateForOptions])

  const applyFilters = useCallback(() => {
    setIsApplying(true)
    startFilterTransition(() => {
      setFilters(pendingFilters)
      setIsApplying(false)
    })
  }, [pendingFilters, startFilterTransition])

  const resetFilters = () => {
    const emptyFilters = {
      accountCountries: [],
      accountRegions: [],
      accountIndustries: [],
      accountSubIndustries: [],
      accountPrimaryCategories: [],
      accountPrimaryNatures: [],
      accountNasscomStatuses: [],
      accountEmployeesRanges: [],
      accountCenterEmployees: [],
      accountRevenueRange: [revenueRange.min, revenueRange.max] as [number, number],
      includeNullRevenue: false,
      accountNameKeywords: [],
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
      prospectTitleKeywords: [],
      searchTerm: "",
    }
    setFilters(emptyFilters)
    setPendingFilters(emptyFilters)
  }

  const getTotalPendingFilters = () => {
    return (
      pendingFilters.accountCountries.length +
      pendingFilters.accountRegions.length +
      pendingFilters.accountIndustries.length +
      pendingFilters.accountSubIndustries.length +
      pendingFilters.accountPrimaryCategories.length +
      pendingFilters.accountPrimaryNatures.length +
      pendingFilters.accountNasscomStatuses.length +
      pendingFilters.accountEmployeesRanges.length +
      pendingFilters.accountCenterEmployees.length +
      (pendingFilters.accountRevenueRange[0] !== revenueRange.min ||
        pendingFilters.accountRevenueRange[1] !== revenueRange.max
        ? 1
        : 0) +
      (pendingFilters.includeNullRevenue ? 1 : 0) +
      pendingFilters.accountNameKeywords.length +
      pendingFilters.centerTypes.length +
      pendingFilters.centerFocus.length +
      pendingFilters.centerCities.length +
      pendingFilters.centerStates.length +
      pendingFilters.centerCountries.length +
      pendingFilters.centerEmployees.length +
      pendingFilters.centerStatuses.length +
      pendingFilters.functionTypes.length +
      pendingFilters.prospectDepartments.length +
      pendingFilters.prospectLevels.length +
      pendingFilters.prospectCities.length +
      pendingFilters.prospectTitleKeywords.length
    )
  }

  const hasUnappliedChanges = () => {
    return JSON.stringify(filters) !== JSON.stringify(pendingFilters)
  }

  const getTotalActiveFilters = () => {
    return (
      filters.accountCountries.length +
      filters.accountRegions.length +
      filters.accountIndustries.length +
      filters.accountSubIndustries.length +
      filters.accountPrimaryCategories.length +
      filters.accountPrimaryNatures.length +
      filters.accountNasscomStatuses.length +
      filters.accountEmployeesRanges.length +
      filters.accountCenterEmployees.length +
      (filters.accountRevenueRange[0] !== revenueRange.min || filters.accountRevenueRange[1] !== revenueRange.max
        ? 1
        : 0) +
      (filters.includeNullRevenue ? 1 : 0) +
      filters.accountNameKeywords.length +
      filters.centerTypes.length +
      filters.centerFocus.length +
      filters.centerCities.length +
      filters.centerStates.length +
      filters.centerCountries.length +
      filters.centerEmployees.length +
      filters.centerStatuses.length +
      filters.functionTypes.length +
      filters.prospectDepartments.length +
      filters.prospectLevels.length +
      filters.prospectCities.length +
      filters.prospectTitleKeywords.length
    )
  }

  const handleLoadSavedFilters = (savedFilters: Filters) => {
    setPendingFilters(savedFilters)
    setFilters(savedFilters)
  }

  const handleExportAll = () => {
    exportAll(
      filteredData.filteredAccounts,
      filteredData.filteredCenters,
      filteredData.filteredFunctions,
      filteredData.filteredServices
    )
  }

  const handleMinRevenueChange = (value: string) => {
    const numValue = Number.parseFloat(value) || revenueRange.min
    const clampedValue = Math.max(revenueRange.min, Math.min(numValue, pendingFilters.accountRevenueRange[1]))
    setPendingFilters((prev) => ({
      ...prev,
      accountRevenueRange: [clampedValue, prev.accountRevenueRange[1]],
    }))
  }

  const handleMaxRevenueChange = (value: string) => {
    const numValue = Number.parseFloat(value) || revenueRange.max
    const clampedValue = Math.min(revenueRange.max, Math.max(numValue, pendingFilters.accountRevenueRange[0]))
    setPendingFilters((prev) => ({
      ...prev,
      accountRevenueRange: [prev.accountRevenueRange[0], clampedValue],
    }))
  }

  const dataLoaded =
    !loading && accounts.length > 0 && centers.length > 0 && services.length > 0 && prospects.length > 0

  if (loading) {
    return <LoadingState connectionStatus={connectionStatus} dbStatus={dbStatus} />
  }

  if (error) {
    return <ErrorState error={error} dbStatus={dbStatus} onRetry={loadData} onClearCache={handleClearCache} />
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header onRefresh={loadData} />

      {dataLoaded && (
        <div className="flex flex-1 overflow-hidden">
          <FiltersSidebar
            filters={filters}
            pendingFilters={pendingFilters}
            availableOptions={availableOptions}
            isApplying={isApplying}
            revenueRange={revenueRange}
            accountNames={accountNames}
            setPendingFilters={setPendingFilters}
            resetFilters={resetFilters}
            handleExportAll={handleExportAll}
            handleMinRevenueChange={handleMinRevenueChange}
            handleMaxRevenueChange={handleMaxRevenueChange}
            getTotalActiveFilters={getTotalActiveFilters}
            handleLoadSavedFilters={handleLoadSavedFilters}
            formatRevenueInMillions={formatRevenueInMillions}
          />

          {/* Right Side - Data View (70%) */}
          <div className="flex-1 bg-background overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 pb-[3px]">
                <SummaryCards
                filteredAccountsCount={filteredData.filteredAccounts.length}
                totalAccountsCount={accounts.length}
                filteredCentersCount={filteredData.filteredCenters.length}
                totalCentersCount={centers.length}
                filteredProspectsCount={filteredData.filteredProspects.length}
                totalProspectsCount={prospects.length}
              />

              {/* Data Tables */}
              <Tabs defaultValue="accounts" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="accounts">Accounts ({filteredData.filteredAccounts.length})</TabsTrigger>
                  <TabsTrigger value="centers">Centers ({filteredData.filteredCenters.length})</TabsTrigger>
                  <TabsTrigger value="prospects">Prospects ({filteredData.filteredProspects.length})</TabsTrigger>
                </TabsList>

                <AccountsTab
                  accounts={filteredData.filteredAccounts}
                  centers={filteredData.filteredCenters}
                  prospects={filteredData.filteredProspects}
                  services={filteredData.filteredServices}
                  functions={functions}
                  accountChartData={accountChartData}
                  accountsView={accountsView}
                  setAccountsView={setAccountsView}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                />

                <CentersTab
                  centers={filteredData.filteredCenters}
                  functions={functions}
                  services={filteredData.filteredServices}
                  centerChartData={centerChartData}
                  centersView={centersView}
                  setCentersView={setCentersView}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                />

                <ProspectsTab
                  prospects={filteredData.filteredProspects}
                  prospectChartData={prospectChartData}
                  prospectsView={prospectsView}
                  setProspectsView={setProspectsView}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                />
              </Tabs>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardContent
