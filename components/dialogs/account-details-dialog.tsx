"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Building2,
  MapPin,
  Globe,
  Briefcase,
  DollarSign,
  Users,
  Award,
  TrendingUp,
  Calendar,
  Package,
  Info,
} from "lucide-react"
import { formatRevenueInMillions, parseRevenue } from "@/lib/utils/helpers"
import type { Account } from "@/lib/types"
import { CompanyLogo } from "@/components/ui/company-logo"
import { InfoRow } from "@/components/ui/info-row"

interface AccountDetailsDialogProps {
  account: Account | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

type InfoRowConfig = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number | null | undefined
}

const buildLocation = (account: Account): string =>
  [account.account_hq_city, account.account_hq_country].filter(Boolean).join(", ")

const hasValue = (value: string | number | null | undefined): boolean => {
  if (value === null || value === undefined) return false
  return String(value).trim() !== ""
}

const renderInfoRows = (rows: InfoRowConfig[]): Array<JSX.Element> =>
  rows.map((row) => (
    <InfoRow key={row.label} icon={row.icon} label={row.label} value={row.value} />
  ))

export function AccountDetailsDialog({
  account,
  open,
  onOpenChange,
}: AccountDetailsDialogProps): JSX.Element | null {
  if (!account) return null

  const location = buildLocation(account)

  const companyOverviewRows: InfoRowConfig[] = [
    { icon: Building2, label: "Account Type", value: account.account_hq_company_type },
    { icon: Building2, label: "About", value: account.account_about },
    { icon: Package, label: "Key Offerings", value: account.account_hq_key_offerings },
  ]

  const locationRows: InfoRowConfig[] = [
    { icon: MapPin, label: "Location", value: location },
    { icon: Globe, label: "Region", value: account.account_hq_region },
  ]

  const industryRows: InfoRowConfig[] = [
    { icon: Briefcase, label: "Industry", value: account.account_hq_industry },
    { icon: Briefcase, label: "Sub Industry", value: account.account_hq_sub_industry },
    { icon: TrendingUp, label: "Primary Category", value: account.account_primary_category },
    { icon: TrendingUp, label: "Primary Nature", value: account.account_primary_nature },
  ]

  const businessMetricRows: InfoRowConfig[] = [
    { icon: DollarSign, label: "Revenue (in Millions)", value: formatRevenueInMillions(parseRevenue(account.account_hq_revenue)) },
    { icon: DollarSign, label: "Revenue Range", value: account.account_hq_revenue_range },
    { icon: Users, label: "Total Employees", value: account.account_hq_employee_count },
    { icon: Users, label: "Employees Range", value: account.account_hq_employee_range },
    { icon: Users, label: "Center Employees Range", value: account.account_center_employees_range },
  ]

  const rankingRows: InfoRowConfig[] = [
    { icon: Award, label: "Forbes Ranking", value: account.account_hq_forbes_2000_rank },
    { icon: Award, label: "Fortune Ranking", value: account.account_hq_fortune_500_rank },
    { icon: Award, label: "NASSCOM Status", value: account.account_nasscom_status },
  ]

  const indiaOperationsRows: InfoRowConfig[] = [
    { icon: Calendar, label: "First Center Established", value: account.account_first_center_year },
    { icon: Calendar, label: "Years in India", value: account.years_in_india },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[85vw] max-h-[90vh] overflow-y-auto glassmorphism-dialog">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <CompanyLogo
              domain={account.account_hq_website}
              companyName={account.account_global_legal_name}
              size="md"
              theme="auto"
            />
            <div className="flex-1">
              <div>{account.account_global_legal_name}</div>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                {location || account.account_hq_region}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {companyOverviewRows.some((row) => hasValue(row.value)) && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Company Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {renderInfoRows(companyOverviewRows.slice(0, 1))}
              </div>
              <div className="grid grid-cols-1 gap-3 mt-3">
                {renderInfoRows(companyOverviewRows.slice(1))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {renderInfoRows(locationRows)}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Industry Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {renderInfoRows(industryRows)}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Business Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {renderInfoRows(businessMetricRows)}
            </div>
          </div>

          {rankingRows.some((row) => hasValue(row.value)) && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Rankings & Recognition
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {renderInfoRows(rankingRows)}
              </div>
            </div>
          )}

          {indiaOperationsRows.some((row) => hasValue(row.value)) && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                India Operations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {renderInfoRows(indiaOperationsRows)}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
