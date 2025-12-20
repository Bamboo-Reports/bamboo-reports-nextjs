import { memo } from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import type { Service } from "@/lib/types"

export const ServiceRow = memo(({ service }: { service: Service }) => (
  <TableRow>
    <TableCell className="text-xs text-muted-foreground">{service.cn_unique_key}</TableCell>
    <TableCell>{service.center_name}</TableCell>
    <TableCell>{service.primary_service}</TableCell>
    <TableCell>{service.focus_region}</TableCell>
    <TableCell>{service.service_it}</TableCell>
    <TableCell>{service.service_erd}</TableCell>
    <TableCell>{service.service_fna}</TableCell>
    <TableCell>{service.service_hr}</TableCell>
    <TableCell>{service.service_procurement}</TableCell>
    <TableCell>{service.service_sales_marketing}</TableCell>
    <TableCell>{service.service_customer_support}</TableCell>
    <TableCell>{service.service_others}</TableCell>
    <TableCell>{service.software_vendor}</TableCell>
    <TableCell>{service.software_in_use}</TableCell>
  </TableRow>
))
ServiceRow.displayName = "ServiceRow"
