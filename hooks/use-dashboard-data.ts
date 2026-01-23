"use client"

import { useState, useCallback, useEffect } from "react"
import { getAllData, testConnection, getDatabaseStatus, clearCache } from "@/app/actions"
import { parseRevenue } from "@/lib/utils/helpers"
import { type RangeState, DEFAULT_RANGE_STATE } from "@/lib/constants/filters"
import type { Account, Center, Function, Service, Tech, Prospect } from "@/lib/types"

interface DataState {
  accounts: Account[]
  centers: Center[]
  functions: Function[]
  services: Service[]
  tech: Tech[]
  prospects: Prospect[]
}

interface RangeStates {
  revenue: RangeState
  yearsInIndia: RangeState
  firstCenterYear: RangeState
  centerIncYear: RangeState
}

interface UseDashboardDataReturn {
  data: DataState
  loading: boolean
  error: string | null
  connectionStatus: string
  dbStatus: Record<string, unknown> | null
  ranges: RangeStates
  loadData: () => Promise<void>
  handleClearCache: () => Promise<void>
}

function calculateRangeFromValues(values: number[]): RangeState {
  if (values.length === 0) return DEFAULT_RANGE_STATE
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  }
}

export function useDashboardData(
  authReady: boolean,
  userId: string | null
): UseDashboardDataReturn {
  const [data, setData] = useState<DataState>({
    accounts: [],
    centers: [],
    functions: [],
    services: [],
    tech: [],
    prospects: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string>("")
  const [dbStatus, setDbStatus] = useState<Record<string, unknown> | null>(null)
  const [ranges, setRanges] = useState<RangeStates>({
    revenue: DEFAULT_RANGE_STATE,
    yearsInIndia: DEFAULT_RANGE_STATE,
    firstCenterYear: DEFAULT_RANGE_STATE,
    centerIncYear: DEFAULT_RANGE_STATE,
  })

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
    console.time("dashboard loadData total")
    try {
      setLoading(true)
      setError(null)
      setConnectionStatus("Checking database configuration...")

      console.time("dashboard checkDatabaseStatus")
      const status = await checkDatabaseStatus()
      console.timeEnd("dashboard checkDatabaseStatus")
      
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

      console.time("dashboard testDatabaseConnection")
      const connectionOk = await testDatabaseConnection()
      console.timeEnd("dashboard testDatabaseConnection")
      
      if (!connectionOk) {
        setError("Database connection test failed. Please check your database configuration.")
        return
      }

      setConnectionStatus("Loading data from database...")
      console.time("dashboard getAllData")
      const result = await getAllData() as {
        accounts?: unknown[]
        centers?: unknown[]
        functions?: unknown[]
        services?: unknown[]
        tech?: unknown[]
        prospects?: unknown[]
        error?: string | null
      }
      console.timeEnd("dashboard getAllData")

      if (result.error) {
        setError(`Database error: ${result.error}`)
        setConnectionStatus("Data loading failed")
        return
      }

      const accountsData = Array.isArray(result.accounts) ? result.accounts : []
      const centersData = Array.isArray(result.centers) ? result.centers : []
      const functionsData = Array.isArray(result.functions) ? result.functions : []
      const servicesData = Array.isArray(result.services) ? result.services : []
      const techData = Array.isArray(result.tech) ? result.tech : []
      const prospectsData = Array.isArray(result.prospects) ? result.prospects : []

      if (
        accountsData.length === 0 &&
        centersData.length === 0 &&
        functionsData.length === 0 &&
        servicesData.length === 0 &&
        techData.length === 0 &&
        prospectsData.length === 0
      ) {
        setError("No data found in database tables. Please check if your tables contain data.")
        setConnectionStatus("No data available")
        return
      }

      setData({
        accounts: accountsData as Account[],
        centers: centersData as Center[],
        functions: functionsData as Function[],
        services: servicesData as Service[],
        tech: techData as Tech[],
        prospects: prospectsData as Prospect[],
      })

      // Cast data for type safety
      const typedAccounts = accountsData as Account[]
      const typedCenters = centersData as Center[]

      // Calculate revenue range
      const revenues = typedAccounts
        .map((account) => parseRevenue(account.account_hq_revenue ?? 0))
        .filter((rev) => rev > 0)
      const revenueRange = calculateRangeFromValues(revenues)

      // Calculate years in India range
      const yearsInIndiaValues = typedAccounts
        .map((account) => Number(account.years_in_india ?? 0))
        .filter((value) => value > 0)
      const yearsInIndiaRange = calculateRangeFromValues(yearsInIndiaValues)

      // Calculate first center year range
      const firstCenterYearValues = typedAccounts
        .map((account) => Number(account.account_first_center_year ?? 0))
        .filter((value) => value > 0)
      const firstCenterYearRange = calculateRangeFromValues(firstCenterYearValues)

      // Calculate center inc year range
      const centerIncYearValues = typedCenters
        .map((center) => Number(center.center_inc_year ?? 0))
        .filter((value) => value > 0)
      const centerIncYearRange = calculateRangeFromValues(centerIncYearValues)

      setRanges({
        revenue: revenueRange,
        yearsInIndia: yearsInIndiaRange,
        firstCenterYear: firstCenterYearRange,
        centerIncYear: centerIncYearRange,
      })

      setConnectionStatus(
        `Successfully loaded: ${accountsData.length} accounts, ${centersData.length} centers, ${functionsData.length} functions, ${servicesData.length} services, ${techData.length} tech, ${prospectsData.length} prospects`
      )
    } catch (err) {
      console.error("Error loading data:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load data from database"
      setError(errorMessage)
      setConnectionStatus("Database connection failed")
    } finally {
      setLoading(false)
      console.timeEnd("dashboard loadData total")
    }
  }, [checkDatabaseStatus, testDatabaseConnection])

  const handleClearCache = useCallback(async () => {
    try {
      setConnectionStatus("Clearing cache...")
      await clearCache()
      await loadData()
    } catch (err) {
      console.error("Error clearing cache:", err)
      setError("Failed to clear cache")
    }
  }, [loadData])

  // Load data when auth is ready
  useEffect(() => {
    if (!authReady || !userId) return
    loadData()
  }, [authReady, userId, loadData])

  return {
    data,
    loading,
    error,
    connectionStatus,
    dbStatus,
    ranges,
    loadData,
    handleClearCache,
  }
}
