"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDownAZ, ArrowUpAZ, ArrowUpDown, Download, PieChartIcon, Table as TableIcon } from "lucide-react"
import { AccountRow } from "@/components/tables"
import { PieChartCard } from "@/components/charts/pie-chart-card"
import { EmptyState } from "@/components/states/empty-state"
import { AccountDetailsDialog } from "@/components/dialogs/account-details-tabbed-dialog"
import { getPaginatedData, getTotalPages, getPageInfo } from "@/lib/utils/helpers"
import { exportToExcel } from "@/lib/utils/export-helpers"
import type { Account, Center, Prospect, Service, Function } from "@/lib/types"

interface AccountsTabProps {
  accounts: Account[]
  centers: Center[]
  prospects: Prospect[]
  services: Service[]
  functions: Function[]
  accountChartData: {
    regionData: Array<{ name: string; value: number; fill?: string }>
    primaryNatureData: Array<{ name: string; value: number; fill?: string }>
    revenueRangeData: Array<{ name: string; value: number; fill?: string }>
    employeesRangeData: Array<{ name: string; value: number; fill?: string }>
  }
  accountsView: "chart" | "data"
  setAccountsView: (view: "chart" | "data") => void
  currentPage: number
  setCurrentPage: (page: number | ((prev: number) => number)) => void
  itemsPerPage: number
}

export function AccountsTab({
  accounts,
  centers,
  prospects,
  services,
  accountChartData,
  accountsView,
  setAccountsView,
  currentPage,
  setCurrentPage,
  itemsPerPage,
}: AccountsTabProps) {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sort, setSort] = useState<{
    key: "name" | "location" | "industry" | "revenue"
    direction: "asc" | "desc" | null
  }>({
    key: "name",
    direction: null,
  })

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account)
    setIsDialogOpen(true)
  }

  // Show empty state when no accounts
  if (accounts.length === 0) {
    return (
      <TabsContent value="accounts">
        <EmptyState type="no-results" />
      </TabsContent>
    )
  }

  const handleSort = (key: typeof sort.key) => {
    setSort((prev) => {
      if (prev.key !== key || prev.direction === null) {
        return { key, direction: "asc" }
      }
      if (prev.direction === "asc") return { key, direction: "desc" }
      return { key, direction: null }
    })
    setCurrentPage(1)
  }

  const sortedAccounts = React.useMemo(() => {
    if (accounts.length === 0) return []
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

  const SortButton = ({
    label,
    sortKey,
  }: {
    label: string
    sortKey: typeof sort.key
  }) => (
    <button
      type="button"
      onClick={() => handleSort(sortKey)}
      className="inline-flex items-center gap-1 font-medium text-foreground"
    >
      <span>{label}</span>
      {sort.key !== sortKey || sort.direction === null ? (
        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
      ) : sort.direction === "asc" ? (
        <ArrowUpAZ className="h-3.5 w-3.5 text-muted-foreground" />
      ) : (
        <ArrowDownAZ className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </button>
  )

  return (
    <TabsContent value="accounts">
      {/* Header with View Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="h-5 w-5 text-[hsl(var(--chart-1))]" />
        <h2 className="text-lg font-semibold text-foreground">Account Analytics</h2>
        <Badge variant="secondary" className="ml-2">
          {accounts.length} Accounts
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={accountsView === "chart" ? "default" : "outline"}
            size="sm"
            onClick={() => setAccountsView("chart")}
            className="flex items-center gap-2"
          >
            <PieChartIcon className="h-4 w-4" />
            Charts
          </Button>
          <Button
            variant={accountsView === "data" ? "default" : "outline"}
            size="sm"
            onClick={() => setAccountsView("data")}
            className="flex items-center gap-2"
          >
            <TableIcon className="h-4 w-4" />
            Data
          </Button>
        </div>
      </div>

      {/* Charts Section */}
      {accountsView === "chart" && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PieChartCard
              title="Region Split"
              data={accountChartData.regionData}
            />
            <PieChartCard
              title="Primary Nature Split"
              data={accountChartData.primaryNatureData}
            />
            <PieChartCard
              title="Revenue Range Split"
              data={accountChartData.revenueRangeData}
            />
            <PieChartCard
              title="Employees Range Split"
              data={accountChartData.employeesRangeData}
            />
          </div>
        </div>
      )}

      {/* Data Table */}
      {accountsView === "data" && (
        <Card>
          <CardHeader>
            <CardTitle>Accounts Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <SortButton label="Account Name" sortKey="name" />
                    </TableHead>
                    <TableHead>
                      <SortButton label="Location" sortKey="location" />
                    </TableHead>
                    <TableHead>
                      <SortButton label="Industry" sortKey="industry" />
                    </TableHead>
                    <TableHead>
                      <SortButton label="Revenue Range" sortKey="revenue" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedData(sortedAccounts, currentPage, itemsPerPage).map(
                    (account, index) => (
                      <AccountRow
                        key={`${account.account_global_legal_name}-${index}`}
                        account={account}
                        onClick={() => handleAccountClick(account)}
                      />
                    )
                  )}
                </TableBody>
              </Table>
            </div>
                {accounts.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-muted-foreground">
                        Showing{" "}
                        {getPageInfo(currentPage, accounts.length, itemsPerPage).startItem} to{" "}
                        {getPageInfo(currentPage, accounts.length, itemsPerPage).endItem} of{" "}
                        {accounts.length} results
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToExcel(sortedAccounts, "accounts-export", "Accounts")}
                        className="flex items-center gap-2"
                      >
                    <Download className="h-4 w-4" />
                    Export Accounts
                  </Button>
                </div>
                {getTotalPages(accounts.length, itemsPerPage) > 1 && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {getTotalPages(accounts.length, itemsPerPage)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, getTotalPages(accounts.length, itemsPerPage))
                        )
                      }
                      disabled={
                        currentPage === getTotalPages(accounts.length, itemsPerPage)
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
      )}

      {/* Account Details Dialog */}
      <AccountDetailsDialog
        account={selectedAccount}
        centers={centers}
        prospects={prospects}
        services={services}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </TabsContent>
  )
}
