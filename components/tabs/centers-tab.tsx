"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDownAZ, ArrowUpAZ, ArrowUpDown, PieChartIcon, Table as TableIcon, MapIcon, LayoutGrid, Layers, MapPin } from "lucide-react"
import { CenterRow } from "@/components/tables"
import { CenterGridCard } from "@/components/cards/center-grid-card"
import { PieChartCard } from "@/components/charts/pie-chart-card"
import { EmptyState } from "@/components/states/empty-state"
import { CenterDetailsDialog } from "@/components/dialogs/center-details-dialog"
import { getPaginatedData } from "@/lib/utils/helpers"
import { CentersMap } from "@/components/maps/centers-map"
import { CentersChoroplethMap } from "@/components/maps/centers-choropleth-map"
import { MapErrorBoundary } from "@/components/maps/map-error-boundary"
import { ViewSwitcher } from "@/components/ui/view-switcher"
import { SortButton } from "@/components/ui/sort-button"
import { PaginationControls } from "@/components/ui/pagination-controls"
import type { Center, Function, Service } from "@/lib/types"

interface CentersTabProps {
  centers: Center[]
  allCenters: Center[]
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
  allCenters,
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
  const [sort, setSort] = useState<{
    key: "name" | "location" | "type" | "employees"
    direction: "asc" | "desc" | null
  }>({
    key: "name",
    direction: null,
  })
  const [dataLayout, setDataLayout] = useState<"table" | "grid">("table")
  const [mapMode, setMapMode] = useState<"city" | "state">("state")

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
        case "location":
          return [center.center_city, center.center_country].filter(Boolean).join(", ")
        case "type":
          return center.center_type
        case "employees":
          return center.center_employees_range
        default:
          return ""
      }
    }

    const sorted = [...centers].sort((a, b) => compare(getValue(a), getValue(b)))
    return sort.direction === "asc" ? sorted : sorted.reverse()
  }, [centers, sort])

  // Show empty state when no centers
  if (centers.length === 0) {
    return (
      <TabsContent value="centers">
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
        <ViewSwitcher
          value={centersView}
          onValueChange={(value) => setCentersView(value as "chart" | "data" | "map")}
          options={[
            {
              value: "chart",
              label: <span className="text-[hsl(var(--chart-1))]">Charts</span>,
              icon: (
                <PieChartIcon className="h-4 w-4 text-[hsl(var(--chart-1))]" />
              ),
            },
            {
              value: "map",
              label: <span className="text-[hsl(var(--chart-4))]">Map</span>,
              icon: (
                <MapIcon className="h-4 w-4 text-[hsl(var(--chart-4))]" />
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
      {centersView === "chart" && (
        <div className="w-full mb-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PieChartCard
              title="Center Type Distribution"
              data={centerChartData.centerTypeData}
              countLabel="Total Centers"
              showBigPercentage
            />
            <PieChartCard
              title="Employee Range Distribution"
              data={centerChartData.employeesRangeData}
              countLabel="Total Centers"
              showBigPercentage
            />
            <PieChartCard
              title="City Distribution (Top 5)"
              data={centerChartData.cityData}
              countLabel="Total Centers"
              showBigPercentage
            />
            <PieChartCard
              title="Functions Distribution"
              data={centerChartData.functionData}
              countLabel="Total Centers"
              showBigPercentage
            />
          </div>
        </div>
      )}

      {/* Map Section */}
       {centersView === "map" && (
         <Card className="w-full flex flex-col h-[calc(100vh-19.5rem)] border shadow-sm animate-fade-in">
           <CardHeader className="shrink-0 px-6 py-4">
             <div className="flex items-center gap-3">
               <CardTitle className="text-lg">Centers Map</CardTitle>
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
                 <CentersChoroplethMap centers={centers} allCenters={allCenters} heightClass="h-full" />
               )}
             </MapErrorBoundary>
           </CardContent>
         </Card>
       )}

       {/* Data Table */}
       {centersView === "data" && (
         <Card className="w-full flex flex-col h-[calc(100vh-19.5rem)] border shadow-sm animate-fade-in">
           <CardHeader className="shrink-0 px-6 py-4">
             <div className="flex flex-wrap items-center gap-3">
               <CardTitle className="text-lg">Centers Data</CardTitle>
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
                 className="ml-auto"
               />
             </div>
           </CardHeader>
            <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-auto">
                {dataLayout === "table" ? (
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[260px]">
                          <SortButton label="Center Name" sortKey="name" currentKey={sort.key} direction={sort.direction} onClick={handleSort} />
                        </TableHead>
                        <TableHead className="w-[200px]">
                          <SortButton label="Location" sortKey="location" currentKey={sort.key} direction={sort.direction} onClick={handleSort} />
                        </TableHead>
                        <TableHead className="w-[200px]">
                          <SortButton label="Center Type" sortKey="type" currentKey={sort.key} direction={sort.direction} onClick={handleSort} />
                        </TableHead>
                        <TableHead className="w-[160px]">
                          <SortButton label="Employee Range" sortKey="employees" currentKey={sort.key} direction={sort.direction} onClick={handleSort} />
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
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 px-6 py-3 border-b bg-muted/20">
                      <span className="text-xs font-medium text-muted-foreground">Sort</span>
                      <button
                        type="button"
                        onClick={() => handleSort("name")}
                        className="inline-flex items-center justify-center rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20 shadow-sm transition-colors h-7 w-7"
                        aria-label="Sort by center name"
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
                      {getPaginatedData(sortedCenters, currentPage, itemsPerPage).map(
                        (center, index) => (
                          <CenterGridCard
                            key={`${center.cn_unique_key}-${index}`}
                            center={center}
                            onClick={() => handleCenterClick(center)}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
                  {centers.length > 0 && (
                    <PaginationControls
                      currentPage={currentPage}
                      totalItems={centers.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                      dataLength={centers.length}
                    />
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
