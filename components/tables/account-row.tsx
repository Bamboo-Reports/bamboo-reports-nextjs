import { memo } from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import type { Account } from "@/lib/types"
import { CompanyLogo } from "@/components/ui/company-logo"

interface AccountRowProps {
  account: Account
  onClick: () => void
}

export const AccountRow = memo(({ account, onClick }: AccountRowProps) => {
  const location = [account["ACCOUNT HQ CITY"], account["ACCOUNT HQ COUNTRY"]]
    .filter(Boolean)
    .join(", ")

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <CompanyLogo
            domain={account["ACCOUNT HQ WEBSITE"]}
            companyName={account["ACCOUNT GLOBAL LEGAL NAME"]}
            size="sm"
            theme="auto"
          />
          <span>{account["ACCOUNT GLOBAL LEGAL NAME"]}</span>
        </div>
      </TableCell>
      <TableCell>{location || account["ACCOUNT HQ COUNTRY"]}</TableCell>
      <TableCell>{account["ACCOUNT HQ INDUSTRY"]}</TableCell>
      <TableCell>{account["ACCOUNT HQ REVENUE RANGE"]}</TableCell>
    </TableRow>
  )
})
AccountRow.displayName = "AccountRow"
