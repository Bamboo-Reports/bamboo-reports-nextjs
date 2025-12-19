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

interface AccountDetailsDialogProps {
  account: Account | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountDetailsDialog({
  account,
  open,
  onOpenChange,
}: AccountDetailsDialogProps) {
  if (!account) return null

  // Merge city and country for location
  const location = [account["ACCOUNT HQ CITY"], account["ACCOUNT HQ COUNTRY"]]
    .filter(Boolean)
    .join(", ")

  const InfoRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any
    label: string
    value: string | undefined
  }) => {
    if (!value || value.trim() === "") return null

    return (
      <div className="flex items-start gap-3 p-3 rounded-lg bg-background/40 backdrop-blur-sm border border-border/50 hover:border-border transition-colors">
        <div className="mt-0.5">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
          <p className="text-sm font-medium break-words whitespace-pre-line">{value}</p>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[85vw] max-h-[90vh] overflow-y-auto glassmorphism-dialog">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <CompanyLogo
              domain={account["ACCOUNT HQ WEBSITE"]}
              companyName={account["ACCOUNT GLOBAL LEGAL NAME"]}
              size="md"
              theme="auto"
            />
            <div className="flex-1">
              <div>{account["ACCOUNT GLOBAL LEGAL NAME"]}</div>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                {location || account["ACCOUNT HQ REGION"]}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Company Overview Section */}
          {(account["ACCOUNT HQ COMPANY TYPE"] || account["ACCOUNT ABOUT"] || account["ACCOUNT HQ KEY OFFERINGS"]) && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Company Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoRow
                  icon={Building2}
                  label="Account Type"
                  value={account["ACCOUNT HQ COMPANY TYPE"]}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 mt-3">
                <InfoRow
                  icon={Building2}
                  label="About"
                  value={account["ACCOUNT ABOUT"]}
                />
                <InfoRow
                  icon={Package}
                  label="Key Offerings"
                  value={account["ACCOUNT HQ KEY OFFERINGS"]}
                />
              </div>
            </div>
          )}

          {/* Location Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InfoRow
                icon={MapPin}
                label="Location"
                value={location}
              />
              <InfoRow
                icon={Globe}
                label="Region"
                value={account["ACCOUNT HQ REGION"]}
              />
            </div>
          </div>

          {/* Industry Information Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Industry Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InfoRow
                icon={Briefcase}
                label="Industry"
                value={account["ACCOUNT HQ INDUSTRY"]}
              />
              <InfoRow
                icon={Briefcase}
                label="Sub Industry"
                value={account["ACCOUNT HQ SUB INDUSTRY"]}
              />
              <InfoRow
                icon={TrendingUp}
                label="Primary Category"
                value={account["ACCOUNT PRIMARY CATEGORY"]}
              />
              <InfoRow
                icon={TrendingUp}
                label="Primary Nature"
                value={account["ACCOUNT PRIMARY NATURE"]}
              />
            </div>
          </div>

          {/* Business Metrics Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Business Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InfoRow
                icon={DollarSign}
                label="Revenue (in Millions)"
                value={formatRevenueInMillions(parseRevenue(account["ACCOUNT HQ REVNUE"] || 0))}
              />
              <InfoRow
                icon={DollarSign}
                label="Revenue Range"
                value={account["ACCOUNT HQ REVENUE RANGE"]}
              />
              <InfoRow
                icon={Users}
                label="Total Employees"
                value={account["ACCOUNT HQ EMPLOYEE COUNT"]}
              />
              <InfoRow
                icon={Users}
                label="Employees Range"
                value={account["ACCOUNT HQ EMPLOYEE RANGE"]}
              />
              <InfoRow
                icon={Users}
                label="Center Employees"
                value={account["ACCOUNT CENTER EMPLOYEES RANGE"]}
              />
            </div>
          </div>

          {/* Rankings & Recognition Section */}
          {(account["ACCOUNT HQ FORBES 2000 RANK"] || account["ACCOUNT HQ FORTUNE 500 RANK"] || account["ACCOUNT NASSCOM STATUS"]) && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Rankings & Recognition
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoRow
                  icon={Award}
                  label="Forbes 2000 Ranking"
                  value={account["ACCOUNT HQ FORBES 2000 RANK"]?.toString()}
                />
                <InfoRow
                  icon={Award}
                  label="Fortune 500 Ranking"
                  value={account["ACCOUNT HQ FORTUNE 500 RANK"]}
                />
                <InfoRow
                  icon={Award}
                  label="NASSCOM Status"
                  value={account["ACCOUNT NASSCOM STATUS"]}
                />
              </div>
            </div>
          )}

          {/* India Operations Section */}
          {(account["ACCOUNT FIRST CENTER"] || account["YEARS IN INDIA"]) && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                India Operations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoRow
                  icon={Calendar}
                  label="First Center Established"
                  value={account["ACCOUNT FIRST CENTER"]}
                />
                <InfoRow
                  icon={Calendar}
                  label="Years in India"
                  value={account["YEARS IN INDIA"]}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
