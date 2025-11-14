import { memo } from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import type { Account } from "@/lib/types"

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
      <TableCell className="font-medium">{account["ACCOUNT NAME"]}</TableCell>
      <TableCell>{location || account["ACCOUNT COUNTRY"]}</TableCell>
      <TableCell>{account["ACCOUNT INDUSTRY"]}</TableCell>
      <TableCell>{account["ACCOUNT REVENUE RANGE"]}</TableCell>
    </TableRow>
  )
})
AccountRow.displayName = "AccountRow"
