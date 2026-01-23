"use client"

import React, { useCallback, useEffect, useState } from "react"
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
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useDashboardFilters } from "@/hooks/use-dashboard-filters"

function DashboardContent() {
  const { authReady, userId } = useAuthGuard()

  const {
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
  } = useDashboardData({ enabled: authReady && !!userId })

  const {
    filters,
    pendingFilters,
    setPendingFilters,
    isApplying,
    revenueRange,
    yearsInIndiaRange,
    firstCenterYearRange,
    centerIncYearRange,
    accountNames,
    availableOptions,
    filteredData,
    accountChartData,
    centerChartData,
    prospectChartData,
    resetFilters,
    handleLoadSavedFilters,
    handleMinRevenueChange,
    handleMaxRevenueChange,
    handleRevenueRangeChange,
    handleMinYearsInIndiaChange,
    handleMaxYearsInIndiaChange,
    handleYearsInIndiaRangeChange,
    handleMinFirstCenterYearChange,
    handleMaxFirstCenterYearChange,
    handleFirstCenterYearRangeChange,
    handleMinCenterIncYearChange,
    handleMaxCenterIncYearChange,
    handleCenterIncYearRangeChange,
    getTotalActiveFilters,
  } = useDashboardFilters({
    accounts,
    centers,
    functions,
    services,
    prospects,
    tech,
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [accountsView, setAccountsView] = useState<"chart" | "data" | "map">("map")
  const [centersView, setCentersView] = useState<"chart" | "data" | "map">("map")
  const [prospectsView, setProspectsView] = useState<"chart" | "data">("chart")
  const [activeSection, setActiveSection] = useState<"accounts" | "centers" | "prospects">("accounts")

  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handleExportAll = useCallback(() => {
    exportAll(
      filteredData.filteredAccounts,
      filteredData.filteredCenters,
      filteredData.filteredFunctions,
      filteredData.filteredServices
    )
  }, [filteredData])

  const dataLoaded =
    !loading && accounts.length > 0 && centers.length > 0 && services.length > 0 && prospects.length > 0

  if (!authReady) {
    return null
  }

  if (!userId) {
    return null
  }

  if (loading) {
    return <LoadingState connectionStatus={connectionStatus} dbStatus={databaseStatus} />
  }

  if (error) {
    return <ErrorState error={error} dbStatus={databaseStatus} onRetry={loadData} onClearCache={handleClearCache} />
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
            yearsInIndiaRange={yearsInIndiaRange}
            firstCenterYearRange={firstCenterYearRange}
            centerIncYearRange={centerIncYearRange}
            accountNames={accountNames}
            setPendingFilters={setPendingFilters}
            resetFilters={resetFilters}
            handleExportAll={handleExportAll}
            handleMinRevenueChange={handleMinRevenueChange}
            handleMaxRevenueChange={handleMaxRevenueChange}
            handleRevenueRangeChange={handleRevenueRangeChange}
            handleMinYearsInIndiaChange={handleMinYearsInIndiaChange}
            handleMaxYearsInIndiaChange={handleMaxYearsInIndiaChange}
            handleYearsInIndiaRangeChange={handleYearsInIndiaRangeChange}
            handleMinFirstCenterYearChange={handleMinFirstCenterYearChange}
            handleMaxFirstCenterYearChange={handleMaxFirstCenterYearChange}
            handleFirstCenterYearRangeChange={handleFirstCenterYearRangeChange}
            handleMinCenterIncYearChange={handleMinCenterIncYearChange}
            handleMaxCenterIncYearChange={handleMaxCenterIncYearChange}
            handleCenterIncYearRangeChange={handleCenterIncYearRangeChange}
            getTotalActiveFilters={getTotalActiveFilters}
            handleLoadSavedFilters={handleLoadSavedFilters}
            formatRevenueInMillions={formatRevenueInMillions}
          />

          <div className="flex-1 bg-background overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto scrollbar-gutter-stable">
              <div className="p-6 pb-3">
                <SummaryCards
                  filteredAccountsCount={filteredData.filteredAccounts.length}
                  totalAccountsCount={accounts.length}
                  filteredCentersCount={filteredData.filteredCenters.length}
                  totalCentersCount={centers.length}
                  filteredProspectsCount={filteredData.filteredProspects.length}
                  totalProspectsCount={prospects.length}
                  activeView={activeSection}
                  onSelect={setActiveSection}
                />

                <Tabs value={activeSection} className="space-y-4">
                  <AccountsTab
                    accounts={filteredData.filteredAccounts}
                    centers={filteredData.filteredCenters}
                    prospects={filteredData.filteredProspects}
                    services={filteredData.filteredServices}
                    tech={tech}
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
                    allCenters={centers}
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
