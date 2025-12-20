import { memo } from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import type { Function } from "@/lib/types"

export const FunctionRow = memo(({ func }: { func: Function }) => (
  <TableRow>
    <TableCell className="text-xs text-muted-foreground">{func.cn_unique_key}</TableCell>
    <TableCell>{func.function_name}</TableCell>
  </TableRow>
))
FunctionRow.displayName = "FunctionRow"
