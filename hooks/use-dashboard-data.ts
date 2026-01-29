import { useCallback, useEffect, useState } from "react"
import { getAllData, testConnection, getDatabaseStatus, clearCache } from "@/app/actions"
import type { Account, Center, Function, Service, Tech, Prospect } from "@/lib/types"

interface UseDashboardDataOptions {
  enabled: boolean
}

interface DatabaseStatus {
  hasUrl: boolean
  hasConnection: boolean
  urlLength: number
  environment: string
  cacheSize: number
  cacheKeys: string[]
  error?: string
}

interface AllDataResult {
  accounts: unknown[]
  centers: unknown[]
  functions: unknown[]
  services: unknown[]
  tech: unknown[]
  prospects: unknown[]
  error?: string
}

export type UseDashboardDataResult = {
  accounts: Account[]
  centers: Center[]
  functions: Function[]
  services: Service[]
  tech: Tech[]
  prospects: Prospect[]
  loading: boolean
  error: string | null
  connectionStatus: string
  databaseStatus: DatabaseStatus | null
  loadData: () => Promise<void>
  handleClearCache: () => Promise<void>
}

const toArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : [])

export function useDashboardData({ enabled }: UseDashboardDataOptions): UseDashboardDataResult {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [functions, setFunctions] = useState<Function[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [tech, setTech] = useState<Tech[]>([])
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string>("")
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(null)

  const setFailure = useCallback((message: string, status: string) => {
    setError(message)
    setConnectionStatus(status)
  }, [])

  const checkDatabaseStatus = useCallback(async () => {
    try {
      const status = await getDatabaseStatus()
      setDatabaseStatus(status)
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
        setFailure("Database URL not configured. Please check environment variables.", "Database URL missing")
        return
      }

      if (status && !status.hasConnection) {
        setFailure("Database connection could not be initialized.", "Connection initialization failed")
        return
      }

      setConnectionStatus("Testing database connection...")
      const connectionOk = await testDatabaseConnection()
      if (!connectionOk) {
        setFailure("Database connection test failed. Please check your database configuration.", "")
        return
      }

      setConnectionStatus("Loading data from database...")
      const data = (await getAllData()) as AllDataResult

      if (data.error) {
        setFailure(`Database error: ${data.error}`, "Data loading failed")
        return
      }

      const accountsData = toArray<Account>(data.accounts)
      const centersData = toArray<Center>(data.centers)
      const functionsData = toArray<Function>(data.functions)
      const servicesData = toArray<Service>(data.services)
      const techData = toArray<Tech>(data.tech)
      const prospectsData = toArray<Prospect>(data.prospects)

      if (
        accountsData.length === 0 &&
        centersData.length === 0 &&
        functionsData.length === 0 &&
        servicesData.length === 0 &&
        techData.length === 0 &&
        prospectsData.length === 0
      ) {
        setFailure("No data found in database tables. Please check if your tables contain data.", "No data available")
        return
      }

      setAccounts(accountsData)
      setCenters(centersData)
      setFunctions(functionsData)
      setServices(servicesData)
      setTech(techData)
      setProspects(prospectsData)

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
    }
  }, [checkDatabaseStatus, setFailure, testDatabaseConnection])

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

  useEffect(() => {
    if (!enabled) return
    loadData()
  }, [enabled, loadData])

  return {
    accounts,
    centers,
    functions,
    services,
    tech,
    prospects,
    loading,
    error,
    connectionStatus,
    databaseStatus,
    loadData,
    handleClearCache,
  }
}
