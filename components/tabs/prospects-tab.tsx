"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDownAZ, ArrowUpAZ, ArrowUpDown, Download, PieChartIcon, Table as TableIcon, LayoutGrid } from "lucide-react"
import { ProspectRow } from "@/components/tables/prospect-row"
import { ProspectGridCard } from "@/components/cards/prospect-grid-card"
import { PieChartCard } from "@/components/charts/pie-chart-card"
import { EmptyState } from "@/components/states/empty-state"
import { ProspectDetailsDialog } from "@/components/dialogs/prospect-details-dialog"
import { getPaginatedData, getTotalPages, getPageInfo } from "@/lib/utils/helpers"
import { exportToExcel } from "@/lib/utils/export-helpers"
import { ViewSwitcher } from "@/components/ui/view-switcher"
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
    key: "name" | "location" | "title" | "department"
    direction: "asc" | "desc" | null
  }>({
    key: "name",
    direction: null,
  })
  const [dataLayout, setDataLayout] = useState<"table" | "grid">("table")

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
        case "name":
          return (
            prospect.prospect_full_name ||
            [prospect.prospect_first_name, prospect.prospect_last_name].filter(Boolean).join(" ")
          )
        case "location":
          return [prospect.prospect_city, prospect.prospect_country].filter(Boolean).join(", ")
        case "title":
          return prospect.prospect_title
        default:
          return prospect.prospect_department
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
    <TabsContent value="prospects">
      {/* Header with View Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="h-5 w-5 text-[hsl(var(--chart-1))]" />
        <h2 className="text-lg font-semibold text-foreground">Prospect Analytics</h2>
        <ViewSwitcher
          value={prospectsView}
          onValueChange={(value) => setProspectsView(value as "chart" | "data")}
          options={[
            {
              value: "chart",
              label: <span className="text-[hsl(var(--chart-1))]">Charts</span>,
              icon: (
                <PieChartIcon className="h-4 w-4 text-[hsl(var(--chart-1))]" />
              ),
            },
            {
              value: "data",
              label: <span className="text-[hsl(var(--chart-2))]">Data</span>,
              icon: (
                <TableIcon className="h-4 w-4 text-[hsl(var(--chart-2))]" />
              ),
            },
          ]}
          className="ml-auto"
        />
      </div>

      {/* Charts Section */}
      {prospectsView === "chart" && (
        <div className="w-full mb-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PieChartCard
              title="Department Split"
              data={prospectChartData.departmentData}
              countLabel="Total Prospects"
              showBigPercentage
            />
            <PieChartCard
              title="Level Split"
              data={prospectChartData.levelData}
              countLabel="Total Prospects"
              showBigPercentage
            />
          </div>
        </div>
      )}

       {/* Data Table */}
       {prospectsView === "data" && (
         <Card className="w-full flex flex-col h-[calc(100vh-19.5rem)] border shadow-sm animate-fade-in">
           <CardHeader className="shrink-0 px-6 py-4">
             <div className="flex flex-wrap items-center gap-3">
               <CardTitle className="text-lg">Prospects Data</CardTitle>
               <ViewSwitcher
                 value={dataLayout}
                 onValueChange={(value) => setDataLayout(value as "table" | "grid")}
                 options={[
                   {
                     value: "table",
                     label: <span className="text-[hsl(var(--chart-2))]">Table</span>,
                     icon: (
                       <TableIcon className="h-4 w-4 text-[hsl(var(--chart-2))]" />
                     ),
                   },
                   {
                     value: "grid",
                     label: <span className="text-[hsl(var(--chart-3))]">Grid</span>,
                     icon: (
                       <LayoutGrid className="h-4 w-4 text-[hsl(var(--chart-3))]" />
                     ),
                   },
                 ]}
               />
             </div>
           </CardHeader>
            <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-auto">
                {dataLayout === "table" ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16"></TableHead>
                        <TableHead>
                          <SortButton label="Name" sortKey="name" />
                        </TableHead>
                        <TableHead>
                          <SortButton label="Location" sortKey="location" />
                        </TableHead>
                        <TableHead>
                          <SortButton label="Job Title" sortKey="title" />
                        </TableHead>
                        <TableHead>
                          <SortButton label="Department" sortKey="department" />
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
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 px-6 py-3 border-b bg-muted/20">
                      <span className="text-xs font-medium text-muted-foreground">Sort</span>
                      <button
                        type="button"
                        onClick={() => handleSort("name")}
                        className="inline-flex items-center justify-center rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20 shadow-sm transition-colors h-7 w-7"
                        aria-label="Sort by prospect name"
                      >
                        {sort.key !== "name" || sort.direction === null ? (
                          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : sort.direction === "asc" ? (
                          <ArrowUpAZ className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <ArrowDownAZ className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                      {getPaginatedData(sortedProspects, currentPage, itemsPerPage).map(
                        (prospect, index) => (
                          <ProspectGridCard
                            key={`${prospect.prospect_email}-${index}`}
                            prospect={prospect}
                            onClick={() => handleProspectClick(prospect)}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
                  {prospects.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-t shrink-0 bg-muted/20">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm text-muted-foreground">
                          {getPageInfo(currentPage, prospects.length, itemsPerPage).startItem}-{getPageInfo(currentPage, prospects.length, itemsPerPage).endItem} of{" "}
                          {prospects.length}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportToExcel(sortedProspects, "prospects-export", "Prospects")}
                          className="flex items-center gap-2 h-8"
                        >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                  {getTotalPages(prospects.length, itemsPerPage) > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-8"
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                        {currentPage}/{getTotalPages(prospects.length, itemsPerPage)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, getTotalPages(prospects.length, itemsPerPage))
                          )
                        }
                        disabled={
                          currentPage === getTotalPages(prospects.length, itemsPerPage)
                        }
                        className="h-8"
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
