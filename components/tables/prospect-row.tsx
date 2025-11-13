import { memo } from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import type { Prospect } from "@/lib/types"

export const ProspectRow = memo(({ prospect }: { prospect: Prospect }) => (
  <TableRow>
    <TableCell className="font-medium">{prospect["ACCOUNT NAME"]}</TableCell>
    <TableCell>{prospect["CENTER NAME"]}</TableCell>
    <TableCell>{prospect["FIRST NAME"]}</TableCell>
    <TableCell>{prospect["LAST NAME"]}</TableCell>
    <TableCell>{prospect.TITLE}</TableCell>
    <TableCell>{prospect.DEPARTMENT}</TableCell>
    <TableCell>{prospect.LEVEL}</TableCell>
    <TableCell>
      {prospect["LINKEDIN LINK"] && (
        <a
          href={prospect["LINKEDIN LINK"]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          Profile
        </a>
      )}
    </TableCell>
    <TableCell>
      {prospect.EMAIL && (
        <a href={`mailto:${prospect.EMAIL}`} className="text-blue-600 hover:text-blue-800 hover:underline">
          {prospect.EMAIL}
        </a>
      )}
    </TableCell>
    <TableCell>{prospect.CITY}</TableCell>
    <TableCell>{prospect.STATE}</TableCell>
    <TableCell>{prospect.COUNTRY}</TableCell>
  </TableRow>
))
ProspectRow.displayName = "ProspectRow"
