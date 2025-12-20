import { memo } from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import type { Center } from "@/lib/types"
import { CompanyLogo } from "@/components/ui/company-logo"

interface CenterRowProps {
  center: Center
  onClick: () => void
}

export const CenterRow = memo(({ center, onClick }: CenterRowProps) => (
  <TableRow
    className="cursor-pointer hover:bg-muted/50 transition-colors"
    onClick={onClick}
  >
    <TableCell className="font-medium">
      <div className="flex items-center gap-3">
        <CompanyLogo
          domain={center.center_account_website}
          companyName={center.account_global_legal_name}
          size="sm"
          theme="auto"
        />
        <span>{center.account_global_legal_name}</span>
      </div>
    </TableCell>
    <TableCell>{center.center_name}</TableCell>
    <TableCell>{center.center_type}</TableCell>
    <TableCell>{center.center_employees_range}</TableCell>
  </TableRow>
))
CenterRow.displayName = "CenterRow"
