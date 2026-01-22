import { memo } from "react"
import { ArrowUpRight, CircleCheck, CircleX } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CompanyLogo } from "@/components/ui/company-logo"
import type { Account } from "@/lib/types"

interface AccountGridCardProps {
  account: Account
  onClick: () => void
}

export const AccountGridCard = memo(({ account, onClick }: AccountGridCardProps) => {
  const location = [account.account_hq_city, account.account_hq_country]
    .filter(Boolean)
    .join(", ")
  const accountName = account.account_global_legal_name || "Account"
  const isNasscomVerified = account.account_nasscom_status?.toLowerCase() === "yes"

  return (
    <Card className="h-full">
      <CardContent className="p-4 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <CompanyLogo
            domain={account.account_hq_website}
            companyName={accountName}
            size="md"
            theme="auto"
          />
          <div className="min-w-0">
            <h3
              className="text-base font-semibold text-foreground leading-snug truncate"
              title={accountName}
            >
              {accountName}
            </h3>
            <p
              className="text-sm text-muted-foreground mt-1 truncate"
              title={location || account.account_hq_country || "-"}
            >
              {location || account.account_hq_country || "-"}
            </p>
            <div
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
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
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <span className="text-muted-foreground">Industry</span>
            <span
              className="font-medium text-foreground text-right truncate max-w-[160px]"
              title={account.account_hq_industry || "-"}
            >
              {account.account_hq_industry || "-"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 min-w-0">
            <span className="text-muted-foreground">Revenue</span>
            <span
              className="font-medium text-foreground text-right truncate max-w-[160px]"
              title={account.account_hq_revenue_range || "-"}
            >
              {account.account_hq_revenue_range || "-"}
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClick}
          className="w-full justify-between bg-foreground text-background border-foreground hover:bg-foreground/90 hover:text-background"
        >
          View Details
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
})

AccountGridCard.displayName = "AccountGridCard"
