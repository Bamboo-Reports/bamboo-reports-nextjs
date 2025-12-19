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

interface CenterDetailsDialogProps {
  center: Center | null
  services: Service[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CenterDetailsDialog({
  center,
  services,
  open,
  onOpenChange,
}: CenterDetailsDialogProps) {
  if (!center) return null

  // Find services for this center
  const centerServices = services.find(
    (service) => service["CN UNIQUE KEY"] === center["CN UNIQUE KEY"]
  )

  // Status indicator color and glow
  const getStatusColor = (status: string) => {
    if (status === "Active Center") return "bg-green-500"
    if (status === "Upcoming") return "bg-yellow-500"
    if (status === "Non Operational") return "bg-red-500"
    return "bg-gray-500"
  }

  const getStatusGlow = (status: string) => {
    if (status === "Active Center") return "shadow-[0_0_10px_rgba(34,197,94,0.5)]"
    if (status === "Upcoming") return "shadow-[0_0_10px_rgba(234,179,8,0.5)]"
    if (status === "Non Operational") return "shadow-[0_0_10px_rgba(239,68,68,0.5)]"
    return ""
  }

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    link
  }: {
    icon: any
    label: string
    value: string | undefined
    link?: string
  }) => {
    if (!value) return null

    return (
      <div className="flex items-start gap-3 p-3 rounded-lg bg-background/40 backdrop-blur-sm border border-border/50 hover:border-border transition-colors">
        <div className="mt-0.5">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline break-words"
            >
              {value}
            </a>
          ) : (
            <p className="text-sm font-medium break-words">{value}</p>
          )}
        </div>
      </div>
    )
  }

  const ServiceSection = ({
    icon: Icon,
    title,
    content,
  }: {
    icon: any
    title: string
    content: string | undefined
  }) => {
    if (!content || content.trim() === "" || content === "-") return null

    return (
      <div className="p-4 rounded-lg bg-background/40 backdrop-blur-sm border border-border/50">
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[85vw] max-h-[90vh] overflow-y-auto glassmorphism-dialog">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <CompanyLogo
              domain={center["CENTER WEBSITE"]}
              companyName={center["ACCOUNT GLOBAL LEGAL NAME"]}
              size="md"
              theme="auto"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span>{center["CENTER NAME"]}</span>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${getStatusColor(center["CENTER STATUS"] || "")} ${getStatusGlow(center["CENTER STATUS"] || "")}`}
                  />
                  <span className="text-sm font-normal text-muted-foreground">
                    {center["CENTER STATUS"]}
                  </span>
                </div>
              </div>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                {center["ACCOUNT GLOBAL LEGAL NAME"]}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Center Information Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Center Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InfoRow
                icon={Building2}
                label="Center Type"
                value={center["CENTER TYPE"]}
              />
              <InfoRow
                icon={Target}
                label="Center Focus"
                value={center["CENTER FOCUS"]}
              />
              <InfoRow
                icon={Calendar}
                label="Incorporation Year"
                value={center["CENTER INC YEAR"]}
              />
              <InfoRow
                icon={Users}
                label="Employees"
                value={center["CENTER EMPLOYEES"]}
              />
              <InfoRow
                icon={Users}
                label="Employee Range"
                value={center["CENTER EMPLOYEES RANGE"]}
              />
              <InfoRow
                icon={Phone}
                label="Boardline Number"
                value={center["CENTER BOARDLINE"]}
              />
            </div>
          </div>

          {/* Location Information Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InfoRow
                icon={MapPin}
                label="City"
                value={center["CENTER CITY"]}
              />
              <InfoRow
                icon={MapPin}
                label="State"
                value={center["CENTER STATE"]}
              />
              <InfoRow
                icon={Globe}
                label="Country"
                value={center["CENTER COUNTRY"]}
              />
            </div>
          </div>

          {/* Business Information Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InfoRow
                icon={Briefcase}
                label="Business Segment"
                value={center["CENTER BUSINESS SEGMENT"]}
              />
              <InfoRow
                icon={Briefcase}
                label="Business Sub-Segment"
                value={center["CENTER BUSINESS SUB-SEGMENT"]}
              />
            </div>
          </div>

          {/* Services Section */}
          {centerServices && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Services Offered
              </h3>

              {/* Primary Service and Focus Region */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <InfoRow
                  icon={Target}
                  label="Primary Service"
                  value={centerServices["PRIMARY SERVICE"]}
                />
                <InfoRow
                  icon={Globe}
                  label="Focus Region"
                  value={centerServices["FOCUS REGION"]}
                />
              </div>

              {/* Service Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ServiceSection
                  icon={Code}
                  title="IT Services"
                  content={centerServices.IT}
                />
                <ServiceSection
                  icon={Lightbulb}
                  title="ER&D Services"
                  content={centerServices["ER&D"]}
                />
                <ServiceSection
                  icon={DollarSign}
                  title="Finance & Accounting"
                  content={centerServices.FnA}
                />
                <ServiceSection
                  icon={UserCog}
                  title="HR Services"
                  content={centerServices.HR}
                />
                <ServiceSection
                  icon={ShoppingCart}
                  title="Procurement"
                  content={centerServices.PROCUREMENT}
                />
                <ServiceSection
                  icon={TrendingUp}
                  title="Sales & Marketing"
                  content={centerServices["SALES & MARKETING"]}
                />
                <ServiceSection
                  icon={Headphones}
                  title="Customer Support"
                  content={centerServices["CUSTOMER SUPPORT"]}
                />
                <ServiceSection
                  icon={MoreHorizontal}
                  title="Other Services"
                  content={centerServices.OTHERS}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
