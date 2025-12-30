"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CentersMap } from "@/components/maps/centers-map"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
  Building,
  UserCircle,
} from "lucide-react"
import { formatRevenueInMillions, parseRevenue } from "@/lib/utils/helpers"
import type { Account, Center, Prospect, Service } from "@/lib/types"
import { CompanyLogo } from "@/components/ui/company-logo"
import { CenterDetailsDialog } from "./center-details-dialog"
import { ProspectDetailsDialog } from "./prospect-details-dialog"
import { Badge } from "@/components/ui/badge"

interface AccountDetailsDialogProps {
  account: Account | null
  centers: Center[]
  prospects: Prospect[]
  services: Service[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountDetailsDialog({
  account,
  centers,
  prospects,
  services,
  open,
  onOpenChange,
}: AccountDetailsDialogProps) {
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null)
  const [isCenterDialogOpen, setIsCenterDialogOpen] = useState(false)
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null)
  const [isProspectDialogOpen, setIsProspectDialogOpen] = useState(false)

  if (!account) return null

  // Filter centers and prospects for this account
  const accountCenters = centers.filter(
    (center) => center.account_global_legal_name === account.account_global_legal_name
  )
  const accountProspects = prospects.filter(
    (prospect) => prospect.account_global_legal_name === account.account_global_legal_name
  )

  // Merge city and country for location
  const location = [account.account_hq_city, account.account_hq_country]
    .filter(Boolean)
    .join(", ")

  const InfoRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any
    label: string
    value: string | number | null | undefined
  }) => {
    if (value === null || value === undefined) return null

    const displayValue = typeof value === "number" ? value.toString() : value
    if (displayValue.trim() === "") return null

    return (
      <div className="flex items-start gap-3 p-3 rounded-lg bg-background/40 backdrop-blur-sm border border-border/50 hover:border-border transition-colors dark:bg-white/5 dark:border-white/10 dark:backdrop-blur-md dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <div className="mt-0.5">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
          <p className="text-sm font-medium break-words whitespace-pre-line">{displayValue}</p>
        </div>
      </div>
    )
  }

  const handleCenterClick = (center: Center) => {
    setSelectedCenter(center)
    setIsCenterDialogOpen(true)
  }

  const handleProspectClick = (prospect: Prospect) => {
    setSelectedProspect(prospect)
    setIsProspectDialogOpen(true)
  }

  // Get status indicator color
  const getStatusColor = (status: string) => {
    if (status === "Active Center") return "bg-green-500"
    if (status === "Upcoming") return "bg-yellow-500"
    if (status === "Non Operational") return "bg-red-500"
    return "bg-gray-500"
  }

  return (
    <>
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

          <Tabs defaultValue="info" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Account Info
              </TabsTrigger>
              <TabsTrigger value="centers" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Centers
                <Badge variant="secondary" className="ml-1">
                  {accountCenters.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="prospects" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Prospects
                <Badge variant="secondary" className="ml-1">
                  {accountProspects.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Account Info Tab */}
            <TabsContent value="info" className="space-y-6 mt-4">
              {/* Company Overview Section */}
              {(account.account_hq_company_type || account.account_about || account.account_hq_key_offerings) && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Company Overview
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                    <div className="grid grid-cols-1 gap-3">
                      <InfoRow
                        icon={Building2}
                        label="Account Type"
                        value={account.account_hq_company_type}
                      />
                      <InfoRow
                        icon={Building2}
                        label="About"
                        value={account.account_about}
                      />
                      <InfoRow
                        icon={Package}
                        label="Key Offerings"
                        value={account.account_hq_key_offerings}
                      />
                    </div>
                    <div className="w-full">
                      <CentersMap centers={accountCenters} heightClass="h-[320px] lg:h-[420px]" />
                    </div>
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
                    value={account.account_hq_region}
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
                    value={account.account_hq_industry}
                  />
                  <InfoRow
                    icon={Briefcase}
                    label="Sub Industry"
                    value={account.account_hq_sub_industry}
                  />
                  <InfoRow
                    icon={TrendingUp}
                    label="Primary Category"
                    value={account.account_primary_category}
                  />
                  <InfoRow
                    icon={TrendingUp}
                    label="Primary Nature"
                    value={account.account_primary_nature}
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
                    value={formatRevenueInMillions(parseRevenue(account.account_hq_revenue))}
                  />
                  <InfoRow
                    icon={DollarSign}
                    label="Revenue Range"
                    value={account.account_hq_revenue_range}
                  />
                  <InfoRow
                    icon={Users}
                    label="Total Employees"
                    value={account.account_hq_employee_count}
                  />
                  <InfoRow
                    icon={Users}
                    label="Employees Range"
                    value={account.account_hq_employee_range}
                  />
                  <InfoRow
                    icon={Users}
                    label="Center Employees Range"
                    value={account.account_center_employees_range}
                  />
                </div>
              </div>

              {/* Rankings & Recognition Section */}
              {(account.account_hq_forbes_2000_rank || account.account_hq_fortune_500_rank || account.account_nasscom_status) && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Rankings & Recognition
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InfoRow
                      icon={Award}
                      label="Forbes Ranking"
                      value={account.account_hq_forbes_2000_rank}
                    />
                    <InfoRow
                      icon={Award}
                      label="Fortune Ranking"
                      value={account.account_hq_fortune_500_rank}
                    />
                    <InfoRow
                      icon={Award}
                      label="NASSCOM Status"
                      value={account.account_nasscom_status}
                    />
                  </div>
                </div>
              )}

              {/* India Operations Section */}
              {(account.account_first_center_year || account.years_in_india) && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    India Operations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InfoRow
                      icon={Calendar}
                      label="First Center Established"
                      value={account.account_first_center_year}
                    />
                    <InfoRow
                      icon={Calendar}
                      label="Years in India"
                      value={account.years_in_india}
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Centers Tab */}
            <TabsContent value="centers" className="mt-4">
              {accountCenters.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No centers found for this account</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {accountCenters.map((center, index) => (
                    <div
                      key={`${center.cn_unique_key}-${index}`}
                      className="p-4 rounded-lg bg-background/40 backdrop-blur-sm border border-border/50 hover:border-border hover:bg-background/60 transition-all cursor-pointer dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 dark:backdrop-blur-md dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
                      onClick={() => handleCenterClick(center)}
                    >
                      <div className="flex items-start gap-3">
                        <CompanyLogo
                          domain={center.center_account_website}
                          companyName={center.account_global_legal_name}
                          size="sm"
                          theme="auto"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-base">{center.center_name}</h4>
                            <div
                              className={`h-2 w-2 rounded-full ${getStatusColor(center.center_status)}`}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{center.center_city}, {center.center_state}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Building className="h-3.5 w-3.5" />
                              <span>{center.center_type}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Users className="h-3.5 w-3.5" />
                              <span>{center.center_employees} employees</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Prospects Tab */}
            <TabsContent value="prospects" className="mt-4">
              {accountProspects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <UserCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No prospects found for this account</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {accountProspects.map((prospect, index) => (
                    <div
                      key={`${prospect.prospect_first_name}-${prospect.prospect_last_name}-${index}`}
                      className="p-4 rounded-lg bg-background/40 backdrop-blur-sm border border-border/50 hover:border-border hover:bg-background/60 transition-all cursor-pointer dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 dark:backdrop-blur-md dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
                      onClick={() => handleProspectClick(prospect)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">
                            {prospect.prospect_first_name?.[0]}{prospect.prospect_last_name?.[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base mb-1">
                            {prospect.prospect_first_name} {prospect.prospect_last_name}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Briefcase className="h-3.5 w-3.5" />
                              <span className="truncate">{prospect.prospect_title}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Users className="h-3.5 w-3.5" />
                              <span className="truncate">{prospect.prospect_department}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Award className="h-3.5 w-3.5" />
                              <span className="truncate">{prospect.prospect_level}</span>
                            </div>
                          </div>
                          {prospect.center_name && (
                            <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                              <Building className="h-3.5 w-3.5" />
                              <span className="truncate">{prospect.center_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Center Details Dialog */}
      <CenterDetailsDialog
        center={selectedCenter}
        services={services}
        open={isCenterDialogOpen}
        onOpenChange={setIsCenterDialogOpen}
      />

      {/* Prospect Details Dialog */}
      <ProspectDetailsDialog
        prospect={selectedProspect}
        open={isProspectDialogOpen}
        onOpenChange={setIsProspectDialogOpen}
      />
    </>
  )
}
