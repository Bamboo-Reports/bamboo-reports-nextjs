import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
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

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`View ${accountName} details`}
    >
      <Card className="h-full transition-colors hover:bg-muted/40 hover:border-muted-foreground/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CompanyLogo
              domain={account.account_hq_website}
              companyName={accountName}
              size="md"
              theme="auto"
            />
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground leading-snug break-words">
                {accountName}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {location || account.account_hq_country || "-"}
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Industry</span>
              <span className="font-medium text-foreground text-right">
                {account.account_hq_industry || "-"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Revenue</span>
              <span className="font-medium text-foreground text-right">
                {account.account_hq_revenue_range || "-"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  )
})

AccountGridCard.displayName = "AccountGridCard"
