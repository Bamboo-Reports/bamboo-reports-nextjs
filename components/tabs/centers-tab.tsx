"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDownAZ, ArrowUpAZ, ArrowUpDown, Download, PieChartIcon, Table as TableIcon, MapIcon } from "lucide-react"
import { CenterRow } from "@/components/tables"
import { PieChartCard } from "@/components/charts/pie-chart-card"
import { EmptyState } from "@/components/states/empty-state"
import { CenterDetailsDialog } from "@/components/dialogs/center-details-dialog"
import { getPaginatedData, getTotalPages, getPageInfo } from "@/lib/utils/helpers"
import { exportToExcel } from "@/lib/utils/export-helpers"
import { CentersMap } from "@/components/maps/centers-map"
import { MapErrorBoundary } from "@/components/maps/map-error-boundary"
import type { Center, Function, Service } from "@/lib/types"

interface CentersTabProps {
  centers: Center[]
  functions: Function[]
  services: Service[]
  centerChartData: {
    centerTypeData: Array<{ name: string; value: number; fill?: string }>
    employeesRangeData: Array<{ name: string; value: number; fill?: string }>
    cityData: Array<{ name: string; value: number; fill?: string }>
    functionData: Array<{ name: string; value: number; fill?: string }>
  }
  centersView: "chart" | "data" | "map"
  setCentersView: (view: "chart" | "data" | "map") => void
  currentPage: number
  setCurrentPage: (page: number | ((prev: number) => number)) => void
  itemsPerPage: number
}

export function CentersTab({
  centers,
  services,
  centerChartData,
  centersView,
  setCentersView,
  currentPage,
  setCurrentPage,
  itemsPerPage,
}: CentersTabProps) {
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const mapHeightClass = "h-full min-h-[420px]"
  const [sort, setSort] = useState<{
    key: "account" | "name" | "type" | "employees"
    direction: "asc" | "desc" | null
  }>({
    key: "account",
    direction: null,
  })

  const handleCenterClick = (center: Center) => {
    setSelectedCenter(center)
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

  const sortedCenters = React.useMemo(() => {
    if (!sort.direction) return centers

    const compare = (a: string | undefined | null, b: string | undefined | null) =>
      (a || "").localeCompare(b || "", undefined, { sensitivity: "base" })

    const getValue = (center: Center) => {
      switch (sort.key) {
        case "name":
          return center.center_name
        case "type":
          return center.center_type
        case "employees":
          return center.center_employees_range
        default:
          return center.account_global_legal_name
      }
    }

    const sorted = [...centers].sort((a, b) => compare(getValue(a), getValue(b)))
    return sort.direction === "asc" ? sorted : sorted.reverse()
  }, [centers, sort])

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

  // Show empty state when no centers
  if (centers.length === 0) {
    return (
      <TabsContent value="centers" className="flex h-full flex-1 flex-col min-h-0">
        <EmptyState type="no-results" />
      </TabsContent>
    )
  }

  return (
    <TabsContent value="centers">
      {/* Header with View Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="h-5 w-5 text-[hsl(var(--chart-2))]" />
        <h2 className="text-lg font-semibold text-foreground">Center Analytics</h2>
        <Badge variant="secondary" className="ml-2">
          {centers.length} Centers
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={centersView === "chart" ? "default" : "outline"}
            size="sm"
            onClick={() => setCentersView("chart")}
            className="flex items-center gap-2"
          >
            <PieChartIcon className="h-4 w-4" />
            Charts
          </Button>
          <Button
            variant={centersView === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setCentersView("map")}
            className="flex items-center gap-2"
          >
            <MapIcon className="h-4 w-4" />
            Map
          </Button>
          <Button
            variant={centersView === "data" ? "default" : "outline"}
            size="sm"
            onClick={() => setCentersView("data")}
            className="flex items-center gap-2"
          >
            <TableIcon className="h-4 w-4" />
            Data
          </Button>
        </div>
      </div>

      {/* Charts Section */}
      {centersView === "chart" && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PieChartCard
              title="Center Type Distribution"
              data={centerChartData.centerTypeData}
            />
            <PieChartCard
              title="Employee Range Distribution"
              data={centerChartData.employeesRangeData}
            />
            <PieChartCard
              title="City Distribution (Top 5)"
              data={centerChartData.cityData}
            />
            <PieChartCard
              title="Functions Distribution"
              data={centerChartData.functionData}
            />
          </div>
        </div>
      )}

      {/* Map Section */}
      {centersView === "map" && (
        <div className="flex-1 min-h-0">
          <MapErrorBoundary>
            <CentersMap centers={centers} heightClass={mapHeightClass} />
          </MapErrorBoundary>
        </div>
      )}

      {/* Data Table */}
      {centersView === "data" && (
        <Card className="flex flex-1 flex-col">
          <CardHeader>
            <CardTitle>Centers Data</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto rounded-lg border bg-card/40">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <SortButton label="Account Name" sortKey="account" />
                    </TableHead>
                    <TableHead>
                      <SortButton label="Center Name" sortKey="name" />
                    </TableHead>
                    <TableHead>
                      <SortButton label="Center Type" sortKey="type" />
                    </TableHead>
                    <TableHead>
                      <SortButton label="Employee Range" sortKey="employees" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedData(sortedCenters, currentPage, itemsPerPage).map(
                    (center, index) => (
                      <CenterRow
                        key={`${center.cn_unique_key}-${index}`}
                        center={center}
                        onClick={() => handleCenterClick(center)}
                      />
                    )
                  )}
                </TableBody>
              </Table>
            </div>
            {centers.length > 0 && (
              <div className="mt-4 flex items-center justify-between gap-4 rounded-lg bg-card/60 p-3">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {getPageInfo(currentPage, centers.length, itemsPerPage).startItem} to{" "}
                    {getPageInfo(currentPage, centers.length, itemsPerPage).endItem} of {centers.length} results
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToExcel(sortedCenters, "centers-export", "Centers")}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Centers
                  </Button>
                </div>
                {getTotalPages(centers.length, itemsPerPage) > 1 && (
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
                      Page {currentPage} of {getTotalPages(centers.length, itemsPerPage)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, getTotalPages(centers.length, itemsPerPage))
                        )
                      }
                      disabled={currentPage === getTotalPages(centers.length, itemsPerPage)}
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

      {/* Center Details Dialog */}
      <CenterDetailsDialog
        center={selectedCenter}
        services={services}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </TabsContent>
  )
}
