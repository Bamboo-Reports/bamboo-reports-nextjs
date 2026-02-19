import { memo } from "react"
import { CircleCheck, CircleX } from "lucide-react"
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
  const isNasscomVerified = account.account_nasscom_status?.toLowerCase() === "yes"
  const accountName = account.account_global_legal_name || "account"

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 transition-colors focus-visible:bg-muted/70"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onClick()
        }
      }}
      tabIndex={0}
      aria-label={`View account details for ${accountName}`}
    >
      <TableCell className="font-medium max-w-[280px]">
        <div className="flex items-center gap-3">
          <CompanyLogo
            domain={account.account_hq_website}
            companyName={accountName}
            size="sm"
            theme="auto"
          />
          <div className="min-w-0">
            <div className="truncate" title={accountName}>
              {accountName}
            </div>
            <div
              className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                isNasscomVerified
                  ? "bg-green-500/15 text-green-700 dark:text-green-300"
                  : "bg-red-500/15 text-red-700 dark:text-red-300"
              }`}
              title={isNasscomVerified ? "NASSCOM listed" : "Not listed in NASSCOM"}
            >
              {isNasscomVerified ? (
                <CircleCheck className="h-3 w-3" aria-hidden="true" />
              ) : (
                <CircleX className="h-3 w-3" aria-hidden="true" />
              )}
              NASSCOM
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="max-w-[200px]">
        <div className="truncate" title={location || account.account_hq_country || "N/A"}>
          {location || account.account_hq_country || "N/A"}
        </div>
      </TableCell>
      <TableCell className="max-w-[220px]">
        <div className="truncate" title={account.account_hq_industry || "N/A"}>
          {account.account_hq_industry || "N/A"}
        </div>
      </TableCell>
      <TableCell className="max-w-[140px]">
        <div className="truncate" title={account.account_hq_revenue_range || "N/A"}>
          {account.account_hq_revenue_range || "N/A"}
        </div>
      </TableCell>
    </TableRow>
  )
})
AccountRow.displayName = "AccountRow"
