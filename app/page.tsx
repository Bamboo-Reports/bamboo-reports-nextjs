"use client"

import { useState, useCallback, useMemo, useRef, useEffect, memo } from "react"
import * as XLSX from "xlsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  RotateCcw,
  Download,
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  TrendingUp,
  Building2,
  MapPin,
  Users,
  Filter as FilterIcon,
} from "lucide-react"
import { MultiSelect } from "@/components/multi-select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getAllData, testConnection, getDatabaseStatus, clearCache } from "./actions"
import { SavedFiltersManager } from "@/components/saved-filters-manager"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { cn } from "@/lib/utils"

// Keep all existing interfaces
interface Account {
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

interface Center {
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

interface Function {
  "CN UNIQUE KEY": string
  FUNCTION: string
}

interface Service {
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

interface Filters {
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
  searchTerm: string
}

interface FilterOption {
  value: string
  count: number
  disabled?: boolean
}

interface AvailableOptions {
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
}

// Memoized table row components
const AccountRow = memo(({ account }: { account: Account }) => (
  <TableRow>
    <TableCell className="font-medium">{account["ACCOUNT NAME"]}</TableCell>
    <TableCell>{account["ACCOUNT COUNTRY"]}</TableCell>
    <TableCell>{account["ACCOUNT REGION"]}</TableCell>
    <TableCell>{account["ACCOUNT INDUSTRY"]}</TableCell>
    <TableCell>{account["ACCOUNT SUB INDUSTRY"]}</TableCell>
    <TableCell>{account["ACCOUNT PRIMARY CATEGORY"]}</TableCell>
    <TableCell>{account["ACCOUNT PRIMARY NATURE"]}</TableCell>
    <TableCell>{account["ACCOUNT NASSCOM STATUS"]}</TableCell>
    <TableCell>{formatRevenueInMillions(parseRevenue(account["ACCOUNT REVNUE"]))}</TableCell>
    <TableCell>{account["ACCOUNT REVENUE RANGE"]}</TableCell>
    <TableCell>{account["ACCOUNT EMPLOYEES RANGE"]}</TableCell>
    <TableCell>{account["ACCOUNT CENTER EMPLOYEES"]}</TableCell>
  </TableRow>
))
AccountRow.displayName = "AccountRow"

const CenterRow = memo(({ center }: { center: Center }) => (
  <TableRow>
    <TableCell className="font-medium">{center["CENTER NAME"]}</TableCell>
    <TableCell className="text-xs text-gray-600">{center["CN UNIQUE KEY"]}</TableCell>
    <TableCell>{center["ACCOUNT NAME"]}</TableCell>
    <TableCell>{center["CENTER TYPE"]}</TableCell>
    <TableCell>{center["CENTER CITY"]}</TableCell>
    <TableCell>{center["CENTER STATE"]}</TableCell>
    <TableCell>{center["CENTER COUNTRY"]}</TableCell>
    <TableCell>{center["CENTER STATUS"]}</TableCell>
    <TableCell>{center["CENTER EMPLOYEES"]}</TableCell>
    <TableCell>{center["CENTER EMPLOYEES RANGE"]}</TableCell>
  </TableRow>
))
CenterRow.displayName = "CenterRow"

const ServiceRow = memo(({ service }: { service: Service }) => (
  <TableRow>
    <TableCell className="text-xs text-gray-600">{service["CN UNIQUE KEY"]}</TableCell>
    <TableCell>{service["CENTER NAME"]}</TableCell>
    <TableCell>{service["PRIMARY SERVICE"]}</TableCell>
    <TableCell>{service["FOCUS REGION"]}</TableCell>
    <TableCell>{service.IT}</TableCell>
    <TableCell>{service["ER&D"]}</TableCell>
    <TableCell>{service.FnA}</TableCell>
    <TableCell>{service.HR}</TableCell>
    <TableCell>{service.PROCUREMENT}</TableCell>
    <TableCell>{service["SALES & MARKETING"]}</TableCell>
    <TableCell>{service["CUSTOMER SUPPORT"]}</TableCell>
    <TableCell>{service.OTHERS}</TableCell>
    <TableCell>{service["SOFTWARE VENDOR"]}</TableCell>
    <TableCell>{service["SOFTWARE IN USE"]}</TableCell>
  </TableRow>
))
ServiceRow.displayName = "ServiceRow"

// Helper functions
const parseRevenue = (value: string | number): number => {
  const numValue = typeof value === "string" ? Number.parseFloat(value) : value
  return isNaN(numValue) ? 0 : numValue
}

const formatRevenueInMillions = (value: number): string => {
  return `${value.toLocaleString()}M`
}

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function DashboardContent() {
  // All state declarations from original file
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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

  // Main filtering logic
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

  // Calculate available options
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

  const getPaginatedData = (data: any[], page: number, itemsPerPage: number) => {
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }

  const getTotalPages = (totalItems: number, itemsPerPage: number) => {
    return Math.ceil(totalItems / itemsPerPage)
  }

  const getPageInfo = (currentPage: number, totalItems: number, itemsPerPage: number) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)
    return { startItem, endItem, totalItems }
  }

  const exportToExcel = (data: any[], filename: string, sheetName: string) => {
    try {
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(data)
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
      XLSX.writeFile(wb, `${filename}.xlsx`)
    } catch (error) {
      console.error("Error exporting to Excel:", error)
    }
  }

  const exportAllData = () => {
    try {
      const wb = XLSX.utils.book_new()

      const accountsWs = XLSX.utils.json_to_sheet(filteredData.filteredAccounts)
      XLSX.utils.book_append_sheet(wb, accountsWs, "Accounts")

      const centersWs = XLSX.utils.json_to_sheet(filteredData.filteredCenters)
      XLSX.utils.book_append_sheet(wb, centersWs, "Centers")

      const servicesWs = XLSX.utils.json_to_sheet(filteredData.filteredServices)
      XLSX.utils.book_append_sheet(wb, servicesWs, "Services")

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
      const filename = `dashboard-export-${timestamp}`

      XLSX.writeFile(wb, `${filename}.xlsx`)
    } catch (error) {
      console.error("Error exporting all data to Excel:", error)
    }
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
    !loading && accounts.length > 0 && centers.length > 0 && functions.length > 0 && services.length > 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 text-blue-600 mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Loading Data</h2>
            <p className="text-gray-600 text-center mb-2">Fetching data from Neon database...</p>
            {connectionStatus && <p className="text-sm text-gray-500 text-center">{connectionStatus}</p>}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <AlertCircle className="h-16 w-16 text-red-600" />
              <div>
                <h2 className="text-2xl font-semibold mb-2 text-red-600">Database Configuration Error</h2>
                <p className="text-gray-600 mb-4">{error}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={loadData} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry Connection
                </Button>
                <Button onClick={handleClearCache} variant="outline" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Clear Cache
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar defaultCollapsed={false}>
        <div className="space-y-4">
          {/* Header with Actions */}
          <div className="flex items-center justify-between pb-4 border-b">
            <SavedFiltersManager
              currentFilters={filters}
              onLoadFilters={handleLoadSavedFilters}
              totalActiveFilters={getTotalActiveFilters()}
            />
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Search Account Name</Label>
            <Input placeholder="Search accounts..." value={searchInput} onChange={handleSearchChange} />
            {searchInput !== pendingFilters.searchTerm && (
              <p className="text-xs text-gray-500">Typing... (search will apply in 500ms)</p>
            )}
          </div>

          {/* Filters Accordion */}
          <Accordion type="multiple" defaultValue={["accounts", "centers"]} className="w-full">
            {/* Account Filters */}
            <AccordionItem value="accounts" className="border rounded-lg px-4 mb-2">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">Account Filters</span>
                  {(filters.accountCountries.length +
                    filters.accountRegions.length +
                    filters.accountIndustries.length +
                    filters.accountSubIndustries.length +
                    filters.accountPrimaryCategories.length +
                    filters.accountPrimaryNatures.length +
                    filters.accountNasscomStatuses.length +
                    filters.accountEmployeesRanges.length +
                    filters.accountCenterEmployees.length) >
                    0 && (
                    <Badge variant="secondary" className="ml-2">
                      {filters.accountCountries.length +
                        filters.accountRegions.length +
                        filters.accountIndustries.length +
                        filters.accountSubIndustries.length +
                        filters.accountPrimaryCategories.length +
                        filters.accountPrimaryNatures.length +
                        filters.accountNasscomStatuses.length +
                        filters.accountEmployeesRanges.length +
                        filters.accountCenterEmployees.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Countries ({availableOptions.accountCountries.length})</Label>
                    <MultiSelect
                      options={availableOptions.accountCountries}
                      selected={pendingFilters.accountCountries}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, accountCountries: selected }))}
                      placeholder="Select countries..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Regions ({availableOptions.accountRegions.length})</Label>
                    <MultiSelect
                      options={availableOptions.accountRegions}
                      selected={pendingFilters.accountRegions}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, accountRegions: selected }))}
                      placeholder="Select regions..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Industries ({availableOptions.accountIndustries.length})</Label>
                    <MultiSelect
                      options={availableOptions.accountIndustries}
                      selected={pendingFilters.accountIndustries}
                      onChange={(selected) =>
                        setPendingFilters((prev) => ({ ...prev, accountIndustries: selected }))
                      }
                      placeholder="Select industries..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Sub Industries ({availableOptions.accountSubIndustries.length})</Label>
                    <MultiSelect
                      options={availableOptions.accountSubIndustries}
                      selected={pendingFilters.accountSubIndustries}
                      onChange={(selected) =>
                        setPendingFilters((prev) => ({ ...prev, accountSubIndustries: selected }))
                      }
                      placeholder="Select sub industries..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Primary Categories ({availableOptions.accountPrimaryCategories.length})</Label>
                    <MultiSelect
                      options={availableOptions.accountPrimaryCategories}
                      selected={pendingFilters.accountPrimaryCategories}
                      onChange={(selected) =>
                        setPendingFilters((prev) => ({ ...prev, accountPrimaryCategories: selected }))
                      }
                      placeholder="Select categories..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Primary Nature ({availableOptions.accountPrimaryNatures.length})</Label>
                    <MultiSelect
                      options={availableOptions.accountPrimaryNatures}
                      selected={pendingFilters.accountPrimaryNatures}
                      onChange={(selected) =>
                        setPendingFilters((prev) => ({ ...prev, accountPrimaryNatures: selected }))
                      }
                      placeholder="Select nature..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">NASSCOM Status ({availableOptions.accountNasscomStatuses.length})</Label>
                    <MultiSelect
                      options={availableOptions.accountNasscomStatuses}
                      selected={pendingFilters.accountNasscomStatuses}
                      onChange={(selected) =>
                        setPendingFilters((prev) => ({ ...prev, accountNasscomStatuses: selected }))
                      }
                      placeholder="Select status..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Employees Range ({availableOptions.accountEmployeesRanges.length})</Label>
                    <MultiSelect
                      options={availableOptions.accountEmployeesRanges}
                      selected={pendingFilters.accountEmployeesRanges}
                      onChange={(selected) =>
                        setPendingFilters((prev) => ({ ...prev, accountEmployeesRanges: selected }))
                      }
                      placeholder="Select range..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Center Employees ({availableOptions.accountCenterEmployees.length})</Label>
                    <MultiSelect
                      options={availableOptions.accountCenterEmployees}
                      selected={pendingFilters.accountCenterEmployees}
                      onChange={(selected) =>
                        setPendingFilters((prev) => ({ ...prev, accountCenterEmployees: selected }))
                      }
                      placeholder="Select employees..."
                    />
                  </div>

                  {/* Revenue Range */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          Revenue Range: {formatRevenueInMillions(pendingFilters.accountRevenueRange[0])} -{" "}
                          {formatRevenueInMillions(pendingFilters.accountRevenueRange[1])}
                        </Label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="min-revenue" className="text-xs">
                            Min (Millions)
                          </Label>
                          <Input
                            id="min-revenue"
                            type="number"
                            value={pendingFilters.accountRevenueRange[0]}
                            onChange={(e) => handleMinRevenueChange(e.target.value)}
                            min={revenueRange.min}
                            max={pendingFilters.accountRevenueRange[1]}
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max-revenue" className="text-xs">
                            Max (Millions)
                          </Label>
                          <Input
                            id="max-revenue"
                            type="number"
                            value={pendingFilters.accountRevenueRange[1]}
                            onChange={(e) => handleMaxRevenueChange(e.target.value)}
                            min={pendingFilters.accountRevenueRange[0]}
                            max={revenueRange.max}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="px-3 py-2">
                        <Slider
                          value={pendingFilters.accountRevenueRange}
                          onValueChange={(value) =>
                            setPendingFilters((prev) => ({
                              ...prev,
                              accountRevenueRange: value as [number, number],
                            }))
                          }
                          min={revenueRange.min}
                          max={revenueRange.max}
                          step={Math.max(1, Math.floor((revenueRange.max - revenueRange.min) / 1000))}
                          className="w-full"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="include-null-revenue"
                          checked={pendingFilters.includeNullRevenue || false}
                          onChange={(e) =>
                            setPendingFilters((prev) => ({
                              ...prev,
                              includeNullRevenue: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Label htmlFor="include-null-revenue" className="text-xs text-gray-700 cursor-pointer">
                          Include accounts with null/zero revenue
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Center Filters with Nested Functions */}
            <AccordionItem value="centers" className="border rounded-lg px-4 mb-2">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">Center Filters</span>
                  {(filters.centerTypes.length +
                    filters.centerFocus.length +
                    filters.centerCities.length +
                    filters.centerStates.length +
                    filters.centerCountries.length +
                    filters.centerEmployees.length +
                    filters.centerStatuses.length +
                    filters.functionTypes.length) >
                    0 && (
                    <Badge variant="secondary" className="ml-2">
                      {filters.centerTypes.length +
                        filters.centerFocus.length +
                        filters.centerCities.length +
                        filters.centerStates.length +
                        filters.centerCountries.length +
                        filters.centerEmployees.length +
                        filters.centerStatuses.length +
                        filters.functionTypes.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Center Types ({availableOptions.centerTypes.length})</Label>
                    <MultiSelect
                      options={availableOptions.centerTypes}
                      selected={pendingFilters.centerTypes}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerTypes: selected }))}
                      placeholder="Select types..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Center Focus ({availableOptions.centerFocus.length})</Label>
                    <MultiSelect
                      options={availableOptions.centerFocus}
                      selected={pendingFilters.centerFocus}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerFocus: selected }))}
                      placeholder="Select focus..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Cities ({availableOptions.centerCities.length})</Label>
                    <MultiSelect
                      options={availableOptions.centerCities}
                      selected={pendingFilters.centerCities}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerCities: selected }))}
                      placeholder="Select cities..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">States ({availableOptions.centerStates.length})</Label>
                    <MultiSelect
                      options={availableOptions.centerStates}
                      selected={pendingFilters.centerStates}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerStates: selected }))}
                      placeholder="Select states..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Countries ({availableOptions.centerCountries.length})</Label>
                    <MultiSelect
                      options={availableOptions.centerCountries}
                      selected={pendingFilters.centerCountries}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerCountries: selected }))}
                      placeholder="Select countries..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Employees Range ({availableOptions.centerEmployees.length})</Label>
                    <MultiSelect
                      options={availableOptions.centerEmployees}
                      selected={pendingFilters.centerEmployees}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerEmployees: selected }))}
                      placeholder="Select range..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Center Status ({availableOptions.centerStatuses.length})</Label>
                    <MultiSelect
                      options={availableOptions.centerStatuses}
                      selected={pendingFilters.centerStatuses}
                      onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerStatuses: selected }))}
                      placeholder="Select status..."
                    />
                  </div>

                  {/* Nested Functions Filter */}
                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        Function Types ({availableOptions.functionTypes.length})
                      </Label>
                      <MultiSelect
                        options={availableOptions.functionTypes}
                        selected={pendingFilters.functionTypes}
                        onChange={(selected) => setPendingFilters((prev) => ({ ...prev, functionTypes: selected }))}
                        placeholder="Select functions..."
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Filter Actions */}
          <div className="flex flex-col gap-2 pt-4 border-t">
            <Button
              onClick={applyFilters}
              disabled={!hasUnappliedChanges() || isApplying}
              className="w-full flex items-center justify-center gap-2"
            >
              {isApplying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <FilterIcon className="h-4 w-4" />
                  Apply Filters {getTotalPendingFilters() > 0 && `(${getTotalPendingFilters()})`}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={resetFilters} className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All Filters
            </Button>
          </div>
        </div>
      </CollapsibleSidebar>

      {/* Main Content Area */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "ml-0" : "ml-[30%] min-[1280px]:ml-[320px] max-[1920px]:ml-[480px]"
        )}
      >
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Business Intelligence Dashboard</h1>
                <p className="text-gray-600 mt-1">Enterprise data analytics platform</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={loadData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearCache}>
                  <Database className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
                <Button size="sm" onClick={exportAllData} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export All
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">{connectionStatus || "Connected to Neon Database"}</span>
            </div>
          </div>

          {dataLoaded && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Accounts</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {filteredData.filteredAccounts.length.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">of {accounts.length.toLocaleString()} total</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Centers</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {filteredData.filteredCenters.length.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">of {centers.length.toLocaleString()} total</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Services</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {filteredData.filteredServices.length.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">of {services.length.toLocaleString()} total</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Data Tables */}
              <Tabs defaultValue="accounts" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 h-auto">
                  <TabsTrigger value="accounts" className="data-[state=active]:bg-blue-50">
                    <Building2 className="h-4 w-4 mr-2" />
                    Accounts ({filteredData.filteredAccounts.length})
                  </TabsTrigger>
                  <TabsTrigger value="centers" className="data-[state=active]:bg-green-50">
                    <MapPin className="h-4 w-4 mr-2" />
                    Centers ({filteredData.filteredCenters.length})
                  </TabsTrigger>
                  <TabsTrigger value="services" className="data-[state=active]:bg-purple-50">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Services ({filteredData.filteredServices.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="accounts">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Accounts Data</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            exportToExcel(filteredData.filteredAccounts, "accounts-export", "Accounts")
                          }
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Account Name</TableHead>
                              <TableHead>Country</TableHead>
                              <TableHead>Region</TableHead>
                              <TableHead>Industry</TableHead>
                              <TableHead>Sub Industry</TableHead>
                              <TableHead>Primary Category</TableHead>
                              <TableHead>Primary Nature</TableHead>
                              <TableHead>NASSCOM Status</TableHead>
                              <TableHead>Revenue</TableHead>
                              <TableHead>Revenue Range</TableHead>
                              <TableHead>Employees Range</TableHead>
                              <TableHead>Center Employees</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getPaginatedData(filteredData.filteredAccounts, currentPage, itemsPerPage).map(
                              (account, index) => (
                                <AccountRow key={`${account["ACCOUNT NAME"]}-${index}`} account={account} />
                              )
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      {filteredData.filteredAccounts.length > 0 && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-sm text-gray-500">
                            Showing{" "}
                            {getPageInfo(currentPage, filteredData.filteredAccounts.length, itemsPerPage).startItem} to{" "}
                            {getPageInfo(currentPage, filteredData.filteredAccounts.length, itemsPerPage).endItem} of{" "}
                            {filteredData.filteredAccounts.length} results
                          </p>
                          {getTotalPages(filteredData.filteredAccounts.length, itemsPerPage) > 1 && (
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                              >
                                Previous
                              </Button>
                              <span className="text-sm text-gray-600">
                                Page {currentPage} of{" "}
                                {getTotalPages(filteredData.filteredAccounts.length, itemsPerPage)}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setCurrentPage((prev) =>
                                    Math.min(
                                      prev + 1,
                                      getTotalPages(filteredData.filteredAccounts.length, itemsPerPage)
                                    )
                                  )
                                }
                                disabled={
                                  currentPage === getTotalPages(filteredData.filteredAccounts.length, itemsPerPage)
                                }
                              >
                                Next
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="centers">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Centers Data</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportToExcel(filteredData.filteredCenters, "centers-export", "Centers")}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Center Name</TableHead>
                              <TableHead>CN Unique Key</TableHead>
                              <TableHead>Account Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>City</TableHead>
                              <TableHead>State</TableHead>
                              <TableHead>Country</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Employees</TableHead>
                              <TableHead>Employees Range</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getPaginatedData(filteredData.filteredCenters, currentPage, itemsPerPage).map(
                              (center, index) => (
                                <CenterRow key={`${center["CN UNIQUE KEY"]}-${index}`} center={center} />
                              )
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      {filteredData.filteredCenters.length > 0 && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-sm text-gray-500">
                            Showing{" "}
                            {getPageInfo(currentPage, filteredData.filteredCenters.length, itemsPerPage).startItem} to{" "}
                            {getPageInfo(currentPage, filteredData.filteredCenters.length, itemsPerPage).endItem} of{" "}
                            {filteredData.filteredCenters.length} results
                          </p>
                          {getTotalPages(filteredData.filteredCenters.length, itemsPerPage) > 1 && (
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                              >
                                Previous
                              </Button>
                              <span className="text-sm text-gray-600">
                                Page {currentPage} of{" "}
                                {getTotalPages(filteredData.filteredCenters.length, itemsPerPage)}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setCurrentPage((prev) =>
                                    Math.min(prev + 1, getTotalPages(filteredData.filteredCenters.length, itemsPerPage))
                                  )
                                }
                                disabled={
                                  currentPage === getTotalPages(filteredData.filteredCenters.length, itemsPerPage)
                                }
                              >
                                Next
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="services">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Services Data</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportToExcel(filteredData.filteredServices, "services-export", "Services")}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>CN Unique Key</TableHead>
                              <TableHead>Center Name</TableHead>
                              <TableHead>Primary Service</TableHead>
                              <TableHead>Focus Region</TableHead>
                              <TableHead>IT</TableHead>
                              <TableHead>ER&D</TableHead>
                              <TableHead>FnA</TableHead>
                              <TableHead>HR</TableHead>
                              <TableHead>Procurement</TableHead>
                              <TableHead>Sales & Marketing</TableHead>
                              <TableHead>Customer Support</TableHead>
                              <TableHead>Others</TableHead>
                              <TableHead>Software Vendor</TableHead>
                              <TableHead>Software In Use</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getPaginatedData(filteredData.filteredServices, currentPage, itemsPerPage).map(
                              (service, index) => (
                                <ServiceRow key={`${service["CN UNIQUE KEY"]}-${index}`} service={service} />
                              )
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      {filteredData.filteredServices.length > 0 && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-sm text-gray-500">
                            Showing{" "}
                            {getPageInfo(currentPage, filteredData.filteredServices.length, itemsPerPage).startItem} to{" "}
                            {getPageInfo(currentPage, filteredData.filteredServices.length, itemsPerPage).endItem} of{" "}
                            {filteredData.filteredServices.length} results
                          </p>
                          {getTotalPages(filteredData.filteredServices.length, itemsPerPage) > 1 && (
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                              >
                                Previous
                              </Button>
                              <span className="text-sm text-gray-600">
                                Page {currentPage} of{" "}
                                {getTotalPages(filteredData.filteredServices.length, itemsPerPage)}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setCurrentPage((prev) =>
                                    Math.min(
                                      prev + 1,
                                      getTotalPages(filteredData.filteredServices.length, itemsPerPage)
                                    )
                                  )
                                }
                                disabled={
                                  currentPage === getTotalPages(filteredData.filteredServices.length, itemsPerPage)
                                }
                              >
                                Next
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardContent
