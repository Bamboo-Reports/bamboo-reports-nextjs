import { useState, useEffect } from "react"
import { getAllData, testConnection, getDatabaseStatus, clearCache } from "@/app/actions"
import { parseRevenue } from "@/lib/utils/helpers"
import type { Account, Center, Function, Service, Tech, Filters } from "@/lib/types"

interface UseDataLoaderReturn {
  accounts: Account[]
  centers: Center[]
  functions: Function[]
  services: Service[]
  tech: Tech[]
  loading: boolean
  error: string | null
  connectionStatus: string
  dbStatus: any
  revenueRange: { min: number; max: number }
  setRevenueRange: (range: { min: number; max: number }) => void
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  setPendingFilters: React.Dispatch<React.SetStateAction<Filters>>
  loadData: () => Promise<void>
  handleClearCache: () => Promise<void>
}

export function useDataLoader(
  setFilters: React.Dispatch<React.SetStateAction<Filters>>,
  setPendingFilters: React.Dispatch<React.SetStateAction<Filters>>
): UseDataLoaderReturn {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [functions, setFunctions] = useState<Function[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [tech, setTech] = useState<Tech[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string>("")
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [revenueRange, setRevenueRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000000 })

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
      const techData = Array.isArray(data.tech) ? data.tech : []

      if (
        accountsData.length === 0 &&
        centersData.length === 0 &&
        functionsData.length === 0 &&
        servicesData.length === 0 &&
        techData.length === 0
      ) {
        setError("No data found in database tables. Please check if your tables contain data.")
        setConnectionStatus("No data available")
        return
      }

      setAccounts(accountsData as Account[])
      setCenters(centersData as Center[])
      setFunctions(functionsData as Function[])
      setServices(servicesData as Service[])
      setTech(techData as Tech[])

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
        `Successfully loaded: ${accountsData.length} accounts, ${centersData.length} centers, ${functionsData.length} functions, ${servicesData.length} services, ${techData.length} tech`
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

  useEffect(() => {
    loadData()
  }, [])

  return {
    accounts,
    centers,
    functions,
    services,
    tech,
    loading,
    error,
    connectionStatus,
    dbStatus,
    revenueRange,
    setRevenueRange,
    setFilters,
    setPendingFilters,
    loadData,
    handleClearCache,
  }
}
