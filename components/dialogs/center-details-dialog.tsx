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
  Users,
  Calendar,
  Target,
  Briefcase,
  Phone,
  Globe,
  Code,
  Lightbulb,
  DollarSign,
  UserCog,
  ShoppingCart,
  TrendingUp,
  Headphones,
  MoreHorizontal,
} from "lucide-react"
import type { Center, Service } from "@/lib/types"
import { CompanyLogo } from "@/components/ui/company-logo"
import { InfoRow } from "@/components/ui/info-row"

interface CenterDetailsDialogProps {
  center: Center | null
  services: Service[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

type InfoRowConfig = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number | null | undefined
}

type ServiceSectionConfig = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  content?: string | null
}

const STATUS_COLORS: Record<string, string> = {
  "Active Center": "bg-green-500",
  Upcoming: "bg-yellow-500",
  "Non Operational": "bg-red-500",
}

const STATUS_GLOWS: Record<string, string> = {
  "Active Center": "shadow-[0_0_10px_rgba(34,197,94,0.5)]",
  Upcoming: "shadow-[0_0_10px_rgba(234,179,8,0.5)]",
  "Non Operational": "shadow-[0_0_10px_rgba(239,68,68,0.5)]",
}

const isPresent = (value: string | number | null | undefined): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === "number") return true
  const trimmed = value.trim()
  return trimmed !== "" && trimmed !== "-"
}

const renderInfoRows = (rows: InfoRowConfig[]): Array<JSX.Element> =>
  rows.map((row) => (
    <InfoRow key={row.label} icon={row.icon} label={row.label} value={row.value} />
  ))

const ServiceSection = ({ icon: Icon, title, content }: ServiceSectionConfig): JSX.Element | null => {
  if (!content || content.trim() === "" || content === "-") return null

  return (
    <div className="p-4 rounded-lg bg-background/40 backdrop-blur-sm border border-border/50 dark:bg-white/5 dark:border-white/10 dark:backdrop-blur-md dark:shadow-[0_10px_32px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-primary" />
        <h4 className="font-semibold text-sm">{title}</h4>
      </div>
      <div className="text-sm text-muted-foreground whitespace-pre-line">
        {content}
      </div>
    </div>
  )
}

export function CenterDetailsDialog({
  center,
  services,
  open,
  onOpenChange,
}: CenterDetailsDialogProps): JSX.Element | null {
  if (!center) return null

  const centerServices = services.find(
    (service) => service.cn_unique_key === center.cn_unique_key
  )

  const statusColor = STATUS_COLORS[center.center_status ?? ""] ?? "bg-gray-500"
  const statusGlow = STATUS_GLOWS[center.center_status ?? ""] ?? ""

  const centerInfoRows: InfoRowConfig[] = [
    { icon: Building2, label: "Center Type", value: center.center_type },
    { icon: Target, label: "Center Focus", value: center.center_focus },
    { icon: Calendar, label: "Incorporation Year", value: center.center_inc_year },
    { icon: Users, label: "Employees", value: center.center_employees },
    { icon: Users, label: "Employee Range", value: center.center_employees_range },
    { icon: Phone, label: "Boardline Number", value: center.center_boardline },
  ]

  const locationRows: InfoRowConfig[] = [
    { icon: MapPin, label: "City", value: center.center_city },
    { icon: MapPin, label: "State", value: center.center_state },
    { icon: Globe, label: "Country", value: center.center_country },
  ]

  const businessRows: InfoRowConfig[] = [
    { icon: Briefcase, label: "Business Segment", value: center.center_business_segment },
    { icon: Briefcase, label: "Business Sub-Segment", value: center.center_business_sub_segment },
  ]

  const hasBusinessInfo = businessRows.some((row) => isPresent(row.value))

  const serviceSections: ServiceSectionConfig[] = centerServices
    ? [
        { icon: Code, title: "IT Services", content: centerServices.service_it },
        { icon: Lightbulb, title: "ER&D Services", content: centerServices.service_erd },
        { icon: DollarSign, title: "Finance & Accounting", content: centerServices.service_fna },
        { icon: UserCog, title: "HR Services", content: centerServices.service_hr },
        { icon: ShoppingCart, title: "Procurement", content: centerServices.service_procurement },
        { icon: TrendingUp, title: "Sales & Marketing", content: centerServices.service_sales_marketing },
        { icon: Headphones, title: "Customer Support", content: centerServices.service_customer_support },
        { icon: MoreHorizontal, title: "Other Services", content: centerServices.service_others },
      ]
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[85vw] max-h-[90vh] overflow-y-auto glassmorphism-dialog">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <CompanyLogo
              domain={center.center_account_website}
              companyName={center.account_global_legal_name}
              size="md"
              theme="auto"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span>{center.center_name}</span>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${statusColor} ${statusGlow}`}
                  />
                  <span className="text-sm font-normal text-muted-foreground">
                    {center.center_status}
                  </span>
                </div>
              </div>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                {center.account_global_legal_name}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Center Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {renderInfoRows(centerInfoRows)}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {renderInfoRows(locationRows)}
            </div>
          </div>

          {hasBusinessInfo && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {renderInfoRows(businessRows)}
              </div>
            </div>
          )}

          {centerServices && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Services Offered
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <InfoRow
                  icon={Target}
                  label="Primary Service"
                  value={centerServices.primary_service}
                />
                <InfoRow
                  icon={Globe}
                  label="Focus Region"
                  value={centerServices.focus_region}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceSections.map((section) => (
                  <ServiceSection key={section.title} {...section} />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
