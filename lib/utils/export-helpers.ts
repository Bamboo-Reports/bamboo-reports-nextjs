import ExcelJS from "exceljs/dist/exceljs.min.js"
import JSZip from "jszip"

const ZIP_MIME_TYPE = "application/zip"

export type RowRecord = Record<string, unknown>
export type ExportDatasetKey = "accounts" | "centers" | "services" | "prospects"

export type ExportSelection = Partial<Record<ExportDatasetKey, RowRecord[]>>
export type ExportProgressHandler = (progress: number, stage?: string) => void

const DATASET_LABELS: Record<ExportDatasetKey, string> = {
  accounts: "Accounts",
  centers: "Centers",
  services: "Services",
  prospects: "Prospects",
}

const getColumnKeys = (data: RowRecord[]) => {
  const keys: string[] = []
  const seen = new Set<string>()

  for (const row of data) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key)
        keys.push(key)
      }
    }
  }

  return keys
}

const addJsonWorksheet = (
  workbook: ExcelJS.Workbook,
  sheetName: string,
  data: RowRecord[]
) => {
  const worksheet = workbook.addWorksheet(sheetName)

  if (data.length === 0) {
    return worksheet
  }

  const columns = getColumnKeys(data)
  worksheet.columns = columns.map((key) => ({ header: key, key }))
  data.forEach((row) => worksheet.addRow(row))

  return worksheet
}

const downloadBlob = (blob: Blob, filename: string) => {
  if (typeof window === "undefined") return

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

/**
 * Export all data to a multi-sheet Excel file
 */
export const exportSelectedDataZip = async ({
  selection,
  filenameBase,
  onProgress,
}: {
  selection: ExportSelection
  filenameBase?: string
  onProgress?: ExportProgressHandler
}) => {
  try {
    if (typeof window === "undefined") return

    const entries = (Object.entries(selection) as [ExportDatasetKey, RowRecord[]][])
      .filter(([, data]) => Array.isArray(data))

    if (entries.length === 0) return

    const updateProgress = (value: number, stage?: string) => {
      onProgress?.(Math.max(0, Math.min(100, Math.round(value))), stage)
    }

    updateProgress(5, "Preparing workbook")
    const workbook = new ExcelJS.Workbook()

    entries.forEach(([key, data], index) => {
      addJsonWorksheet(workbook, DATASET_LABELS[key], data)
      const progress = 10 + ((index + 1) / entries.length) * 40
      updateProgress(progress, `Adding ${DATASET_LABELS[key]} sheet`)
    })

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
    const baseName = filenameBase ?? `dashboard-export-${timestamp}`

    updateProgress(60, "Generating spreadsheet")
    const buffer = await workbook.xlsx.writeBuffer()

    updateProgress(70, "Building export archive")
    const zip = new JSZip()
    zip.file(`${baseName}.xlsx`, buffer)

    const zipBlob = await zip.generateAsync({ type: "blob" }, (metadata) => {
      const percent = 70 + metadata.percent * 0.25
      updateProgress(percent, "Compressing export")
    })

    downloadBlob(new Blob([zipBlob], { type: ZIP_MIME_TYPE }), `${baseName}.zip`)
    updateProgress(100, "Export ready")
  } catch (error) {
    console.error("Error exporting data:", error)
  }
}
