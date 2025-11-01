"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import * as XLSX from "xlsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import { MultiSelect } from "@/components/multi-select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getAllData, testConnection, getDatabaseStatus } from "./actions"
import { SavedFiltersManager } from "@/components/saved-filters-manager"
// import { UserMenu } from "@/components/user-menu"
// import { AuthWrapper } from "@/components/auth-wrapper"
// import type { User } from "./auth/actions"

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

// interface DashboardContentComponent {
//   // Removed user prop - no longer needed without auth
// }

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

  // Helper function to parse revenue values (already in millions in DB)
  const parseRevenue = (value: string | number): number => {
    const numValue = typeof value === "string" ? Number.parseFloat(value) : value
    return isNaN(numValue) ? 0 : numValue
  }

  // Helper function to format revenue for display (always in millions)
  const formatRevenueInMillions = (value: number): string => {
    return `${value.toLocaleString()}M`
  }

  // Load data from database on component mount
  useEffect(() => {
    loadData()
  }, [])

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

      // Check database status first
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

      // Test connection
      const connectionOk = await testDatabaseConnection()
      if (!connectionOk) {
        setError("Database connection test failed. Please check your database configuration.")
        return
      }

      setConnectionStatus("Loading data from database...")
      const data = await getAllData()

      // Check if there was an error in the data fetch
      if (data.error) {
        setError(`Database error: ${data.error}`)
        setConnectionStatus("Data loading failed")
        return
      }

      // Ensure data is in the correct format
      const accountsData = Array.isArray(data.accounts) ? data.accounts : []
      const centersData = Array.isArray(data.centers) ? data.centers : []
      const functionsData = Array.isArray(data.functions) ? data.functions : []
      const servicesData = Array.isArray(data.services) ? data.services : []

      // Check if we got any data
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

      // Calculate revenue range from actual data (values are already in millions)
      const revenues = accountsData
        .map((account: Account) => parseRevenue(account["ACCOUNT REVNUE"]))
        .filter((rev: number) => rev > 0)

      if (revenues.length > 0) {
        const minRevenue = Math.min(...revenues)
        const maxRevenue = Math.max(...revenues)
        setRevenueRange({ min: minRevenue, max: maxRevenue })

        // Update filters with actual range
        const newRange: [number, number] = [minRevenue, maxRevenue]
        setFilters((prev) => ({ ...prev, accountRevenueRange: newRange }))
        setPendingFilters((prev) => ({ ...prev, accountRevenueRange: newRange }))
      }

      setConnectionStatus(
        `Successfully loaded: ${accountsData.length} accounts, ${centersData.length} centers, ${functionsData.length} functions, ${servicesData.length} services`,
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

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Use ref to prevent infinite loops
  const isUpdatingOptions = useRef(false)

  // Main filtering logic - memoized to prevent unnecessary recalculations
  const filteredData = useMemo(() => {
    const arrayFilterMatch = (filterArray: string[], value: string) => {
      return filterArray.length === 0 || filterArray.includes(value)
    }

    const rangeFilterMatch = (range: [number, number], value: string | number, includeNull: boolean) => {
      const numValue = parseRevenue(value)

      // If includeNull is true and value is 0 or null/undefined, include it
      if (includeNull && (numValue === 0 || value === null || value === undefined || value === "")) {
        return true
      }

      // If includeNull is false and value is 0 or null/undefined, exclude it
      if (!includeNull && (numValue === 0 || value === null || value === undefined || value === "")) {
        return false
      }

      // Normal range check for valid values
      return numValue >= range[0] && numValue <= range[1]
    }

    // Step 1: Filter accounts first based on account filters and search
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

    // Step 2: Get account names from filtered accounts
    const filteredAccountNames = filteredAccounts.map((a) => a["ACCOUNT NAME"])

    // Step 3: Filter centers based on center filters AND account relationship
    let filteredCenters = centers.filter((center) => {
      const centerFilterMatch =
        arrayFilterMatch(filters.centerTypes, center["CENTER TYPE"]) &&
        arrayFilterMatch(filters.centerFocus, center["CENTER FOCUS"]) &&
        arrayFilterMatch(filters.centerCities, center["CENTER CITY"]) &&
        arrayFilterMatch(filters.centerStates, center["CENTER STATE"]) &&
        arrayFilterMatch(filters.centerCountries, center["CENTER COUNTRY"]) &&
        arrayFilterMatch(filters.centerEmployees, center["CENTER EMPLOYEES RANGE"]) &&
        arrayFilterMatch(filters.centerStatuses, center["CENTER STATUS"])

      // If account filters are applied, only include centers from filtered accounts
      const accountFilterMatch =
        filteredAccountNames.length === accounts.length || filteredAccountNames.includes(center["ACCOUNT NAME"])

      return centerFilterMatch && accountFilterMatch
    })

    // Step 4: Filter functions based on function filters AND center relationship
    let filteredFunctions = functions.filter((func) => {
      const functionFilterMatch = arrayFilterMatch(filters.functionTypes, func["FUNCTION"])

      // Get center keys from filtered centers
      const filteredCenterKeys = filteredCenters.map((c) => c["CN UNIQUE KEY"])
      const centerRelationMatch = filteredCenterKeys.includes(func["CN UNIQUE KEY"])

      return functionFilterMatch && centerRelationMatch
    })

    // Step 5: Cross-filter centers if function filters are applied
    if (filters.functionTypes.length > 0) {
      const centerKeysWithMatchingFunctions = filteredFunctions.map((f) => f["CN UNIQUE KEY"])
      filteredCenters = filteredCenters.filter((center) =>
        centerKeysWithMatchingFunctions.includes(center["CN UNIQUE KEY"]),
      )
    }

    // Step 6: Update functions to match final filtered centers
    const finalCenterKeys = filteredCenters.map((c) => c["CN UNIQUE KEY"])
    filteredFunctions = filteredFunctions.filter((func) => finalCenterKeys.includes(func["CN UNIQUE KEY"]))

    // Step 7: Filter services based on final center keys
    const filteredServices = services.filter((service) => finalCenterKeys.includes(service["CN UNIQUE KEY"]))

    // Step 8: Final cross-filtering - ensure accounts only include those with matching centers
    const finalAccountNames = [...new Set(filteredCenters.map((c) => c["ACCOUNT NAME"]))]
    const finalFilteredAccounts = filteredAccounts.filter((account) =>
      finalAccountNames.includes(account["ACCOUNT NAME"]),
    )

    console.log("Filtering Debug:", {
      totalAccounts: accounts.length,
      filteredAccounts: finalFilteredAccounts.length,
      totalCenters: centers.length,
      filteredCenters: filteredCenters.length,
      totalServices: services.length,
      filteredServices: filteredServices.length,
      finalCenterKeys: finalCenterKeys.length,
      revenueRange: filters.accountRevenueRange,
      accountFiltersApplied:
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
            : 0) >
        0,
      centerFiltersApplied:
        filters.centerTypes.length +
          filters.centerFocus.length +
          filters.centerCities.length +
          filters.centerStates.length +
          filters.centerCountries.length +
          filters.centerEmployees.length +
          filters.centerStatuses.length >
        0,
      functionFiltersApplied: filters.functionTypes.length > 0,
    })

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
    filters.centerTypes,
    filters.centerFocus,
    filters.centerCities,
    filters.centerStates,
    filters.centerCountries,
    filters.centerEmployees,
    filters.centerStatuses,
    filters.functionTypes,
    filters,
    revenueRange,
  ])

  // Dynamic revenue range calculation based on other filters
  const dynamicRevenueRange = useMemo(() => {
    // Create a temporary filter set excluding revenue-related filters
    const tempFilters = {
      ...filters,
      accountRevenueRange: [0, Number.MAX_SAFE_INTEGER] as [number, number],
      includeNullRevenue: true, // Include all for range calculation
    }

    const arrayFilterMatch = (filterArray: string[], value: string) => {
      return filterArray.length === 0 || filterArray.includes(value)
    }

    // Filter accounts based on non-revenue filters
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

    // Get valid revenue values from filtered accounts
    const validRevenues = tempFilteredAccounts
      .map((account) => parseRevenue(account["ACCOUNT REVNUE"]))
      .filter((rev) => rev > 0) // Only consider positive values for range calculation

    if (validRevenues.length === 0) {
      return { min: 0, max: 1000000 } // Default range if no valid revenues
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
    filters,
  ])

  // Update revenueRange when dynamicRevenueRange changes
  useEffect(() => {
    setRevenueRange(dynamicRevenueRange)

    // Update pending filters if the current range is outside the new dynamic range
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

  // Helper function to get unique values with counts - memoized
  const getUniqueValuesWithCounts = useCallback((data: any[], key: string): FilterOption[] => {
    const counts: Record<string, number> = {}
    data.forEach((item) => {
      const value = item[key]
      if (value) {
        counts[value] = (counts[value] || 0) + 1
      }
    })

    return Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
  }, [])

  // Calculate available options - memoized and optimized
  const availableOptions = useMemo((): AvailableOptions => {
    if (isUpdatingOptions.current) {
      // Return empty options during update to prevent loops
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

    // Calculate what options would be available for each filter
    const getFilteredDataForField = (excludeField: keyof Filters) => {
      const tempFilters = {
        ...filters,
        [excludeField]: excludeField === "accountRevenueRange" ? [revenueRange.min, revenueRange.max] : [],
      }

      const arrayFilterMatch = (filterArray: string[], value: string) => {
        return filterArray.length === 0 || filterArray.includes(value)
      }

      const rangeFilterMatch = (range: [number, number], value: string | number) => {
        const numValue = parseRevenue(value)
        return numValue >= range[0] && numValue <= range[1]
      }

      // Filter accounts first
      const tempAccounts = accounts.filter((account) => {
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
          rangeFilterMatch(tempFilters.accountRevenueRange as [number, number], account["ACCOUNT REVNUE"]) &&
          (tempFilters.searchTerm === "" ||
            account["ACCOUNT NAME"].toLowerCase().includes(tempFilters.searchTerm.toLowerCase()))
        )
      })

      const tempAccountNames = tempAccounts.map((a) => a["ACCOUNT NAME"])

      // Filter centers based on center filters AND account relationship
      let tempCenters = centers.filter((center) => {
        const centerFilterMatch =
          arrayFilterMatch(tempFilters.centerTypes, center["CENTER TYPE"]) &&
          arrayFilterMatch(tempFilters.centerFocus, center["CENTER FOCUS"]) &&
          arrayFilterMatch(tempFilters.centerCities, center["CENTER CITY"]) &&
          arrayFilterMatch(tempFilters.centerStates, center["CENTER STATE"]) &&
          arrayFilterMatch(tempFilters.centerCountries, center["CENTER COUNTRY"]) &&
          arrayFilterMatch(tempFilters.centerEmployees, center["CENTER EMPLOYEES RANGE"]) &&
          arrayFilterMatch(tempFilters.centerStatuses, center["CENTER STATUS"])

        const accountFilterMatch =
          tempAccountNames.length === accounts.length || tempAccountNames.includes(center["ACCOUNT NAME"])

        return centerFilterMatch && accountFilterMatch
      })

      // Filter functions
      let tempFunctions = functions.filter((func) => {
        const functionFilterMatch = arrayFilterMatch(tempFilters.functionTypes, func["FUNCTION"])
        const tempCenterKeys = tempCenters.map((c) => c["CN UNIQUE KEY"])
        const centerRelationMatch = tempCenterKeys.includes(func["CN UNIQUE KEY"])
        return functionFilterMatch && centerRelationMatch
      })

      // Cross-filter if function filters are applied
      if (tempFilters.functionTypes.length > 0) {
        const centerKeysWithFunctions = tempFunctions.map((f) => f["CN UNIQUE KEY"])
        tempCenters = tempCenters.filter((center) => centerKeysWithFunctions.includes(center["CN UNIQUE KEY"]))
      }

      const finalTempCenterKeys = tempCenters.map((c) => c["CN UNIQUE KEY"])
      tempFunctions = tempFunctions.filter((func) => finalTempCenterKeys.includes(func["CN UNIQUE KEY"]))

      // Final account filtering
      const finalTempAccountNames = [...new Set(tempCenters.map((c) => c["ACCOUNT NAME"]))]
      const finalTempAccounts = tempAccounts.filter((account) =>
        finalTempAccountNames.includes(account["ACCOUNT NAME"]),
      )

      return { accounts: finalTempAccounts, centers: tempCenters, functions: tempFunctions }
    }

    return {
      accountCountries: getUniqueValuesWithCounts(
        getFilteredDataForField("accountCountries").accounts,
        "ACCOUNT COUNTRY",
      ),
      accountRegions: getUniqueValuesWithCounts(getFilteredDataForField("accountRegions").accounts, "ACCOUNT REGION"),
      accountIndustries: getUniqueValuesWithCounts(
        getFilteredDataForField("accountIndustries").accounts,
        "ACCOUNT INDUSTRY",
      ),
      accountSubIndustries: getUniqueValuesWithCounts(
        getFilteredDataForField("accountSubIndustries").accounts,
        "ACCOUNT SUB INDUSTRY",
      ),
      accountPrimaryCategories: getUniqueValuesWithCounts(
        getFilteredDataForField("accountPrimaryCategories").accounts,
        "ACCOUNT PRIMARY CATEGORY",
      ),
      accountPrimaryNatures: getUniqueValuesWithCounts(
        getFilteredDataForField("accountPrimaryNatures").accounts,
        "ACCOUNT PRIMARY NATURE",
      ),
      accountNasscomStatuses: getUniqueValuesWithCounts(
        getFilteredDataForField("accountNasscomStatuses").accounts,
        "ACCOUNT NASSCOM STATUS",
      ),
      accountEmployeesRanges: getUniqueValuesWithCounts(
        getFilteredDataForField("accountEmployeesRanges").accounts,
        "ACCOUNT EMPLOYEES RANGE",
      ),
      accountCenterEmployees: getUniqueValuesWithCounts(
        getFilteredDataForField("accountCenterEmployees").accounts,
        "ACCOUNT CENTER EMPLOYEES",
      ),
      centerTypes: getUniqueValuesWithCounts(getFilteredDataForField("centerTypes").centers, "CENTER TYPE"),
      centerFocus: getUniqueValuesWithCounts(getFilteredDataForField("centerFocus").centers, "CENTER FOCUS"),
      centerCities: getUniqueValuesWithCounts(getFilteredDataForField("centerCities").centers, "CENTER CITY"),
      centerStates: getUniqueValuesWithCounts(getFilteredDataForField("centerStates").centers, "CENTER STATE"),
      centerCountries: getUniqueValuesWithCounts(getFilteredDataForField("centerCountries").centers, "CENTER COUNTRY"),
      centerEmployees: getUniqueValuesWithCounts(
        getFilteredDataForField("centerEmployees").centers,
        "CENTER EMPLOYEES RANGE",
      ),
      centerStatuses: getUniqueValuesWithCounts(getFilteredDataForField("centerStatuses").centers, "CENTER STATUS"),
      functionTypes: getUniqueValuesWithCounts(getFilteredDataForField("functionTypes").functions, "FUNCTION"),
    }
  }, [accounts, centers, functions, filters, getUniqueValuesWithCounts, revenueRange])

  const applyFilters = () => {
    setFilters(pendingFilters)
  }

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
      // Create a new workbook
      const wb = XLSX.utils.book_new()

      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(data)

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, sheetName)

      // Generate Excel file and trigger download
      XLSX.writeFile(wb, `${filename}.xlsx`)
    } catch (error) {
      console.error("Error exporting to Excel:", error)
    }
  }

  const exportAllData = () => {
    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new()

      // Add filtered accounts data
      const accountsWs = XLSX.utils.json_to_sheet(filteredData.filteredAccounts)
      XLSX.utils.book_append_sheet(wb, accountsWs, "Accounts")

      // Add filtered centers data
      const centersWs = XLSX.utils.json_to_sheet(filteredData.filteredCenters)
      XLSX.utils.book_append_sheet(wb, centersWs, "Centers")

      // Add filtered functions data
      const functionsWs = XLSX.utils.json_to_sheet(filteredData.filteredFunctions)
      XLSX.utils.book_append_sheet(wb, functionsWs, "Functions")

      // Add filtered services data
      const servicesWs = XLSX.utils.json_to_sheet(filteredData.filteredServices)
      XLSX.utils.book_append_sheet(wb, servicesWs, "Services")

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
      const filename = `dashboard-export-${timestamp}`

      // Generate Excel file and trigger download
      XLSX.writeFile(wb, `${filename}.xlsx`)
    } catch (error) {
      console.error("Error exporting all data to Excel:", error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Handle manual input changes for revenue range
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
            <Database className="h-12 w-12 text-blue-600 mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold mb-2">Loading Data</h2>
            <p className="text-gray-600 text-center mb-2">Fetching data from Neon database...</p>
            {connectionStatus && <p className="text-sm text-gray-500 text-center">{connectionStatus}</p>}
            {dbStatus && (
              <div className="text-xs text-gray-400 mt-2 text-center">
                <p>DB URL: {dbStatus.hasUrl ? "✓" : "✗"}</p>
                <p>Connection: {dbStatus.hasConnection ? "✓" : "✗"}</p>
                <p>Environment: {dbStatus.environment}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    const isUrlMissing = dbStatus && !dbStatus.hasUrl

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

              {isUrlMissing && (
                <div className="w-full space-y-4 text-left">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Quick Fix:</strong> You need to add your Neon database URL to Vercel's environment
                      variables.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <h3 className="font-semibold text-gray-900">Step-by-Step Setup:</h3>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                          1
                        </div>
                        <div>
                          <p className="font-medium">Go to your Vercel Dashboard</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-1 bg-transparent"
                            onClick={() => window.open("https://vercel.com/dashboard", "_blank")}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Vercel Dashboard
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                          2
                        </div>
                        <div>
                          <p className="font-medium">Select your project → Settings → Environment Variables</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                          3
                        </div>
                        <div className="w-full">
                          <p className="font-medium mb-2">Add a new environment variable:</p>
                          <div className="bg-white p-3 rounded border space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm">Name: DATABASE_URL</span>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard("DATABASE_URL")}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <div>
                              <span className="font-mono text-sm">Value: Your Neon connection string</span>
                              <p className="text-xs text-gray-500 mt-1">
                                Format: postgresql://username:password@host/database?sslmode=require
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                          4
                        </div>
                        <div>
                          <p className="font-medium">Save and redeploy your application</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Database className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Need your Neon connection string?</strong> Go to your Neon dashboard → Select your
                      database → Connection Details → Copy the connection string.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {dbStatus && (
                <div className="w-full bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Debug Information:</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Database URL:</span>
                      <span className={dbStatus.hasUrl ? "text-green-600" : "text-red-600"}>
                        {dbStatus.hasUrl ? "✓ Configured" : "✗ Missing"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connection:</span>
                      <span className={dbStatus.hasConnection ? "text-green-600" : "text-red-600"}>
                        {dbStatus.hasConnection ? "✓ Initialized" : "✗ Failed"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Environment:</span>
                      <span className="text-gray-600">{dbStatus.environment}</span>
                    </div>
                    {dbStatus.urlLength > 0 && (
                      <div className="flex justify-between">
                        <span>URL Length:</span>
                        <span className="text-gray-600">{dbStatus.urlLength} chars</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button onClick={loadData} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-between mb-4">
            <div></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Business Intelligence Dashboard</h1>
          <p className="text-gray-600">Explore accounts, centers, functions, and services data from Neon database</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Connected to Neon Database</span>
            <Button variant="ghost" size="sm" onClick={loadData} className="h-6 px-2">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          {connectionStatus && <p className="text-xs text-gray-400">{connectionStatus}</p>}
        </div>

        {dataLoaded && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{filteredData.filteredAccounts.length}</div>
                  <p className="text-xs text-gray-500">of {accounts.length} total</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Centers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{filteredData.filteredCenters.length}</div>
                  <p className="text-xs text-gray-500">of {centers.length} total</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{filteredData.filteredServices.length}</div>
                  <p className="text-xs text-gray-500">of {services.length} total</p>
                </CardContent>
              </Card>
            </div>

            {/* Smart Filtering Info */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Smart Filtering:</strong> Filter options automatically update based on your selections. Numbers
                in parentheses show how many records each option contains. All filters work together - account filters
                will properly cascade to centers, functions, and services.
              </AlertDescription>
            </Alert>

            {/* Filters Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    <CardTitle>Filters</CardTitle>
                    {getTotalActiveFilters() > 0 && <Badge variant="secondary">{getTotalActiveFilters()} active</Badge>}
                    {hasUnappliedChanges() && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        Changes pending
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <SavedFiltersManager
                      currentFilters={filters}
                      onLoadFilters={handleLoadSavedFilters}
                      totalActiveFilters={getTotalActiveFilters()}
                    />
                    <Button
                      variant="default"
                      size="sm"
                      onClick={applyFilters}
                      disabled={!hasUnappliedChanges()}
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Apply Filters {getTotalPendingFilters() > 0 && `(${getTotalPendingFilters()})`}
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Filters
                    </Button>
                    <Button variant="default" size="sm" onClick={exportAllData} className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export All Data
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <Label>Search Account Name</Label>
                  <Input
                    placeholder="Search accounts..."
                    value={pendingFilters.searchTerm}
                    onChange={(e) => setPendingFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
                  />
                </div>

                {/* Account Filters */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Account Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Countries ({availableOptions.accountCountries.length} available)</Label>
                      <MultiSelect
                        options={availableOptions.accountCountries}
                        selected={pendingFilters.accountCountries}
                        onChange={(selected) => setPendingFilters((prev) => ({ ...prev, accountCountries: selected }))}
                        placeholder="Select countries..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Regions ({availableOptions.accountRegions.length} available)</Label>
                      <MultiSelect
                        options={availableOptions.accountRegions}
                        selected={pendingFilters.accountRegions}
                        onChange={(selected) => setPendingFilters((prev) => ({ ...prev, accountRegions: selected }))}
                        placeholder="Select regions..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Industries ({availableOptions.accountIndustries.length} available)</Label>
                      <MultiSelect
                        options={availableOptions.accountIndustries}
                        selected={pendingFilters.accountIndustries}
                        onChange={(selected) => setPendingFilters((prev) => ({ ...prev, accountIndustries: selected }))}
                        placeholder="Select industries..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sub Industries ({availableOptions.accountSubIndustries.length} available)</Label>
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
                      <Label>Primary Categories ({availableOptions.accountPrimaryCategories.length} available)</Label>
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
                      <Label>Primary Nature ({availableOptions.accountPrimaryNatures.length} available)</Label>
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
                      <Label>NASSCOM Status ({availableOptions.accountNasscomStatuses.length} available)</Label>
                      <MultiSelect
                        options={availableOptions.accountNasscomStatuses}
                        selected={pendingFilters.accountNasscomStatuses}
                        onChange={(selected) =>
                          setPendingFilters((prev) => ({ ...prev, accountNasscomStatuses: selected }))
                        }
                        placeholder="Select NASSCOM status..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Employees Range ({availableOptions.accountEmployeesRanges.length} available)</Label>
                      <MultiSelect
                        options={availableOptions.accountEmployeesRanges}
                        selected={pendingFilters.accountEmployeesRanges}
                        onChange={(selected) =>
                          setPendingFilters((prev) => ({ ...prev, accountEmployeesRanges: selected }))
                        }
                        placeholder="Select employees range..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Center Employees ({availableOptions.accountCenterEmployees.length} available)</Label>
                      <MultiSelect
                        options={availableOptions.accountCenterEmployees}
                        selected={pendingFilters.accountCenterEmployees}
                        onChange={(selected) =>
                          setPendingFilters((prev) => ({ ...prev, accountCenterEmployees: selected }))
                        }
                        placeholder="Select center employees..."
                      />
                    </div>
                  </div>

                  {/* Revenue Range Slider with Input Fields */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">
                          Account Revenue Range: {formatRevenueInMillions(pendingFilters.accountRevenueRange[0])} -{" "}
                          {formatRevenueInMillions(pendingFilters.accountRevenueRange[1])}
                        </Label>
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
                          <Label htmlFor="include-null-revenue" className="text-sm text-gray-700 cursor-pointer">
                            Include accounts with null/zero revenue
                          </Label>
                        </div>
                      </div>

                      {/* Input Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="min-revenue" className="text-sm">
                            Minimum (Millions)
                          </Label>
                          <Input
                            id="min-revenue"
                            type="number"
                            value={pendingFilters.accountRevenueRange[0]}
                            onChange={(e) => handleMinRevenueChange(e.target.value)}
                            min={revenueRange.min}
                            max={pendingFilters.accountRevenueRange[1]}
                            placeholder="Min revenue"
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max-revenue" className="text-sm">
                            Maximum (Millions)
                          </Label>
                          <Input
                            id="max-revenue"
                            type="number"
                            value={pendingFilters.accountRevenueRange[1]}
                            onChange={(e) => handleMaxRevenueChange(e.target.value)}
                            min={pendingFilters.accountRevenueRange[0]}
                            max={revenueRange.max}
                            placeholder="Max revenue"
                            className="text-sm"
                          />
                        </div>
                      </div>

                      {/* Slider */}
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

                      {/* Range Display */}
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{formatRevenueInMillions(revenueRange.min)}</span>
                        <span>{formatRevenueInMillions(revenueRange.max)}</span>
                      </div>

                      <p className="text-xs text-gray-400">
                        All values are in millions. Use the slider or input fields to set your desired range. Toggle
                        above to include accounts with missing or zero revenue data.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Center Filters */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Center Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Center Types ({availableOptions.centerTypes.length} available)</Label>
                      <MultiSelect
                        options={availableOptions.centerTypes}
                        selected={pendingFilters.centerTypes}
                        onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerTypes: selected }))}
                        placeholder="Select types..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Center Focus ({availableOptions.centerFocus.length} available)</Label>
                      <MultiSelect
                        options={availableOptions.centerFocus}
                        selected={pendingFilters.centerFocus}
                        onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerFocus: selected }))}
                        placeholder="Select focus..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cities ({availableOptions.centerCities.length} available)</Label>
                      <MultiSelect
                        options={availableOptions.centerCities}
                        selected={pendingFilters.centerCities}
                        onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerCities: selected }))}
                        placeholder="Select cities..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>States ({availableOptions.centerStates.length} available)</Label>
                      <MultiSelect
                        options={availableOptions.centerStates}
                        selected={pendingFilters.centerStates}
                        onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerStates: selected }))}
                        placeholder="Select states..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Countries ({availableOptions.centerCountries.length} available)</Label>
                      <MultiSelect
                        options={availableOptions.centerCountries}
                        selected={pendingFilters.centerCountries}
                        onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerCountries: selected }))}
                        placeholder="Select countries..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Center Employees Range ({availableOptions.centerEmployees.length} available)</Label>
                      <MultiSelect
                        options={availableOptions.centerEmployees}
                        selected={pendingFilters.centerEmployees}
                        onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerEmployees: selected }))}
                        placeholder="Select employees range..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Center Status ({availableOptions.centerStatuses.length} available)</Label>
                      <MultiSelect
                        options={availableOptions.centerStatuses}
                        selected={pendingFilters.centerStatuses}
                        onChange={(selected) => setPendingFilters((prev) => ({ ...prev, centerStatuses: selected }))}
                        placeholder="Select status..."
                      />
                    </div>
                  </div>
                </div>

                {/* Function Filters */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Function Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Function Types ({availableOptions.functionTypes.length} available)</Label>
                      <MultiSelect
                        options={availableOptions.functionTypes}
                        selected={pendingFilters.functionTypes}
                        onChange={(selected) => setPendingFilters((prev) => ({ ...prev, functionTypes: selected }))}
                        placeholder="Select functions..."
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Tables */}
            <Tabs defaultValue="accounts" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="accounts">Accounts ({filteredData.filteredAccounts.length})</TabsTrigger>
                <TabsTrigger value="centers">Centers ({filteredData.filteredCenters.length})</TabsTrigger>
                <TabsTrigger value="functions">Functions ({filteredData.filteredFunctions.length})</TabsTrigger>
                <TabsTrigger value="services">Services ({filteredData.filteredServices.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="accounts">
                <Card>
                  <CardHeader>
                    <CardTitle>Accounts Data</CardTitle>
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
                              <TableRow key={index}>
                                <TableCell className="font-medium">{account["ACCOUNT NAME"]}</TableCell>
                                <TableCell>{account["ACCOUNT COUNTRY"]}</TableCell>
                                <TableCell>{account["ACCOUNT REGION"]}</TableCell>
                                <TableCell>{account["ACCOUNT INDUSTRY"]}</TableCell>
                                <TableCell>{account["ACCOUNT SUB INDUSTRY"]}</TableCell>
                                <TableCell>{account["ACCOUNT PRIMARY CATEGORY"]}</TableCell>
                                <TableCell>{account["ACCOUNT PRIMARY NATURE"]}</TableCell>
                                <TableCell>{account["ACCOUNT NASSCOM STATUS"]}</TableCell>
                                <TableCell>
                                  {formatRevenueInMillions(parseRevenue(account["ACCOUNT REVNUE"]))}
                                </TableCell>
                                <TableCell>{account["ACCOUNT REVENUE RANGE"]}</TableCell>
                                <TableCell>{account["ACCOUNT EMPLOYEES RANGE"]}</TableCell>
                                <TableCell>{account["ACCOUNT CENTER EMPLOYEES"]}</TableCell>
                              </TableRow>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {filteredData.filteredAccounts.length > 0 && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-gray-500">
                            Showing{" "}
                            {getPageInfo(currentPage, filteredData.filteredAccounts.length, itemsPerPage).startItem} to{" "}
                            {getPageInfo(currentPage, filteredData.filteredAccounts.length, itemsPerPage).endItem} of{" "}
                            {filteredData.filteredAccounts.length} results
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportToExcel(filteredData.filteredAccounts, "accounts-export", "Accounts")}
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Export Accounts
                          </Button>
                        </div>
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
                              Page {currentPage} of {getTotalPages(filteredData.filteredAccounts.length, itemsPerPage)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(prev + 1, getTotalPages(filteredData.filteredAccounts.length, itemsPerPage)),
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
                    <CardTitle>Centers Data</CardTitle>
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
                              <TableRow key={index}>
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
                            ),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {filteredData.filteredCenters.length > 0 && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-gray-500">
                            Showing{" "}
                            {getPageInfo(currentPage, filteredData.filteredCenters.length, itemsPerPage).startItem} to{" "}
                            {getPageInfo(currentPage, filteredData.filteredCenters.length, itemsPerPage).endItem} of{" "}
                            {filteredData.filteredCenters.length} results
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportToExcel(filteredData.filteredCenters, "centers-export", "Centers")}
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Export Centers
                          </Button>
                        </div>
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
                              Page {currentPage} of {getTotalPages(filteredData.filteredCenters.length, itemsPerPage)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(prev + 1, getTotalPages(filteredData.filteredCenters.length, itemsPerPage)),
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

              <TabsContent value="functions">
                <Card>
                  <CardHeader>
                    <CardTitle>Functions Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>CN Unique Key</TableHead>
                            <TableHead>Function</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getPaginatedData(filteredData.filteredFunctions, currentPage, itemsPerPage).map(
                            (func, index) => (
                              <TableRow key={index}>
                                <TableCell className="text-xs text-gray-600">{func["CN UNIQUE KEY"]}</TableCell>
                                <TableCell>{func["FUNCTION"]}</TableCell>
                              </TableRow>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {filteredData.filteredFunctions.length > 0 && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-gray-500">
                            Showing{" "}
                            {getPageInfo(currentPage, filteredData.filteredFunctions.length, itemsPerPage).startItem} to{" "}
                            {getPageInfo(currentPage, filteredData.filteredFunctions.length, itemsPerPage).endItem} of{" "}
                            {filteredData.filteredFunctions.length} results
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              exportToExcel(filteredData.filteredFunctions, "functions-export", "Functions")
                            }
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Export Functions
                          </Button>
                        </div>
                        {getTotalPages(filteredData.filteredFunctions.length, itemsPerPage) > 1 && (
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
                              Page {currentPage} of {getTotalPages(filteredData.filteredFunctions.length, itemsPerPage)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(
                                    prev + 1,
                                    getTotalPages(filteredData.filteredFunctions.length, itemsPerPage),
                                  ),
                                )
                              }
                              disabled={
                                currentPage === getTotalPages(filteredData.filteredFunctions.length, itemsPerPage)
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
                    <CardTitle>Services Data</CardTitle>
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
                              <TableRow key={index}>
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
                            ),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {filteredData.filteredServices.length > 0 && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-gray-500">
                            Showing{" "}
                            {getPageInfo(currentPage, filteredData.filteredServices.length, itemsPerPage).startItem} to{" "}
                            {getPageInfo(currentPage, filteredData.filteredServices.length, itemsPerPage).endItem} of{" "}
                            {filteredData.filteredServices.length} results
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportToExcel(filteredData.filteredServices, "services-export", "Services")}
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Export Services
                          </Button>
                        </div>
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
                              Page {currentPage} of {getTotalPages(filteredData.filteredServices.length, itemsPerPage)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(prev + 1, getTotalPages(filteredData.filteredServices.length, itemsPerPage)),
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
  )
}

export default DashboardContent
