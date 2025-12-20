import { memo } from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import type { Account } from "@/lib/types"
import { CompanyLogo } from "@/components/ui/company-logo"

interface AccountRowProps {
  account: Account
  onClick: () => void
}

export const AccountRow = memo(({ account, onClick }: AccountRowProps) => {
  const location = [account.account_hq_city, account.account_hq_country]
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
            domain={account.account_hq_website}
            companyName={account.account_global_legal_name}
            size="sm"
            theme="auto"
          />
          <span>{account.account_global_legal_name}</span>
        </div>
      </TableCell>
      <TableCell>{location || account.account_hq_country}</TableCell>
      <TableCell>{account.account_hq_industry}</TableCell>
      <TableCell>{account.account_hq_revenue_range}</TableCell>
    </TableRow>
  )
})
AccountRow.displayName = "AccountRow"
