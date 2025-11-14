"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, PieChartIcon, Table as TableIcon, MapIcon } from "lucide-react"
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

  const handleCenterClick = (center: Center) => {
    setSelectedCenter(center)
    setIsDialogOpen(true)
  }

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
        <div className="mb-6">
          <MapErrorBoundary>
            <CentersMap centers={centers} />
          </MapErrorBoundary>
        </div>
      )}

      {/* Data Table */}
      {centersView === "data" && (
        <Card>
          <CardHeader>
            <CardTitle>Centers Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Center Name</TableHead>
                    <TableHead>Center Type</TableHead>
                    <TableHead>Employee Range</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedData(centers, currentPage, itemsPerPage).map(
                    (center, index) => (
                      <CenterRow
                        key={`${center["CN UNIQUE KEY"]}-${index}`}
                        center={center}
                        onClick={() => handleCenterClick(center)}
                      />
                    )
                  )}
                </TableBody>
              </Table>
            </div>
            {centers.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    {getPageInfo(currentPage, centers.length, itemsPerPage).startItem} to{" "}
                    {getPageInfo(currentPage, centers.length, itemsPerPage).endItem} of{" "}
                    {centers.length} results
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToExcel(centers, "centers-export", "Centers")}
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
                      disabled={
                        currentPage === getTotalPages(centers.length, itemsPerPage)
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
