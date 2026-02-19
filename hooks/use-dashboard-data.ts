import { useCallback, useEffect, useState } from "react"
import { getAllData, testConnection, getDatabaseStatus, clearCache } from "@/app/actions"
import { captureEvent } from "@/lib/analytics/client"
import { ANALYTICS_EVENTS } from "@/lib/analytics/events"
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

export function useDashboardData({ enabled }: UseDashboardDataOptions) {
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
    const startedAt = Date.now()
    try {
      setLoading(true)
      setError(null)
      setConnectionStatus("Checking database configuration...")

      const status = await checkDatabaseStatus()
      if (status && !status.hasUrl) {
        setError("Database URL not configured. Please check environment variables.")
        setConnectionStatus("Database URL missing")
        captureEvent(ANALYTICS_EVENTS.DATA_LOAD_FAILED, {
          failure_reason: "database_url_missing",
          duration_ms: Date.now() - startedAt,
        })
        return
      }

      if (status && !status.hasConnection) {
        setError("Database connection could not be initialized.")
        setConnectionStatus("Connection initialization failed")
        captureEvent(ANALYTICS_EVENTS.DATA_LOAD_FAILED, {
          failure_reason: "connection_initialization_failed",
          duration_ms: Date.now() - startedAt,
        })
        return
      }

      setConnectionStatus("Testing database connection...")
      const connectionOk = await testDatabaseConnection()
      if (!connectionOk) {
        setError("Database connection test failed. Please check your database configuration.")
        captureEvent(ANALYTICS_EVENTS.DATA_LOAD_FAILED, {
          failure_reason: "connection_test_failed",
          duration_ms: Date.now() - startedAt,
        })
        return
      }

      setConnectionStatus("Loading data from database...")
      const data = await getAllData() as AllDataResult

      if (data.error) {
        setError(`Database error: ${data.error}`)
        setConnectionStatus("Data loading failed")
        captureEvent(ANALYTICS_EVENTS.DATA_LOAD_FAILED, {
          failure_reason: "database_error",
          error_message: data.error,
          duration_ms: Date.now() - startedAt,
        })
        return
      }

      const accountsData = Array.isArray(data.accounts) ? data.accounts : []
      const centersData = Array.isArray(data.centers) ? data.centers : []
      const functionsData = Array.isArray(data.functions) ? data.functions : []
      const servicesData = Array.isArray(data.services) ? data.services : []
      const techData = Array.isArray(data.tech) ? data.tech : []
      const prospectsData = Array.isArray(data.prospects) ? data.prospects : []

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
        captureEvent(ANALYTICS_EVENTS.DATA_LOAD_FAILED, {
          failure_reason: "no_data_available",
          duration_ms: Date.now() - startedAt,
        })
        return
      }

      setAccounts(accountsData as Account[])
      setCenters(centersData as Center[])
      setFunctions(functionsData as Function[])
      setServices(servicesData as Service[])
      setTech(techData as Tech[])
      setProspects(prospectsData as Prospect[])

      setConnectionStatus(
        `Successfully loaded: ${accountsData.length} accounts, ${centersData.length} centers, ${functionsData.length} functions, ${servicesData.length} services, ${techData.length} tech, ${prospectsData.length} prospects`
      )
      captureEvent(ANALYTICS_EVENTS.DATA_LOAD_SUCCEEDED, {
        accounts_count: accountsData.length,
        centers_count: centersData.length,
        functions_count: functionsData.length,
        services_count: servicesData.length,
        tech_count: techData.length,
        prospects_count: prospectsData.length,
        duration_ms: Date.now() - startedAt,
      })
    } catch (err) {
      console.error("Error loading data:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load data from database"
      setError(errorMessage)
      setConnectionStatus("Database connection failed")
      captureEvent(ANALYTICS_EVENTS.DATA_LOAD_FAILED, {
        failure_reason: "load_data_exception",
        error_message: errorMessage,
        duration_ms: Date.now() - startedAt,
      })
    } finally {
      setLoading(false)
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
