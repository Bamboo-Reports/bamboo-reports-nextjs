"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, PieChartIcon, Table as TableIcon } from "lucide-react"
import { AccountRow } from "@/components/tables"
import { PieChartCard } from "@/components/charts/pie-chart-card"
import { getPaginatedData, getTotalPages, getPageInfo } from "@/lib/utils/helpers"
import { exportToExcel } from "@/lib/utils/export-helpers"
import type { Account, Function } from "@/lib/types"

interface AccountsTabProps {
  accounts: Account[]
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
  accountChartData,
  accountsView,
  setAccountsView,
  currentPage,
  setCurrentPage,
  itemsPerPage,
}: AccountsTabProps) {
  return (
    <TabsContent value="accounts">
      {/* Header with View Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Account Analytics</h2>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Sub Industry</TableHead>
                    <TableHead>Primary Category</TableHead>
                    <TableHead>Primary Nature</TableHead>
                    <TableHead>NASSCOM Status</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Revenue Range</TableHead>
                    <TableHead>Employees Range</TableHead>
                    <TableHead>Center Employees</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedData(accounts, currentPage, itemsPerPage).map(
                    (account, index) => (
                      <AccountRow key={`${account["ACCOUNT NAME"]}-${index}`} account={account} />
                    )
                  )}
                </TableBody>
              </Table>
            </div>
            {accounts.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-500">
                    Showing{" "}
                    {getPageInfo(currentPage, accounts.length, itemsPerPage).startItem} to{" "}
                    {getPageInfo(currentPage, accounts.length, itemsPerPage).endItem} of{" "}
                    {accounts.length} results
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToExcel(accounts, "accounts-export", "Accounts")}
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
                    <span className="text-sm text-gray-600">
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
    </TabsContent>
  )
}
