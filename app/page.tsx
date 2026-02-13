"use client"

import React, { useCallback, useEffect, useState } from 'react'
import { ExportDialog } from '@/components/export/export-dialog'
import { FiltersSidebar } from '@/components/filters/filters-sidebar'
import { Header } from '@/components/layout/header'
import { ErrorState } from '@/components/states/error-state'
import { LoadingState } from '@/components/states/loading-state'
import { AccountsTab, CentersTab } from '@/components/tabs'
import { ProspectsTab } from '@/components/tabs/prospects-tab'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { Tabs } from '@/components/ui/tabs'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { useDashboardFilters } from '@/hooks/use-dashboard-filters'
import { formatRevenueInMillions } from '@/lib/utils/helpers'

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'br-dashboard-sidebar-collapsed'

function DashboardContent(): JSX.Element | null {
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
  const itemsPerPage = 50
  const [accountsView, setAccountsView] = useState<'chart' | 'data' | 'map'>('map')
  const [centersView, setCentersView] = useState<'chart' | 'data' | 'map'>('map')
  const [prospectsView, setProspectsView] = useState<'chart' | 'data'>('chart')
  const [activeSection, setActiveSection] = useState<'accounts' | 'centers' | 'prospects'>('accounts')
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  useEffect(() => {
    const storedSidebarState = window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY)
    if (storedSidebarState === 'true') {
      setIsSidebarCollapsed(true)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  const handleExportAll = useCallback(() => {
    setExportDialogOpen(true)
  }, [])

  const dataLoaded =
    !loading && accounts.length > 0 && centers.length > 0 && services.length > 0 && prospects.length > 0

  if (!authReady || !userId) {
    return null
  }

  if (loading) {
    return <LoadingState connectionStatus={connectionStatus} dbStatus={databaseStatus} />
  }

  if (error) {
    return <ErrorState error={error} dbStatus={databaseStatus} onRetry={loadData} onClearCache={handleClearCache} />
  }

  return (
    <div className="h-screen bg-[radial-gradient(circle_at_top_right,_hsl(var(--primary)/0.14),_transparent_36%),radial-gradient(circle_at_0%_45%,_hsl(var(--chart-3)/0.10),_transparent_34%),hsl(var(--background))] flex flex-col overflow-hidden">
      <Header onRefresh={loadData} />

      {dataLoaded && (
        <div className="flex flex-1 overflow-hidden [--dashboard-content-top-gap:1.5rem] [--dashboard-content-bottom-gap:0.75rem]">
          <ExportDialog
            open={exportDialogOpen}
            onOpenChange={setExportDialogOpen}
            data={{
              accounts: filteredData.filteredAccounts,
              centers: filteredData.filteredCenters,
              services: filteredData.filteredServices,
              prospects: filteredData.filteredProspects,
            }}
            isFiltered={getTotalActiveFilters() > 0}
          />
          <FiltersSidebar
            filters={filters}
            pendingFilters={pendingFilters}
            availableOptions={availableOptions}
            isApplying={isApplying}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
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

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto scrollbar-gutter-stable">
              <div className="px-6 pt-[var(--dashboard-content-top-gap)] pb-[var(--dashboard-content-bottom-gap)]">
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
