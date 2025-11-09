"use client"

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react"
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
import { getAllData, testConnection, getDatabaseStatus, clearCache } from "./actions"
import { LoadingState } from "@/components/states/loading-state"
import { ErrorState } from "@/components/states/error-state"
import { Header } from "@/components/layout/header"
import { FiltersSidebar } from "@/components/filters/filters-sidebar"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { AccountsTab, CentersTab, ServicesTab } from "@/components/tabs"
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
  calculateChartData,
  calculateCenterChartData,
  calculateCityChartData,
  calculateFunctionChartData,
} from "@/lib/utils/chart-helpers"
import {
  exportToExcel,
  exportAllData as exportAll,
} from "@/lib/utils/export-helpers"
import type { Account, Center, Function, Service, Filters, FilterOption, AvailableOptions } from "@/lib/types"

function DashboardContent() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [functions, setFunctions] = useState<Function[]>([])
  const [services, setServices] = useState<Service[]>([])
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
    centerTypes: [],
    centerFocus: [],
    centerCities: [],
    centerStates: [],
    centerCountries: [],
    centerEmployees: [],
    centerStatuses: [],
    functionTypes: [],
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
    centerTypes: [],
    centerFocus: [],
    centerCities: [],
    centerStates: [],
    centerCountries: [],
    centerEmployees: [],
    centerStatuses: [],
    functionTypes: [],
    searchTerm: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [isApplying, setIsApplying] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const [accountsView, setAccountsView] = useState<"chart" | "data">("chart")
  const [centersView, setCentersView] = useState<"chart" | "data">("chart")

  // Load data from database on component mount
  useEffect(() => {
    loadData()
  }, [])

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setPendingFilters((prev) => ({ ...prev, searchTerm: value }))
    }, 500),
    []
  )

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    debouncedSearch(value)
  }

  const checkDatabaseStatus = async () => {
    try {
      const status = await getDatabaseStatus()
      setDbStatus(status)
      console.log("Database status:", status)
      return status
    } catch (err) {
      console.error("Failed to check database status:", err)
      return null
    }
  }

  const testDatabaseConnection = async () => {
    try {
      const result = await testConnection()
      setConnectionStatus(result.message)
      return result.success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Connection test failed"
      setConnectionStatus(errorMessage)
      return false
    }
  }

  const loadData = async () => {
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

      if (
        accountsData.length === 0 &&
        centersData.length === 0 &&
        functionsData.length === 0 &&
        servicesData.length === 0
      ) {
        setError("No data found in database tables. Please check if your tables contain data.")
        setConnectionStatus("No data available")
        return
      }

      setAccounts(accountsData as Account[])
      setCenters(centersData as Center[])
      setFunctions(functionsData as Function[])
      setServices(servicesData as Service[])

      const revenues = accountsData
        .map((account: Account) => parseRevenue(account["ACCOUNT REVNUE"]))
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
        `Successfully loaded: ${accountsData.length} accounts, ${centersData.length} centers, ${functionsData.length} functions, ${servicesData.length} services`
      )
    } catch (err) {
      console.error("Error loading data:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load data from database"
      setError(errorMessage)
      setConnectionStatus("Database connection failed")
    } finally {
      setLoading(false)
    }
  }

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

  // Main filtering logic - memoized with stable dependencies
  const filteredData = useMemo(() => {
    const arrayFilterMatch = (filterArray: string[], value: string) => {
      return filterArray.length === 0 || filterArray.includes(value)
    }

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

    const filteredAccounts = accounts.filter((account) => {
      return (
        arrayFilterMatch(filters.accountCountries, account["ACCOUNT COUNTRY"]) &&
        arrayFilterMatch(filters.accountRegions, account["ACCOUNT REGION"]) &&
        arrayFilterMatch(filters.accountIndustries, account["ACCOUNT INDUSTRY"]) &&
        arrayFilterMatch(filters.accountSubIndustries, account["ACCOUNT SUB INDUSTRY"]) &&
        arrayFilterMatch(filters.accountPrimaryCategories, account["ACCOUNT PRIMARY CATEGORY"]) &&
        arrayFilterMatch(filters.accountPrimaryNatures, account["ACCOUNT PRIMARY NATURE"]) &&
        arrayFilterMatch(filters.accountNasscomStatuses, account["ACCOUNT NASSCOM STATUS"]) &&
        arrayFilterMatch(filters.accountEmployeesRanges, account["ACCOUNT EMPLOYEES RANGE"]) &&
        arrayFilterMatch(filters.accountCenterEmployees, account["ACCOUNT CENTER EMPLOYEES"]) &&
        rangeFilterMatch(filters.accountRevenueRange, account["ACCOUNT REVNUE"], filters.includeNullRevenue) &&
        (filters.searchTerm === "" || account["ACCOUNT NAME"].toLowerCase().includes(filters.searchTerm.toLowerCase()))
      )
    })

    const filteredAccountNames = filteredAccounts.map((a) => a["ACCOUNT NAME"])

    let filteredCenters = centers.filter((center) => {
      const centerFilterMatch =
        arrayFilterMatch(filters.centerTypes, center["CENTER TYPE"]) &&
        arrayFilterMatch(filters.centerFocus, center["CENTER FOCUS"]) &&
        arrayFilterMatch(filters.centerCities, center["CENTER CITY"]) &&
        arrayFilterMatch(filters.centerStates, center["CENTER STATE"]) &&
        arrayFilterMatch(filters.centerCountries, center["CENTER COUNTRY"]) &&
        arrayFilterMatch(filters.centerEmployees, center["CENTER EMPLOYEES RANGE"]) &&
        arrayFilterMatch(filters.centerStatuses, center["CENTER STATUS"])

      const accountFilterMatch =
        filteredAccountNames.length === accounts.length || filteredAccountNames.includes(center["ACCOUNT NAME"])

      return centerFilterMatch && accountFilterMatch
    })

    let filteredFunctions = functions.filter((func) => {
      const functionFilterMatch = arrayFilterMatch(filters.functionTypes, func["FUNCTION"])
      const filteredCenterKeys = filteredCenters.map((c) => c["CN UNIQUE KEY"])
      const centerRelationMatch = filteredCenterKeys.includes(func["CN UNIQUE KEY"])

      return functionFilterMatch && centerRelationMatch
    })

    if (filters.functionTypes.length > 0) {
      const centerKeysWithMatchingFunctions = filteredFunctions.map((f) => f["CN UNIQUE KEY"])
      filteredCenters = filteredCenters.filter((center) =>
        centerKeysWithMatchingFunctions.includes(center["CN UNIQUE KEY"])
      )
    }

    const finalCenterKeys = filteredCenters.map((c) => c["CN UNIQUE KEY"])
    filteredFunctions = filteredFunctions.filter((func) => finalCenterKeys.includes(func["CN UNIQUE KEY"]))

    const filteredServices = services.filter((service) => finalCenterKeys.includes(service["CN UNIQUE KEY"]))

    const finalAccountNames = [...new Set(filteredCenters.map((c) => c["ACCOUNT NAME"]))]
    const finalFilteredAccounts = filteredAccounts.filter((account) =>
      finalAccountNames.includes(account["ACCOUNT NAME"])
    )

    return {
      filteredAccounts: finalFilteredAccounts,
      filteredCenters,
      filteredFunctions,
      filteredServices,
    }
  }, [
    accounts,
    centers,
    functions,
    services,
    filters.accountCountries,
    filters.accountRegions,
    filters.accountIndustries,
    filters.accountSubIndustries,
    filters.accountPrimaryCategories,
    filters.accountPrimaryNatures,
    filters.accountNasscomStatuses,
    filters.accountEmployeesRanges,
    filters.accountCenterEmployees,
    filters.accountRevenueRange,
    filters.includeNullRevenue,
    filters.centerTypes,
    filters.centerFocus,
    filters.centerCities,
    filters.centerStates,
    filters.centerCountries,
    filters.centerEmployees,
    filters.centerStatuses,
    filters.functionTypes,
    filters.searchTerm,
  ])

  // Calculate chart data for accounts
  const accountChartData = useMemo(() => {
    const accounts = filteredData.filteredAccounts

    return {
      regionData: calculateChartData(accounts, "ACCOUNT REGION"),
      primaryNatureData: calculateChartData(accounts, "ACCOUNT PRIMARY NATURE"),
      revenueRangeData: calculateChartData(accounts, "ACCOUNT REVENUE RANGE"),
      employeesRangeData: calculateChartData(accounts, "ACCOUNT EMPLOYEES RANGE"),
    }
  }, [filteredData.filteredAccounts])

  // Calculate chart data for centers
  const centerChartData = useMemo(() => {
    const centers = filteredData.filteredCenters
    const centerKeys = centers.map((c) => c["CN UNIQUE KEY"])

    return {
      centerTypeData: calculateCenterChartData(centers, "CENTER TYPE"),
      employeesRangeData: calculateCenterChartData(centers, "CENTER EMPLOYEES RANGE"),
      cityData: calculateCityChartData(centers),
      functionData: calculateFunctionChartData(filteredData.filteredFunctions, centerKeys),
    }
  }, [filteredData.filteredCenters, filteredData.filteredFunctions])

  // Dynamic revenue range calculation
  const dynamicRevenueRange = useMemo(() => {
    const tempFilters = {
      ...filters,
      accountRevenueRange: [0, Number.MAX_SAFE_INTEGER] as [number, number],
      includeNullRevenue: true,
    }

    const arrayFilterMatch = (filterArray: string[], value: string) => {
      return filterArray.length === 0 || filterArray.includes(value)
    }

    const tempFilteredAccounts = accounts.filter((account) => {
      return (
        arrayFilterMatch(tempFilters.accountCountries, account["ACCOUNT COUNTRY"]) &&
        arrayFilterMatch(tempFilters.accountRegions, account["ACCOUNT REGION"]) &&
        arrayFilterMatch(tempFilters.accountIndustries, account["ACCOUNT INDUSTRY"]) &&
        arrayFilterMatch(tempFilters.accountSubIndustries, account["ACCOUNT SUB INDUSTRY"]) &&
        arrayFilterMatch(tempFilters.accountPrimaryCategories, account["ACCOUNT PRIMARY CATEGORY"]) &&
        arrayFilterMatch(tempFilters.accountPrimaryNatures, account["ACCOUNT PRIMARY NATURE"]) &&
        arrayFilterMatch(tempFilters.accountNasscomStatuses, account["ACCOUNT NASSCOM STATUS"]) &&
        arrayFilterMatch(tempFilters.accountEmployeesRanges, account["ACCOUNT EMPLOYEES RANGE"]) &&
        arrayFilterMatch(tempFilters.accountCenterEmployees, account["ACCOUNT CENTER EMPLOYEES"]) &&
        (tempFilters.searchTerm === "" ||
          account["ACCOUNT NAME"].toLowerCase().includes(tempFilters.searchTerm.toLowerCase()))
      )
    })

    const validRevenues = tempFilteredAccounts
      .map((account) => parseRevenue(account["ACCOUNT REVNUE"]))
      .filter((rev) => rev > 0)

    if (validRevenues.length === 0) {
      return { min: 0, max: 1000000 }
    }

    const minRevenue = Math.min(...validRevenues)
    const maxRevenue = Math.max(...validRevenues)

    return { min: minRevenue, max: maxRevenue }
  }, [
    accounts,
    filters.accountCountries,
    filters.accountRegions,
    filters.accountIndustries,
    filters.accountSubIndustries,
    filters.accountPrimaryCategories,
    filters.accountPrimaryNatures,
    filters.accountNasscomStatuses,
    filters.accountEmployeesRanges,
    filters.accountCenterEmployees,
    filters.searchTerm,
  ])

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

  // Calculate available options - OPTIMIZED
  const availableOptions = useMemo((): AvailableOptions => {
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
      }
    }

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

    accounts.forEach((account) => {
      const matchesSearch =
        !filters.searchTerm || account["ACCOUNT NAME"].toLowerCase().includes(filters.searchTerm.toLowerCase())

      if (!matchesSearch) return

      const revenue = parseRevenue(account["ACCOUNT REVNUE"])
      const matchesRevenue = filters.includeNullRevenue
        ? true
        : revenue >= filters.accountRevenueRange[0] && revenue <= filters.accountRevenueRange[1]

      if (!matchesRevenue) return

      const country = account["ACCOUNT COUNTRY"]
      const region = account["ACCOUNT REGION"]
      const industry = account["ACCOUNT INDUSTRY"]
      const subIndustry = account["ACCOUNT SUB INDUSTRY"]
      const category = account["ACCOUNT PRIMARY CATEGORY"]
      const nature = account["ACCOUNT PRIMARY NATURE"]
      const nasscom = account["ACCOUNT NASSCOM STATUS"]
      const empRange = account["ACCOUNT EMPLOYEES RANGE"]
      const centerEmp = account["ACCOUNT CENTER EMPLOYEES"]

      const matchesCountry = filters.accountCountries.length === 0 || filters.accountCountries.includes(country)
      const matchesRegion = filters.accountRegions.length === 0 || filters.accountRegions.includes(region)
      const matchesIndustry = filters.accountIndustries.length === 0 || filters.accountIndustries.includes(industry)
      const matchesSubIndustry =
        filters.accountSubIndustries.length === 0 || filters.accountSubIndustries.includes(subIndustry)
      const matchesCategory =
        filters.accountPrimaryCategories.length === 0 || filters.accountPrimaryCategories.includes(category)
      const matchesNature =
        filters.accountPrimaryNatures.length === 0 || filters.accountPrimaryNatures.includes(nature)
      const matchesNasscom =
        filters.accountNasscomStatuses.length === 0 || filters.accountNasscomStatuses.includes(nasscom)
      const matchesEmpRange =
        filters.accountEmployeesRanges.length === 0 || filters.accountEmployeesRanges.includes(empRange)
      const matchesCenterEmp =
        filters.accountCenterEmployees.length === 0 || filters.accountCenterEmployees.includes(centerEmp)

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
        validAccountNames.add(account["ACCOUNT NAME"])
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
      if (!validAccountNames.has(center["ACCOUNT NAME"])) return

      const type = center["CENTER TYPE"]
      const focus = center["CENTER FOCUS"]
      const city = center["CENTER CITY"]
      const state = center["CENTER STATE"]
      const country = center["CENTER COUNTRY"]
      const employees = center["CENTER EMPLOYEES RANGE"]
      const status = center["CENTER STATUS"]

      const matchesType = filters.centerTypes.length === 0 || filters.centerTypes.includes(type)
      const matchesFocus = filters.centerFocus.length === 0 || filters.centerFocus.includes(focus)
      const matchesCity = filters.centerCities.length === 0 || filters.centerCities.includes(city)
      const matchesState = filters.centerStates.length === 0 || filters.centerStates.includes(state)
      const matchesCountry = filters.centerCountries.length === 0 || filters.centerCountries.includes(country)
      const matchesEmployees = filters.centerEmployees.length === 0 || filters.centerEmployees.includes(employees)
      const matchesStatus = filters.centerStatuses.length === 0 || filters.centerStatuses.includes(status)

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
        validCenterKeys.add(center["CN UNIQUE KEY"])
      }
    })

    const functionCounts = new Map<string, number>()

    functions.forEach((func) => {
      if (!validCenterKeys.has(func["CN UNIQUE KEY"])) return
      const funcType = func["FUNCTION"]
      functionCounts.set(funcType, (functionCounts.get(funcType) || 0) + 1)
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
    }
  }, [accounts, centers, functions, filters])

  const applyFilters = useCallback(() => {
    setIsApplying(true)
    setTimeout(() => {
      setFilters(pendingFilters)
      setIsApplying(false)
    }, 0)
  }, [pendingFilters])

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
      centerTypes: [],
      centerFocus: [],
      centerCities: [],
      centerStates: [],
      centerCountries: [],
      centerEmployees: [],
      centerStatuses: [],
      functionTypes: [],
      searchTerm: "",
    }
    setFilters(emptyFilters)
    setPendingFilters(emptyFilters)
    setSearchInput("")
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
      pendingFilters.centerTypes.length +
      pendingFilters.centerFocus.length +
      pendingFilters.centerCities.length +
      pendingFilters.centerStates.length +
      pendingFilters.centerCountries.length +
      pendingFilters.centerEmployees.length +
      pendingFilters.centerStatuses.length +
      pendingFilters.functionTypes.length +
      (pendingFilters.searchTerm ? 1 : 0)
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
      filters.centerTypes.length +
      filters.centerFocus.length +
      filters.centerCities.length +
      filters.centerStates.length +
      filters.centerCountries.length +
      filters.centerEmployees.length +
      filters.centerStatuses.length +
      filters.functionTypes.length +
      (filters.searchTerm ? 1 : 0)
    )
  }

  const handleLoadSavedFilters = (savedFilters: Filters) => {
    setPendingFilters(savedFilters)
    setFilters(savedFilters)
    setSearchInput(savedFilters.searchTerm)
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
    !loading && accounts.length > 0 && centers.length > 0 && services.length > 0

  if (loading) {
    return <LoadingState connectionStatus={connectionStatus} dbStatus={dbStatus} />
  }

  if (error) {
    return <ErrorState error={error} dbStatus={dbStatus} onRetry={loadData} onClearCache={handleClearCache} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header connectionStatus={connectionStatus} onRefresh={loadData} onClearCache={handleClearCache} />

      {dataLoaded && (
        <div className="flex h-[calc(100vh-88px)]">
          <FiltersSidebar
            filters={filters}
            pendingFilters={pendingFilters}
            availableOptions={availableOptions}
            searchInput={searchInput}
            isApplying={isApplying}
            revenueRange={revenueRange}
            setPendingFilters={setPendingFilters}
            applyFilters={applyFilters}
            resetFilters={resetFilters}
            handleExportAll={handleExportAll}
            handleSearchChange={handleSearchChange}
            handleMinRevenueChange={handleMinRevenueChange}
            handleMaxRevenueChange={handleMaxRevenueChange}
            getTotalActiveFilters={getTotalActiveFilters}
            getTotalPendingFilters={getTotalPendingFilters}
            hasUnappliedChanges={hasUnappliedChanges}
            handleLoadSavedFilters={handleLoadSavedFilters}
            formatRevenueInMillions={formatRevenueInMillions}
          />

          {/* Right Side - Data View (70%) */}
          <div className="flex-1 w-[70%] overflow-y-auto bg-gray-50">
            <div className="p-6">
              <SummaryCards
                filteredAccountsCount={filteredData.filteredAccounts.length}
                totalAccountsCount={accounts.length}
                filteredCentersCount={filteredData.filteredCenters.length}
                totalCentersCount={centers.length}
                filteredServicesCount={filteredData.filteredServices.length}
                totalServicesCount={services.length}
              />

              {/* Data Tables */}
              <Tabs defaultValue="accounts" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="accounts">Accounts ({filteredData.filteredAccounts.length})</TabsTrigger>
                  <TabsTrigger value="centers">Centers ({filteredData.filteredCenters.length})</TabsTrigger>
                  <TabsTrigger value="services">Services ({filteredData.filteredServices.length})</TabsTrigger>
                </TabsList>

              <AccountsTab
                filteredAccounts={filteredData.filteredAccounts}
                accountChartData={accountChartData}
                accountsView={accountsView}
                setAccountsView={setAccountsView}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
              />

              <CentersTab
                filteredCenters={filteredData.filteredCenters}
                centerChartData={centerChartData}
                centersView={centersView}
                setCentersView={setCentersView}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
              />

              <ServicesTab
                filteredServices={filteredData.filteredServices}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
              />
            </Tabs>
            </div>
          </div>
        </div>
        )}
    </div>
  )
}

export default DashboardContent
