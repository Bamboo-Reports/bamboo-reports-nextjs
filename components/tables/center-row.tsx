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
    <TableCell className="font-medium">{center["ACCOUNT NAME"]}</TableCell>
    <TableCell>{center["CENTER NAME"]}</TableCell>
    <TableCell>{center["CENTER TYPE"]}</TableCell>
    <TableCell>{center["CENTER EMPLOYEES RANGE"]}</TableCell>
  </TableRow>
))
CenterRow.displayName = "CenterRow"
