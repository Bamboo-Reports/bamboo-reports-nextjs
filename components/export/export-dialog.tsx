"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Building2, Briefcase, Users, Sparkles } from "lucide-react"
import {
  exportSelectedDataZip,
  type ExportDatasetKey,
  type ExportProgressHandler,
  type RowRecord,
} from "@/lib/utils/export-helpers"
import { captureEvent } from "@/lib/analytics/client"
import { ANALYTICS_EVENTS } from "@/lib/analytics/events"
import { toTrackedStringArray } from "@/lib/analytics/tracking"
import { cn } from "@/lib/utils"

type ExportData = {
  accounts: object[]
  centers: object[]
  services: object[]
  prospects: object[]
}

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: ExportData
  isFiltered: boolean
  onExportCompleted?: () => void
}

const DATASET_META: Array<{
  key: ExportDatasetKey
  label: string
  description: string
  icon: typeof Building2
  accent: string
}> = [
  {
    key: "accounts",
    label: "Accounts",
    description: "Legal names, HQ details, revenue ranges",
    icon: Building2,
    accent: "text-[hsl(var(--chart-1))]",
  },
  {
    key: "centers",
    label: "Centers",
    description: "Locations, type, employees, status",
    icon: Briefcase,
    accent: "text-[hsl(var(--chart-2))]",
  },
  {
    key: "services",
    label: "Services",
    description: "Service lines, focus, software stack",
    icon: Sparkles,
    accent: "text-[hsl(var(--chart-4))]",
  },
  {
    key: "prospects",
    label: "Prospects",
    description: "Decision makers, titles, departments",
    icon: Users,
    accent: "text-[hsl(var(--chart-3))]",
  },
]

export function ExportDialog({ open, onOpenChange, data, isFiltered, onExportCompleted }: ExportDialogProps) {
  const [selection, setSelection] = useState<Record<ExportDatasetKey, boolean>>({
    accounts: true,
    centers: true,
    services: true,
    prospects: true,
  })
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("Preparing export...")
  const [error, setError] = useState<string | null>(null)
  const wasOpenRef = useRef(false)

  const getSelectedDatasets = (currentSelection: Record<ExportDatasetKey, boolean>) =>
    (Object.keys(currentSelection) as ExportDatasetKey[]).filter((dataset) => currentSelection[dataset])

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false
      return
    }
    if (wasOpenRef.current) {
      return
    }
    wasOpenRef.current = true

    const initialSelection = {
      accounts: data.accounts.length > 0,
      centers: data.centers.length > 0,
      services: data.services.length > 0,
      prospects: data.prospects.length > 0,
    }
    setSelection(initialSelection)
    setIsExporting(false)
    setProgress(0)
    setStage("Preparing export...")
    setError(null)

    const initiallySelectedDatasets = getSelectedDatasets(initialSelection)

    captureEvent(ANALYTICS_EVENTS.EXPORT_DIALOG_OPENED, {
      is_filtered: isFiltered,
      row_count_accounts: data.accounts.length,
      row_count_centers: data.centers.length,
      row_count_services: data.services.length,
      row_count_prospects: data.prospects.length,
      selected_datasets: initiallySelectedDatasets,
      selected_dataset_count: initiallySelectedDatasets.length,
    })
  }, [open, data, isFiltered])

  const totalSelected = useMemo(
    () => Object.values(selection).filter(Boolean).length,
    [selection]
  )

  const handleToggle = (key: ExportDatasetKey) => {
    if (isExporting) return
    const next = { ...selection, [key]: !selection[key] }
    setSelection(next)
    const selectedDatasets = getSelectedDatasets(next)
    captureEvent(ANALYTICS_EVENTS.EXPORT_SELECTION_CHANGED, {
      changed_dataset: key,
      is_selected: next[key],
      selected_datasets: selectedDatasets,
      selected_dataset_count: selectedDatasets.length,
    })
  }

  const handleSelectAll = (value: boolean) => {
    if (isExporting) return
    const next = {
      accounts: value,
      centers: value,
      services: value,
      prospects: value,
    }
    setSelection(next)
    captureEvent(value ? ANALYTICS_EVENTS.EXPORT_SELECT_ALL_CLICKED : ANALYTICS_EVENTS.EXPORT_CLEAR_CLICKED, {
      selected_dataset_count: value ? 4 : 0,
      selected_datasets: value ? (Object.keys(next) as ExportDatasetKey[]) : [],
    })
  }

  const handleExport = async () => {
    if (isExporting || totalSelected === 0) return

    setIsExporting(true)
    setError(null)
    setProgress(0)
    setStage("Preparing export...")
    const startedAt = Date.now()
    const selectedDatasets = getSelectedDatasets(selection)

    const onProgress: ExportProgressHandler = (value, nextStage) => {
      setProgress(value)
      if (nextStage) setStage(nextStage)
    }

    captureEvent(ANALYTICS_EVENTS.EXPORT_STARTED, {
      selected_datasets: selectedDatasets,
      selected_dataset_count: selectedDatasets.length,
      is_filtered: isFiltered,
      row_count_accounts: selection.accounts ? data.accounts.length : 0,
      row_count_centers: selection.centers ? data.centers.length : 0,
      row_count_services: selection.services ? data.services.length : 0,
      row_count_prospects: selection.prospects ? data.prospects.length : 0,
    })

    try {
      await exportSelectedDataZip({
        selection: {
          accounts: selection.accounts ? (data.accounts as RowRecord[]) : undefined,
          centers: selection.centers ? (data.centers as RowRecord[]) : undefined,
          services: selection.services ? (data.services as RowRecord[]) : undefined,
          prospects: selection.prospects ? (data.prospects as RowRecord[]) : undefined,
        },
        onProgress,
      })
      setStage("Export ready")
      captureEvent(ANALYTICS_EVENTS.EXPORT_COMPLETED, {
        selected_datasets: selectedDatasets,
        selected_dataset_count: selectedDatasets.length,
        is_filtered: isFiltered,
        duration_ms: Date.now() - startedAt,
      })
      onExportCompleted?.()
    } catch (err) {
      console.error("Export failed:", err)
      setError("Export failed. Please try again.")
      captureEvent(ANALYTICS_EVENTS.EXPORT_FAILED, {
        selected_datasets: selectedDatasets,
        selected_dataset_count: selectedDatasets.length,
        is_filtered: isFiltered,
        duration_ms: Date.now() - startedAt,
        error_message: err instanceof Error ? err.message : "Unknown export error",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (open && !nextOpen && !isExporting) {
      const selectedDatasets = getSelectedDatasets(selection)
      captureEvent(ANALYTICS_EVENTS.EXPORT_CANCELLED, {
        selected_dataset_count: totalSelected,
        selected_datasets: selectedDatasets,
        row_count_accounts: selection.accounts ? data.accounts.length : 0,
        row_count_centers: selection.centers ? data.centers.length : 0,
        row_count_services: selection.services ? data.services.length : 0,
        row_count_prospects: selection.prospects ? data.prospects.length : 0,
        stage: toTrackedStringArray([stage])[0] ?? null,
        has_error: Boolean(error),
      })
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Export data</DialogTitle>
          <DialogDescription>
            {isFiltered
              ? "You are exporting the filtered dataset across all pages."
              : "You are exporting the full dataset from the database."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border bg-muted/10 px-4 py-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>Selections</span>
              <Badge variant="secondary">{totalSelected} selected</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => handleSelectAll(true)}
                disabled={isExporting}
              >
                Select all
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => handleSelectAll(false)}
                disabled={isExporting}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {DATASET_META.map((item) => {
              const Icon = item.icon
              const count = data[item.key].length
              const isChecked = selection[item.key]

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleToggle(item.key)}
                  className={cn(
                    "group relative flex items-start gap-3 rounded-xl border bg-background px-4 py-3 text-left shadow-sm transition-all duration-150",
                    isChecked ? "border-primary/40 bg-primary/5" : "hover:border-muted-foreground/40",
                    isExporting && "cursor-not-allowed opacity-70"
                  )}
                  disabled={isExporting}
                >
                  <Checkbox checked={isChecked} disabled={isExporting} className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", item.accent)} />
                        <span className="text-sm font-semibold">{item.label}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {count.toLocaleString()} rows
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {(isExporting || error) && (
            <div className="rounded-lg border bg-muted/20 p-4">
              {isExporting && (
                <>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{stage}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </>
              )}
              {error && <p className={isExporting ? "mt-2 text-xs text-destructive" : "text-xs text-destructive"}>{error}</p>}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false)
            }}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || totalSelected === 0}>
            {isExporting ? "Exporting..." : "Export Selected"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
