"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Database,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Users,
  Building,
  Settings,
  Briefcase,
  FileSpreadsheet,
  Save,
  FolderOpen,
} from "lucide-react"
import { MultiSelect } from "./multi-select"
import { SavedFiltersManager } from "./saved-filters-manager"
import {
  testConnection,
  loadData,
  exportToExcel,
  saveFilterSet,
  loadFilterSets,
  deleteFilterSet,
  type FilterSet,
} from "@/app/actions"

export function DashboardContent() {
  // Database connection state
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "error">("checking")
  const [dbError, setDbError] = useState<string>("")

  // Data state
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  // Filter state
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [selectedCenters, setSelectedCenters] = useState<string[]>([])
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  // Filter options
  const [accountOptions, setAccountOptions] = useState<string[]>([])
  const [centerOptions, setCenterOptions] = useState<string[]>([])
  const [functionOptions, setFunctionOptions] = useState<string[]>([])
  const [serviceOptions, setServiceOptions] = useState<string[]>([])

  // Saved filters state
  const [savedFilters, setSavedFilters] = useState<FilterSet[]>([])
  const [filterName, setFilterName] = useState("")

  // Export state
  const [exporting, setExporting] = useState(false)

  // Check database connection on mount
  useEffect(() => {
    checkDatabaseConnection()
  }, [])

  // Load saved filters on mount
  useEffect(() => {
    loadSavedFilters()
  }, [])

  const checkDatabaseConnection = async () => {
    try {
      setDbStatus("checking")
      const result = await testConnection()
      if (result.success) {
        setDbStatus("connected")
        setDbError("")
      } else {
        setDbStatus("error")
        setDbError(result.error || "Connection failed")
      }
    } catch (err) {
      setDbStatus("error")
      setDbError("Failed to test connection")
    }
  }

  const loadSavedFilters = async () => {
    try {
      const result = await loadFilterSets()
      if (result.success) {
        setSavedFilters(result.data || [])
      }
    } catch (err) {
      console.error("Failed to load saved filters:", err)
    }
  }

  const handleLoadData = async () => {
    setLoading(true)
    setError("")

    try {
      const result = await loadData({
        accounts: selectedAccounts,
        centers: selectedCenters,
        functions: selectedFunctions,
        services: selectedServices,
      })

      if (result.success) {
        setData(result.data || [])

        // Extract unique values for filter options
        const accounts = [...new Set(result.data?.map((item: any) => item.account) || [])]
        const centers = [...new Set(result.data?.map((item: any) => item.center) || [])]
        const functions = [...new Set(result.data?.map((item: any) => item.function) || [])]
        const services = [...new Set(result.data?.map((item: any) => item.service) || [])]

        setAccountOptions(accounts)
        setCenterOptions(centers)
        setFunctionOptions(functions)
        setServiceOptions(services)
      } else {
        setError(result.error || "Failed to load data")
      }
    } catch (err) {
      setError("An error occurred while loading data")
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const result = await exportToExcel(data)
      if (result.success) {
        // Create download link
        const link = document.createElement("a")
        link.href = result.downloadUrl || ""
        link.download = "business_intelligence_data.xlsx"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        setError(result.error || "Export failed")
      }
    } catch (err) {
      setError("Export failed")
    } finally {
      setExporting(false)
    }
  }

  const handleSaveFilters = async () => {
    if (!filterName.trim()) {
      setError("Please enter a name for the filter set")
      return
    }

    try {
      const result = await saveFilterSet({
        name: filterName,
        filters: {
          accounts: selectedAccounts,
          centers: selectedCenters,
          functions: selectedFunctions,
          services: selectedServices,
        },
      })

      if (result.success) {
        setFilterName("")
        loadSavedFilters()
      } else {
        setError(result.error || "Failed to save filters")
      }
    } catch (err) {
      setError("Failed to save filters")
    }
  }

  const handleLoadFilters = (filterSet: FilterSet) => {
    setSelectedAccounts(filterSet.filters.accounts || [])
    setSelectedCenters(filterSet.filters.centers || [])
    setSelectedFunctions(filterSet.filters.functions || [])
    setSelectedServices(filterSet.filters.services || [])
  }

  const handleDeleteFilters = async (id: number) => {
    try {
      const result = await deleteFilterSet(id)
      if (result.success) {
        loadSavedFilters()
      } else {
        setError(result.error || "Failed to delete filter set")
      }
    } catch (err) {
      setError("Failed to delete filter set")
    }
  }

  const clearFilters = () => {
    setSelectedAccounts([])
    setSelectedCenters([])
    setSelectedFunctions([])
    setSelectedServices([])
  }

  const filteredData = data.filter((item) => {
    return (
      (selectedAccounts.length === 0 || selectedAccounts.includes(item.account)) &&
      (selectedCenters.length === 0 || selectedCenters.includes(item.center)) &&
      (selectedFunctions.length === 0 || selectedFunctions.includes(item.function)) &&
      (selectedServices.length === 0 || selectedServices.includes(item.service))
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Business Intelligence Dashboard</h1>
                <div className="flex items-center space-x-2 mt-1">
                  {dbStatus === "connected" && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                  {dbStatus === "error" && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Connection Error
                    </Badge>
                  )}
                  {dbStatus === "checking" && (
                    <Badge variant="secondary">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Checking...
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={checkDatabaseConnection} disabled={dbStatus === "checking"}>
                <RefreshCw className={`h-4 w-4 mr-2 ${dbStatus === "checking" ? "animate-spin" : ""}`} />
                Test Connection
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Database Error Alert */}
        {dbStatus === "error" && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Database connection failed: {dbError}</AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
                <CardDescription>Filter your data by various criteria</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Account Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Accounts</label>
                  <MultiSelect
                    options={accountOptions}
                    selected={selectedAccounts}
                    onChange={setSelectedAccounts}
                    placeholder="Select accounts..."
                  />
                </div>

                {/* Center Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Centers</label>
                  <MultiSelect
                    options={centerOptions}
                    selected={selectedCenters}
                    onChange={setSelectedCenters}
                    placeholder="Select centers..."
                  />
                </div>

                {/* Function Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Functions</label>
                  <MultiSelect
                    options={functionOptions}
                    selected={selectedFunctions}
                    onChange={setSelectedFunctions}
                    placeholder="Select functions..."
                  />
                </div>

                {/* Service Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Services</label>
                  <MultiSelect
                    options={serviceOptions}
                    selected={selectedServices}
                    onChange={setSelectedServices}
                    placeholder="Select services..."
                  />
                </div>

                {/* Filter Actions */}
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Button onClick={handleLoadData} disabled={loading || dbStatus !== "connected"} className="w-full">
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Load Data
                      </>
                    )}
                  </Button>

                  <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                    Clear Filters
                  </Button>
                </div>

                {/* Save Filters */}
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Filter set name..."
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <Button
                      variant="outline"
                      onClick={handleSaveFilters}
                      disabled={!filterName.trim()}
                      className="w-full bg-transparent"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Saved Filters */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderOpen className="h-5 w-5 mr-2" />
                  Saved Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SavedFiltersManager
                  savedFilters={savedFilters}
                  onLoad={handleLoadFilters}
                  onDelete={handleDeleteFilters}
                />
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Records</p>
                      <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Building className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Unique Accounts</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Set(filteredData.map((item) => item.account)).size}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Settings className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Unique Centers</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Set(filteredData.map((item) => item.center)).size}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Briefcase className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Unique Services</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Set(filteredData.map((item) => item.service)).size}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Data View</CardTitle>
                    <CardDescription>{filteredData.length} records displayed</CardDescription>
                  </div>
                  <Button onClick={handleExport} disabled={exporting || filteredData.length === 0} variant="outline">
                    {exporting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export to Excel
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left">Account</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Center</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Function</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Service</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.slice(0, 100).map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">{item.account}</td>
                            <td className="border border-gray-300 px-4 py-2">{item.center}</td>
                            <td className="border border-gray-300 px-4 py-2">{item.function}</td>
                            <td className="border border-gray-300 px-4 py-2">{item.service}</td>
                            <td className="border border-gray-300 px-4 py-2">{item.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredData.length > 100 && (
                      <p className="text-sm text-gray-500 mt-4">
                        Showing first 100 records of {filteredData.length} total records. Use Export to Excel to
                        download all data.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No data available. Click "Load Data" to fetch records.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
