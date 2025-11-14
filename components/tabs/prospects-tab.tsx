"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, PieChartIcon, Table as TableIcon } from "lucide-react"
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

  const handleProspectClick = (prospect: Prospect) => {
    setSelectedProspect(prospect)
    setIsDialogOpen(true)
  }

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
        <Card>
          <CardHeader>
            <CardTitle>Prospects Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16"></TableHead>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Account Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedData(prospects, currentPage, itemsPerPage).map(
                    (prospect, index) => (
                      <ProspectRow
                        key={`${prospect.EMAIL}-${index}`}
                        prospect={prospect}
                        onClick={() => handleProspectClick(prospect)}
                      />
                    )
                  )}
                </TableBody>
              </Table>
            </div>
            {prospects.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    {getPageInfo(currentPage, prospects.length, itemsPerPage).startItem} to{" "}
                    {getPageInfo(currentPage, prospects.length, itemsPerPage).endItem} of{" "}
                    {prospects.length} results
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToExcel(prospects, "prospects-export", "Prospects")}
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
                      disabled={
                        currentPage === getTotalPages(prospects.length, itemsPerPage)
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

      {/* Prospect Details Dialog */}
      <ProspectDetailsDialog
        prospect={selectedProspect}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </TabsContent>
  )
}
