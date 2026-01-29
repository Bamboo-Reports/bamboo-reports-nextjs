"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowUpDown,
  LayoutGrid,
  MapIcon,
  MapPin,
  PieChartIcon,
  Table as TableIcon,
  Layers,
} from "lucide-react"
import { AccountRow } from "@/components/tables"
import { AccountGridCard } from "@/components/cards/account-grid-card"
import { PieChartCard } from "@/components/charts/pie-chart-card"
import { EmptyState } from "@/components/states/empty-state"
import { AccountDetailsDialog } from "@/components/dialogs/account-details-tabbed-dialog"
import { CentersMap } from "@/components/maps/centers-map"
import { CentersChoroplethMap } from "@/components/maps/centers-choropleth-map"
import { MapErrorBoundary } from "@/components/maps/map-error-boundary"
import { ViewSwitcher } from "@/components/ui/view-switcher"
import { SortButton } from "@/components/ui/sort-button"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { getPaginatedData } from "@/lib/utils/helpers"
import type { Account, Center, Prospect, Service, Tech } from "@/lib/types"

interface AccountsTabProps {
  accounts: Account[]
  centers: Center[]
  prospects: Prospect[]
  services: Service[]
  tech: Tech[]
  accountChartData: {
    regionData: Array<{ name: string; value: number; fill?: string }>
    primaryNatureData: Array<{ name: string; value: number; fill?: string }>
    revenueRangeData: Array<{ name: string; value: number; fill?: string }>
    employeesRangeData: Array<{ name: string; value: number; fill?: string }>
  }
  accountsView: "chart" | "data" | "map"
  setAccountsView: (view: "chart" | "data" | "map") => void
  currentPage: number
  setCurrentPage: (page: number | ((prev: number) => number)) => void
  itemsPerPage: number
}

const getSortIcon = (isActive: boolean, direction: "asc" | "desc" | null): JSX.Element => {
  if (!isActive || direction === null) {
    return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
  }
  return direction === "asc" ? (
    <ArrowUpAZ className="h-3.5 w-3.5 text-muted-foreground" />
  ) : (
    <ArrowDownAZ className="h-3.5 w-3.5 text-muted-foreground" />
  )
}

export function AccountsTab({
  accounts,
  centers,
  prospects,
  services,
  tech,
  accountChartData,
  accountsView,
  setAccountsView,
  currentPage,
  setCurrentPage,
  itemsPerPage,
}: AccountsTabProps): JSX.Element {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sort, setSort] = useState<{
    key: "name" | "location" | "industry" | "revenue"
    direction: "asc" | "desc" | null
  }>(
    {
      key: "name",
      direction: null,
    }
  )
  const [dataLayout, setDataLayout] = useState<"table" | "grid">("table")
  const [mapMode, setMapMode] = useState<"city" | "state">("city")

  const handleAccountClick = (account: Account): void => {
    setSelectedAccount(account)
    setIsDialogOpen(true)
  }

  const handleSort = (key: typeof sort.key): void => {
    setSort((prev) => {
      if (prev.key !== key || prev.direction === null) {
        return { key, direction: "asc" }
      }
      if (prev.direction === "asc") return { key, direction: "desc" }
      return { key, direction: null }
    })
    setCurrentPage(1)
  }

  const sortedAccounts = useMemo(() => {
    if (!sort.direction) return accounts

    const compare = (a: string | undefined | null, b: string | undefined | null) =>
      (a || "").localeCompare(b || "", undefined, { sensitivity: "base" })

    const getValue = (account: Account) => {
      switch (sort.key) {
        case "location":
          return [account.account_hq_city, account.account_hq_country].filter(Boolean).join(", ")
        case "industry":
          return account.account_hq_industry
        case "revenue":
          return account.account_hq_revenue_range
        default:
          return account.account_global_legal_name
      }
    }

    const sorted = [...accounts].sort((a, b) => compare(getValue(a), getValue(b)))
    return sort.direction === "asc" ? sorted : sorted.reverse()
  }, [accounts, sort])

  const paginatedAccounts = useMemo(
    () => getPaginatedData(sortedAccounts, currentPage, itemsPerPage),
    [sortedAccounts, currentPage, itemsPerPage]
  )

  if (accounts.length === 0) {
    return (
      <TabsContent value="accounts">
        <EmptyState type="no-results" />
      </TabsContent>
    )
  }

  return (
    <TabsContent value="accounts">
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="h-5 w-5 text-[hsl(var(--chart-1))]" />
        <h2 className="text-lg font-semibold text-foreground">Account Analytics</h2>
        <ViewSwitcher
          value={accountsView}
          onValueChange={(value) => setAccountsView(value as "chart" | "data" | "map")}
          options={[
            {
              value: "chart",
              label: <span className="text-[hsl(var(--chart-1))]">Charts</span>,
              icon: <PieChartIcon className="h-4 w-4 text-[hsl(var(--chart-1))]" />,
            },
            {
              value: "map",
              label: <span className="text-[hsl(var(--chart-4))]">Map</span>,
              icon: <MapIcon className="h-4 w-4 text-[hsl(var(--chart-4))]" />,
            },
            {
              value: "data",
              label: <span className="text-[hsl(var(--chart-2))]">Data</span>,
              icon: <TableIcon className="h-4 w-4 text-[hsl(var(--chart-2))]" />,
            },
          ]}
          className="ml-auto"
        />
      </div>

      {accountsView === "chart" && (
        <div className="w-full mb-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PieChartCard
              title="Region Split"
              data={accountChartData.regionData}
              countLabel="Total Accounts"
              showBigPercentage
            />
            <PieChartCard
              title="Primary Nature Split"
              data={accountChartData.primaryNatureData}
              countLabel="Total Accounts"
              showBigPercentage
            />
            <PieChartCard
              title="Revenue Range Split"
              data={accountChartData.revenueRangeData}
              countLabel="Total Accounts"
              showBigPercentage
            />
            <PieChartCard
              title="Employees Range Split"
              data={accountChartData.employeesRangeData}
              countLabel="Total Accounts"
              showBigPercentage
            />
          </div>
        </div>
      )}

      {accountsView === "map" && (
        <Card className="w-full flex flex-col h-[calc(100vh-19.5rem)] border shadow-sm animate-fade-in">
          <CardHeader className="shrink-0 px-6 py-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">Accounts Map</CardTitle>
              <ViewSwitcher
                value={mapMode}
                onValueChange={(value) => setMapMode(value as "city" | "state")}
                options={[
                  {
                    value: "city",
                    label: <span className="text-[hsl(var(--chart-4))]">City</span>,
                    icon: <MapPin className="h-4 w-4 text-[hsl(var(--chart-4))]" />,
                  },
                  {
                    value: "state",
                    label: <span className="text-[hsl(var(--chart-3))]">State</span>,
                    icon: <Layers className="h-4 w-4 text-[hsl(var(--chart-3))]" />,
                  },
                ]}
                className="ml-auto"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
            <MapErrorBoundary>
              {mapMode === "city" ? (
                <CentersMap centers={centers} heightClass="h-full" />
              ) : (
                <CentersChoroplethMap centers={centers} heightClass="h-full" />
              )}
            </MapErrorBoundary>
          </CardContent>
        </Card>
      )}

      {accountsView === "data" && (
        <Card className="w-full flex flex-col h-[calc(100vh-19.5rem)] border shadow-sm animate-fade-in">
          <CardHeader className="shrink-0 px-6 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-lg">Accounts Data</CardTitle>
              <ViewSwitcher
                value={dataLayout}
                onValueChange={(value) => setDataLayout(value as "table" | "grid")}
                options={[
                  {
                    value: "table",
                    label: <span className="text-[hsl(var(--chart-2))]">Table</span>,
                    icon: <TableIcon className="h-4 w-4 text-[hsl(var(--chart-2))]" />,
                  },
                  {
                    value: "grid",
                    label: <span className="text-[hsl(var(--chart-3))]">Grid</span>,
                    icon: <LayoutGrid className="h-4 w-4 text-[hsl(var(--chart-3))]" />,
                  },
                ]}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-auto">
              {dataLayout === "table" ? (
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[280px]">
                        <SortButton
                          label="Account Name"
                          sortKey="name"
                          currentKey={sort.key}
                          direction={sort.direction}
                          onClick={handleSort}
                        />
                      </TableHead>
                      <TableHead className="w-[200px]">
                        <SortButton
                          label="Location"
                          sortKey="location"
                          currentKey={sort.key}
                          direction={sort.direction}
                          onClick={handleSort}
                        />
                      </TableHead>
                      <TableHead className="w-[220px]">
                        <SortButton
                          label="Industry"
                          sortKey="industry"
                          currentKey={sort.key}
                          direction={sort.direction}
                          onClick={handleSort}
                        />
                      </TableHead>
                      <TableHead className="w-[140px]">
                        <SortButton
                          label="Revenue Range"
                          sortKey="revenue"
                          currentKey={sort.key}
                          direction={sort.direction}
                          onClick={handleSort}
                        />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAccounts.map((account, index) => (
                      <AccountRow
                        key={`${account.account_global_legal_name}-${index}`}
                        account={account}
                        onClick={() => handleAccountClick(account)}
                      />
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 px-6 py-3 border-b bg-muted/20">
                    <span className="text-xs font-medium text-muted-foreground">Sort</span>
                    <button
                      type="button"
                      onClick={() => handleSort("name")}
                      className="inline-flex items-center justify-center rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20 shadow-sm transition-colors h-7 w-7"
                      aria-label="Sort by account name"
                    >
                      {getSortIcon(sort.key === "name", sort.direction)}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                    {paginatedAccounts.map((account, index) => (
                      <AccountGridCard
                        key={`${account.account_global_legal_name}-${index}`}
                        account={account}
                        onClick={() => handleAccountClick(account)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            {accounts.length > 0 && (
              <PaginationControls
                currentPage={currentPage}
                totalItems={accounts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                dataLength={accounts.length}
              />
            )}
          </CardContent>
        </Card>
      )}

      <AccountDetailsDialog
        account={selectedAccount}
        centers={centers}
        prospects={prospects}
        services={services}
        tech={tech}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </TabsContent>
  )
}
