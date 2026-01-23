"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Tabs } from "@/components/ui/tabs"
import { LoadingState } from "@/components/states/loading-state"
import { ErrorState } from "@/components/states/error-state"
import { Header } from "@/components/layout/header"
import { FiltersSidebar } from "@/components/filters/filters-sidebar"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { AccountsTab, CentersTab } from "@/components/tabs"
import { ProspectsTab } from "@/components/tabs/prospects-tab"
import { formatRevenueInMillions } from "@/lib/utils/helpers"
import { exportAllData as exportAll } from "@/lib/utils/export-helpers"
import { useAuth } from "@/hooks/use-auth"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useFilters } from "@/hooks/use-filters"
import { useFilteredData } from "@/hooks/use-filtered-data"
import { useAvailableOptions } from "@/hooks/use-available-options"
import { useChartData } from "@/hooks/use-chart-data"

function DashboardContent() {
  // Auth state
  const { authReady, userId } = useAuth()

  // Data loading
  const {
    data,
    loading,
    error,
    connectionStatus,
    dbStatus,
    ranges,
    loadData,
    handleClearCache,
  } = useDashboardData(authReady, userId)

  // Filter management - single source of truth
  const filterState = useFilters(
    filters,
    setFilters,
    pendingFilters,
    setPendingFilters,
    ranges,
    data.accounts
  )

  // Filtered data computation
  const filteredData = useFilteredData(data, filters)

  // Available options for filter dropdowns
  const availableOptions = useAvailableOptions(data, filters)

  // Chart data computation
  const { accountChartData, centerChartData, prospectChartData } = useChartData(
    filteredData.filteredAccounts,
    filteredData.filteredCenters,
    filteredData.filteredFunctions,
    filteredData.filteredProspects
  )

  // UI State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [accountsView, setAccountsView] = useState<"chart" | "data">("chart")
  const [centersView, setCentersView] = useState<"chart" | "data" | "map">("chart")
  const [prospectsView, setProspectsView] = useState<"chart" | "data">("chart")
  const [activeSection, setActiveSection] = useState<"accounts" | "centers" | "prospects">("accounts")

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Extract unique account names for autocomplete
  const accountNames = useMemo(() => {
    return Array.from(
      new Set(data.accounts.map((account) => account.account_global_legal_name).filter(Boolean))
    )
  }, [data.accounts])

  // Export handler
  const handleExportAll = () => {
    exportAll(
      filteredData.filteredAccounts,
      filteredData.filteredCenters,
      filteredData.filteredFunctions,
      filteredData.filteredServices
    )
  }

  // Check if data is loaded
  const dataLoaded =
    !loading &&
    data.accounts.length > 0 &&
    data.centers.length > 0 &&
    data.services.length > 0 &&
    data.prospects.length > 0

  // Early returns for loading/error states
  if (!authReady) {
    return null
  }

  if (!userId) {
    return null
  }

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
            isApplying={filterState.isApplying}
            revenueRange={filterState.revenueRange}
            yearsInIndiaRange={ranges.yearsInIndia}
            firstCenterYearRange={ranges.firstCenterYear}
            centerIncYearRange={ranges.centerIncYear}
            accountNames={accountNames}
            setPendingFilters={filterState.setPendingFilters}
            resetFilters={filterState.resetFilters}
            handleExportAll={handleExportAll}
            handleMinRevenueChange={filterState.handleMinRevenueChange}
            handleMaxRevenueChange={filterState.handleMaxRevenueChange}
            handleRevenueRangeChange={filterState.handleRevenueRangeChange}
            handleMinYearsInIndiaChange={filterState.handleMinYearsInIndiaChange}
            handleMaxYearsInIndiaChange={filterState.handleMaxYearsInIndiaChange}
            handleYearsInIndiaRangeChange={filterState.handleYearsInIndiaRangeChange}
            handleMinFirstCenterYearChange={filterState.handleMinFirstCenterYearChange}
            handleMaxFirstCenterYearChange={filterState.handleMaxFirstCenterYearChange}
            handleFirstCenterYearRangeChange={filterState.handleFirstCenterYearRangeChange}
            handleMinCenterIncYearChange={filterState.handleMinCenterIncYearChange}
            handleMaxCenterIncYearChange={filterState.handleMaxCenterIncYearChange}
            handleCenterIncYearRangeChange={filterState.handleCenterIncYearRangeChange}
            getTotalActiveFilters={filterState.getTotalActiveFilters}
            handleLoadSavedFilters={filterState.handleLoadSavedFilters}
            formatRevenueInMillions={formatRevenueInMillions}
          />

          {/* Right Side - Data View (70%) */}
          <div className="flex-1 bg-background overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto scrollbar-gutter-stable">
              <div className="p-6 pb-3">
                <SummaryCards
                  filteredAccountsCount={filteredData.filteredAccounts.length}
                  totalAccountsCount={data.accounts.length}
                  filteredCentersCount={filteredData.filteredCenters.length}
                  totalCentersCount={data.centers.length}
                  filteredProspectsCount={filteredData.filteredProspects.length}
                  totalProspectsCount={data.prospects.length}
                  activeView={activeSection}
                  onSelect={setActiveSection}
                />

                {/* Data Tables */}
                <Tabs value={activeSection} className="space-y-4">
                  <AccountsTab
                    accounts={filteredData.filteredAccounts}
                    centers={filteredData.filteredCenters}
                    prospects={filteredData.filteredProspects}
                    services={filteredData.filteredServices}
                    tech={data.tech}
                    functions={data.functions}
                    accountChartData={accountChartData}
                    accountsView={accountsView}
                    setAccountsView={setAccountsView}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                  />

                  <CentersTab
                    centers={filteredData.filteredCenters}
                    allCenters={data.centers}
                    functions={data.functions}
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
