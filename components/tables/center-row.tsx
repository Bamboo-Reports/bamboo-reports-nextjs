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
          domain={center["CENTER ACCOUNT WEBSITE"]}
          companyName={center["ACCOUNT NAME"]}
          size="sm"
          theme="auto"
        />
        <span>{center["ACCOUNT NAME"]}</span>
      </div>
    </TableCell>
    <TableCell>{center["CENTER NAME"]}</TableCell>
    <TableCell>{center["CENTER TYPE"]}</TableCell>
    <TableCell>{center["CENTER EMPLOYEES RANGE"]}</TableCell>
  </TableRow>
))
CenterRow.displayName = "CenterRow"
