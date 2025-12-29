import { memo } from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import type { Center } from "@/lib/types"

interface CenterRowProps {
  center: Center
  onClick: () => void
}

export const CenterRow = memo(({ center, onClick }: CenterRowProps) => (
  <TableRow
    className="cursor-pointer hover:bg-muted/50 transition-colors"
    onClick={onClick}
  >
    <TableCell className="font-medium">{center.center_name}</TableCell>
    <TableCell>
      {[center.center_city, center.center_country].filter(Boolean).join(", ") || "N/A"}
    </TableCell>
    <TableCell>{center.center_type}</TableCell>
    <TableCell>{center.center_employees_range}</TableCell>
  </TableRow>
))
CenterRow.displayName = "CenterRow"
