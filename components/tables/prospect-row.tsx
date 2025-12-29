import { memo } from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import type { Prospect } from "@/lib/types"

interface ProspectRowProps {
  prospect: Prospect
  onClick: () => void
}

export const ProspectRow = memo(({ prospect, onClick }: ProspectRowProps) => {
  const fullName =
    prospect.prospect_full_name ||
    [prospect.prospect_first_name, prospect.prospect_last_name].filter(Boolean).join(" ")
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <TableCell>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">
            {initials}
          </span>
        </div>
      </TableCell>
      <TableCell className="font-medium">{fullName || "N/A"}</TableCell>
      <TableCell>
        {[prospect.prospect_city, prospect.prospect_country].filter(Boolean).join(", ") || "N/A"}
      </TableCell>
      <TableCell>{prospect.prospect_title}</TableCell>
      <TableCell>{prospect.prospect_department}</TableCell>
    </TableRow>
  )
})
ProspectRow.displayName = "ProspectRow"
