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
          {prospect.prospect_first_name?.[0]}{prospect.prospect_last_name?.[0]}
        </span>
      </div>
    </TableCell>
    <TableCell className="font-medium">{prospect.prospect_first_name}</TableCell>
    <TableCell>{prospect.prospect_last_name}</TableCell>
    <TableCell>{prospect.prospect_title}</TableCell>
    <TableCell>{prospect.account_global_legal_name}</TableCell>
  </TableRow>
))
ProspectRow.displayName = "ProspectRow"
