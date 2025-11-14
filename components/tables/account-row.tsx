import { memo } from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import type { Account } from "@/lib/types"
import { CompanyLogo } from "@/components/ui/company-logo"

interface AccountRowProps {
  account: Account
  onClick: () => void
}

export const AccountRow = memo(({ account, onClick }: AccountRowProps) => {
  const location = [account["ACCOUNT CITY"], account["ACCOUNT COUNTRY"]]
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
            domain={account["ACCOUNT WEBSITE"]}
            companyName={account["ACCOUNT NAME"]}
            size="sm"
            theme="auto"
          />
          <span>{account["ACCOUNT NAME"]}</span>
        </div>
      </TableCell>
      <TableCell>{location || account["ACCOUNT COUNTRY"]}</TableCell>
      <TableCell>{account["ACCOUNT INDUSTRY"]}</TableCell>
      <TableCell>{account["ACCOUNT REVENUE RANGE"]}</TableCell>
    </TableRow>
  )
})
AccountRow.displayName = "AccountRow"
