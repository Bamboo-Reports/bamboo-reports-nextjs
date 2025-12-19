import { memo } from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import type { Prospect } from "@/lib/types"

interface ProspectRowProps {
  prospect: Prospect
  onClick: () => void
}

export const ProspectRow = memo(({ prospect, onClick }: ProspectRowProps) => (
  <TableRow
    className="cursor-pointer hover:bg-muted/50 transition-colors"
    onClick={onClick}
  >
    <TableCell>
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-sm font-bold text-primary">
          {prospect["PROSPECT FIRST NAME"]?.[0]}{prospect["PROSPECT LAST NAME"]?.[0]}
        </span>
      </div>
    </TableCell>
    <TableCell className="font-medium">{prospect["PROSPECT FIRST NAME"]}</TableCell>
    <TableCell>{prospect["PROSPECT LAST NAME"]}</TableCell>
    <TableCell>{prospect["PROSPECT TITLE"]}</TableCell>
    <TableCell>{prospect["ACCOUNT GLOBAL LEGAL NAME"]}</TableCell>
  </TableRow>
))
ProspectRow.displayName = "ProspectRow"
