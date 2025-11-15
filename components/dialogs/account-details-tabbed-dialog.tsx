"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
    (center) => center["ACCOUNT NAME"] === account["ACCOUNT NAME"]
  )
  const accountProspects = prospects.filter(
    (prospect) => prospect["ACCOUNT NAME"] === account["ACCOUNT NAME"]
  )

  // Merge city and country for location
  const location = [account["ACCOUNT CITY"], account["ACCOUNT COUNTRY"]]
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
                domain={account["ACCOUNT WEBSITE"]}
                companyName={account["ACCOUNT NAME"]}
                size="md"
                theme="auto"
              />
              <div className="flex-1">
                <div>{account["ACCOUNT NAME"]}</div>
                <p className="text-sm font-normal text-muted-foreground mt-1">
                  {location || account["ACCOUNT REGION"]}
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
              {(account["ACCOUNT TYPE"] || account["ACCOUNT ABOUT"] || account["ACCOUNT KEY OFFERINGS"]) && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Company Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InfoRow
                      icon={Building2}
                      label="Account Type"
                      value={account["ACCOUNT TYPE"]}
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
                      value={account["ACCOUNT KEY OFFERINGS"]}
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
                    value={account["ACCOUNT REGION"]}
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
                    value={account["ACCOUNT INDUSTRY"]}
                  />
                  <InfoRow
                    icon={Briefcase}
                    label="Sub Industry"
                    value={account["ACCOUNT SUB INDUSTRY"]}
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
                    value={formatRevenueInMillions(parseRevenue(account["ACCOUNT REVNUE"]))}
                  />
                  <InfoRow
                    icon={DollarSign}
                    label="Revenue Range"
                    value={account["ACCOUNT REVENUE RANGE"]}
                  />
                  <InfoRow
                    icon={Users}
                    label="Total Employees"
                    value={account["ACCOUNT EMPLOYEES"]}
                  />
                  <InfoRow
                    icon={Users}
                    label="Employees Range"
                    value={account["ACCOUNT EMPLOYEES RANGE"]}
                  />
                  <InfoRow
                    icon={Users}
                    label="Center Employees"
                    value={account["ACCOUNT CENTER EMPLOYEES"]}
                  />
                </div>
              </div>

              {/* Rankings & Recognition Section */}
              {(account["ACCOUNT FORBES"] || account["ACCOUNT FORTUNE"] || account["ACCOUNT NASSCOM STATUS"]) && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Rankings & Recognition
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InfoRow
                      icon={Award}
                      label="Forbes Ranking"
                      value={account["ACCOUNT FORBES"]}
                    />
                    <InfoRow
                      icon={Award}
                      label="Fortune Ranking"
                      value={account["ACCOUNT FORTUNE"]}
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
                      key={`${center["CN UNIQUE KEY"]}-${index}`}
                      className="p-4 rounded-lg bg-background/40 backdrop-blur-sm border border-border/50 hover:border-border hover:bg-background/60 transition-all cursor-pointer"
                      onClick={() => handleCenterClick(center)}
                    >
                      <div className="flex items-start gap-3">
                        <CompanyLogo
                          domain={center["CENTER ACCOUNT WEBSITE"]}
                          companyName={center["ACCOUNT NAME"]}
                          size="sm"
                          theme="auto"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-base">{center["CENTER NAME"]}</h4>
                            <div
                              className={`h-2 w-2 rounded-full ${getStatusColor(center["CENTER STATUS"])}`}
                            />
                            <span className="text-xs text-muted-foreground">
                              {center["CENTER STATUS"]}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{center["CENTER CITY"]}, {center["CENTER STATE"]}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Building className="h-3.5 w-3.5" />
                              <span>{center["CENTER TYPE"]}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Users className="h-3.5 w-3.5" />
                              <span>{center["CENTER EMPLOYEES"]} employees</span>
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
                      key={`${prospect["FIRST NAME"]}-${prospect["LAST NAME"]}-${index}`}
                      className="p-4 rounded-lg bg-background/40 backdrop-blur-sm border border-border/50 hover:border-border hover:bg-background/60 transition-all cursor-pointer"
                      onClick={() => handleProspectClick(prospect)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">
                            {prospect["FIRST NAME"]?.[0]}{prospect["LAST NAME"]?.[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base mb-1">
                            {prospect["FIRST NAME"]} {prospect["LAST NAME"]}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Briefcase className="h-3.5 w-3.5" />
                              <span className="truncate">{prospect.TITLE}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Users className="h-3.5 w-3.5" />
                              <span className="truncate">{prospect.DEPARTMENT}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Award className="h-3.5 w-3.5" />
                              <span className="truncate">{prospect.LEVEL}</span>
                            </div>
                          </div>
                          {prospect["CENTER NAME"] && (
                            <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                              <Building className="h-3.5 w-3.5" />
                              <span className="truncate">{prospect["CENTER NAME"]}</span>
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
