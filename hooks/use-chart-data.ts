"use client"

import { useMemo } from "react"
import {
  calculateChartData,
  calculateCenterChartData,
  calculateCityChartData,
  calculateFunctionChartData,
} from "@/lib/utils/chart-helpers"
import type { Account, Center, Function, Prospect, ChartData } from "@/lib/types"

interface AccountChartData {
  regionData: ChartData[]
  primaryNatureData: ChartData[]
  revenueRangeData: ChartData[]
  employeesRangeData: ChartData[]
}

interface CenterChartData {
  centerTypeData: ChartData[]
  employeesRangeData: ChartData[]
  cityData: ChartData[]
  functionData: ChartData[]
}

interface ProspectChartData {
  departmentData: ChartData[]
  levelData: ChartData[]
}

interface UseChartDataReturn {
  accountChartData: AccountChartData
  centerChartData: CenterChartData
  prospectChartData: ProspectChartData
}

export function useChartData(
  filteredAccounts: Account[],
  filteredCenters: Center[],
  filteredFunctions: Function[],
  filteredProspects: Prospect[]
): UseChartDataReturn {
  // Calculate chart data for accounts
  const accountChartData = useMemo((): AccountChartData => {
    return {
      regionData: calculateChartData(filteredAccounts, "account_hq_region"),
      primaryNatureData: calculateChartData(filteredAccounts, "account_primary_nature"),
      revenueRangeData: calculateChartData(filteredAccounts, "account_hq_revenue_range"),
      employeesRangeData: calculateChartData(filteredAccounts, "account_hq_employee_range"),
    }
  }, [filteredAccounts])

  // Calculate chart data for centers
  const centerChartData = useMemo((): CenterChartData => {
    const centerKeys = filteredCenters.map((c) => c.cn_unique_key)
    return {
      centerTypeData: calculateCenterChartData(filteredCenters, "center_type"),
      employeesRangeData: calculateCenterChartData(filteredCenters, "center_employees_range"),
      cityData: calculateCityChartData(filteredCenters),
      functionData: calculateFunctionChartData(filteredFunctions, centerKeys),
    }
  }, [filteredCenters, filteredFunctions])

  // Calculate chart data for prospects
  const prospectChartData = useMemo((): ProspectChartData => {
    return {
      departmentData: calculateChartData<Prospect>(filteredProspects, "prospect_department"),
      levelData: calculateChartData<Prospect>(filteredProspects, "prospect_level"),
    }
  }, [filteredProspects])

  return {
    accountChartData,
    centerChartData,
    prospectChartData,
  }
}
