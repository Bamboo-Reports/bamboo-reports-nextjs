"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDownAZ, ArrowUpAZ, ArrowUpDown, Download, PieChartIcon, Table as TableIcon } from "lucide-react"
import { ProspectRow } from "@/components/tables/prospect-row"
import { PieChartCard } from "@/components/charts/pie-chart-card"
import { EmptyState } from "@/components/states/empty-state"
import { ProspectDetailsDialog } from "@/components/dialogs/prospect-details-dialog"
import { getPaginatedData, getTotalPages, getPageInfo } from "@/lib/utils/helpers"
import { exportToExcel } from "@/lib/utils/export-helpers"
import type { Prospect } from "@/lib/types"

interface ProspectsTabProps {
  prospects: Prospect[]
  prospectChartData: {
    departmentData: Array<{ name: string; value: number; fill?: string }>
    levelData: Array<{ name: string; value: number; fill?: string }>
  }
  prospectsView: "chart" | "data"
  setProspectsView: (view: "chart" | "data") => void
  currentPage: number
  setCurrentPage: (page: number | ((prev: number) => number)) => void
  itemsPerPage: number
}

export function ProspectsTab({
  prospects,
  prospectChartData,
  prospectsView,
  setProspectsView,
  currentPage,
  setCurrentPage,
  itemsPerPage,
}: ProspectsTabProps) {
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sort, setSort] = useState<{
    key: "first" | "last" | "title" | "account"
    direction: "asc" | "desc" | null
  }>({
    key: "first",
    direction: null,
  })

  const handleProspectClick = (prospect: Prospect) => {
    setSelectedProspect(prospect)
    setIsDialogOpen(true)
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

  const sortedProspects = React.useMemo(() => {
    if (!sort.direction) return prospects

    const compare = (a: string | undefined | null, b: string | undefined | null) =>
      (a || "").localeCompare(b || "", undefined, { sensitivity: "base" })

    const getValue = (prospect: Prospect) => {
      switch (sort.key) {
        case "last":
          return prospect.prospect_last_name
        case "title":
          return prospect.prospect_title
        case "account":
          return prospect.account_global_legal_name
        default:
          return prospect.prospect_first_name
      }
    }

    const sorted = [...prospects].sort((a, b) => compare(getValue(a), getValue(b)))
    return sort.direction === "asc" ? sorted : sorted.reverse()
  }, [prospects, sort])

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

  // Show empty state when no prospects
  if (prospects.length === 0) {
    return (
      <TabsContent value="prospects">
        <EmptyState type="no-results" />
      </TabsContent>
    )
  }

  return (
    <TabsContent value="prospects" className="flex h-full flex-1 flex-col min-h-0">
      {/* Header with View Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="h-5 w-5 text-[hsl(var(--chart-1))]" />
        <h2 className="text-lg font-semibold text-foreground">Prospect Analytics</h2>
        <Badge variant="secondary" className="ml-2">
          {prospects.length} Prospects
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={prospectsView === "chart" ? "default" : "outline"}
            size="sm"
            onClick={() => setProspectsView("chart")}
            className="flex items-center gap-2"
          >
            <PieChartIcon className="h-4 w-4" />
            Charts
          </Button>
          <Button
            variant={prospectsView === "data" ? "default" : "outline"}
            size="sm"
            onClick={() => setProspectsView("data")}
            className="flex items-center gap-2"
          >
            <TableIcon className="h-4 w-4" />
            Data
          </Button>
        </div>
      </div>

      {/* Charts Section */}
      {prospectsView === "chart" && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PieChartCard
              title="Department Split"
              data={prospectChartData.departmentData}
            />
            <PieChartCard
              title="Level Split"
              data={prospectChartData.levelData}
            />
          </div>
        </div>
      )}

      {/* Data Table */}
      {prospectsView === "data" && (
        <Card className="flex flex-1 flex-col">
          <CardHeader>
            <CardTitle>Prospects Data</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto rounded-lg border bg-card/40">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16"></TableHead>
                    <TableHead>
                      <SortButton label="First Name" sortKey="first" />
                    </TableHead>
                    <TableHead>
                      <SortButton label="Last Name" sortKey="last" />
                    </TableHead>
                    <TableHead>
                      <SortButton label="Job Title" sortKey="title" />
                    </TableHead>
                    <TableHead>
                      <SortButton label="Account Name" sortKey="account" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedData(sortedProspects, currentPage, itemsPerPage).map(
                    (prospect, index) => (
                      <ProspectRow
                      key={`${prospect.prospect_email}-${index}`}
                        prospect={prospect}
                        onClick={() => handleProspectClick(prospect)}
                      />
                    )
                  )}
                </TableBody>
              </Table>
            </div>
            {prospects.length > 0 && (
              <div className="mt-4 flex items-center justify-between gap-4 rounded-lg bg-card/60 p-3">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {getPageInfo(currentPage, prospects.length, itemsPerPage).startItem} to{" "}
                    {getPageInfo(currentPage, prospects.length, itemsPerPage).endItem} of {prospects.length} results
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToExcel(sortedProspects, "prospects-export", "Prospects")}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Prospects
                  </Button>
                </div>
                {getTotalPages(prospects.length, itemsPerPage) > 1 && (
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
                      Page {currentPage} of {getTotalPages(prospects.length, itemsPerPage)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, getTotalPages(prospects.length, itemsPerPage))
                        )
                      }
                      disabled={currentPage === getTotalPages(prospects.length, itemsPerPage)}
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

      {/* Prospect Details Dialog */}
      <ProspectDetailsDialog
        prospect={selectedProspect}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </TabsContent>
  )
}
