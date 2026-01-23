import type { Account, Center } from "@/lib/types"
import { parseRevenue } from "@/lib/utils/helpers"

const DEFAULT_RANGE = { min: 0, max: 1000000 }

const getMinMaxRange = (values: number[]) => {
  const validValues = values.filter((value) => Number.isFinite(value) && value > 0)
  if (validValues.length === 0) return DEFAULT_RANGE

  return {
    min: Math.min(...validValues),
    max: Math.max(...validValues),
  }
}

export function calculateBaseRanges(accounts: Account[], centers: Center[]) {
  const revenueRange = getMinMaxRange(
    accounts.map((account) => parseRevenue(account.account_hq_revenue))
  )

  const yearsInIndiaRange = getMinMaxRange(
    accounts.map((account) => Number(account.years_in_india ?? 0))
  )

  const firstCenterYearRange = getMinMaxRange(
    accounts.map((account) => Number(account.account_first_center_year ?? 0))
  )

  const centerIncYearRange = getMinMaxRange(
    centers.map((center) => Number(center.center_inc_year ?? 0))
  )

  return {
    revenueRange,
    yearsInIndiaRange,
    firstCenterYearRange,
    centerIncYearRange,
  }
}
