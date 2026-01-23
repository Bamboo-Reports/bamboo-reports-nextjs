"use client"

import { useState, useCallback, useRef, useLayoutEffect, useTransition, useEffect, useMemo } from "react"
import { DEFAULT_FILTERS, createDefaultFilters, type RangeState } from "@/lib/constants/filters"
import { parseRevenue } from "@/lib/utils/helpers"
import { createValueMatcher } from "@/lib/utils/filter-helpers"
import type { Filters, Account } from "@/lib/types"

interface UseFiltersReturn {
  filters: Filters
  pendingFilters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  setPendingFilters: React.Dispatch<React.SetStateAction<Filters>>
  isApplying: boolean
  applyFilters: () => void
  resetFilters: () => void
  getTotalActiveFilters: () => number
  getTotalPendingFilters: () => number
  hasUnappliedChanges: () => boolean
  handleLoadSavedFilters: (savedFilters: Filters) => void
  // Range handlers
  handleMinRevenueChange: (value: string) => void
  handleMaxRevenueChange: (value: string) => void
  handleRevenueRangeChange: (value: [number, number]) => void
  handleMinYearsInIndiaChange: (value: string) => void
  handleMaxYearsInIndiaChange: (value: string) => void
  handleYearsInIndiaRangeChange: (value: [number, number]) => void
  handleMinFirstCenterYearChange: (value: string) => void
  handleMaxFirstCenterYearChange: (value: string) => void
  handleFirstCenterYearRangeChange: (value: [number, number]) => void
  handleMinCenterIncYearChange: (value: string) => void
  handleMaxCenterIncYearChange: (value: string) => void
  handleCenterIncYearRangeChange: (value: [number, number]) => void
  // Derived values
  revenueRange: RangeState
  dynamicRevenueRange: RangeState
  baseRevenueRange: RangeState
  isRevenueRangeAutoRef: React.MutableRefObject<boolean>
}

// Factory function for creating range change handlers
function createRangeHandlers(
  setPendingFilters: React.Dispatch<React.SetStateAction<Filters>>,
  rangeState: RangeState,
  filterKey: keyof Pick<Filters, 'accountRevenueRange' | 'accountYearsInIndiaRange' | 'accountFirstCenterYearRange' | 'centerIncYearRange'>,
  isRevenueRangeAutoRef?: React.MutableRefObject<boolean>
) {
  const handleMinChange = (value: string) => {
    const numValue = Number.parseFloat(value) || rangeState.min
    const clampedValue = Math.max(rangeState.min, numValue)
    if (isRevenueRangeAutoRef) isRevenueRangeAutoRef.current = false
    setPendingFilters((prev) => ({
      ...prev,
      [filterKey]: [clampedValue, Math.max(clampedValue, prev[filterKey][1])],
    }))
  }

  const handleMaxChange = (value: string) => {
    const numValue = Number.parseFloat(value) || rangeState.max
    const clampedValue = Math.min(rangeState.max, numValue)
    if (isRevenueRangeAutoRef) isRevenueRangeAutoRef.current = false
    setPendingFilters((prev) => ({
      ...prev,
      [filterKey]: [Math.min(clampedValue, prev[filterKey][0]), clampedValue],
    }))
  }

  const handleRangeChange = (value: [number, number]) => {
    if (isRevenueRangeAutoRef) isRevenueRangeAutoRef.current = false
    setPendingFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }))
  }

  return { handleMinChange, handleMaxChange, handleRangeChange }
}

export function useFilters(
  ranges: {
    revenue: RangeState
    yearsInIndia: RangeState
    firstCenterYear: RangeState
    centerIncYear: RangeState
  },
  accounts: Account[]
): UseFiltersReturn {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [pendingFilters, setPendingFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [isApplying, setIsApplying] = useState(false)
  const [, startFilterTransition] = useTransition()
  const [revenueRange, setRevenueRange] = useState<RangeState>(ranges.revenue)
  const isRevenueRangeAutoRef = useRef(true)

  // Calculate base revenue range from all accounts
  const baseRevenueRange = useMemo((): RangeState => {
    const validRevenues = accounts
      .map((account) => parseRevenue(account.account_hq_revenue ?? 0))
      .filter((rev) => rev > 0)

    if (validRevenues.length === 0) {
      return { min: 0, max: 1000000 }
    }

    return {
      min: Math.min(...validRevenues),
      max: Math.max(...validRevenues),
    }
  }, [accounts])

  // Calculate filter state for dynamic revenue range
  const filterStateForRevenue = useMemo(() => ({
    accountCountries: filters.accountCountries,
    accountIndustries: filters.accountIndustries,
    accountPrimaryCategories: filters.accountPrimaryCategories,
    accountPrimaryNatures: filters.accountPrimaryNatures,
    accountNasscomStatuses: filters.accountNasscomStatuses,
    accountEmployeesRanges: filters.accountEmployeesRanges,
    accountCenterEmployees: filters.accountCenterEmployees,
    accountYearsInIndiaRange: filters.accountYearsInIndiaRange,
    includeNullYearsInIndia: filters.includeNullYearsInIndia,
    accountFirstCenterYearRange: filters.accountFirstCenterYearRange,
    includeNullFirstCenterYear: filters.includeNullFirstCenterYear,
  }), [
    filters.accountCountries,
    filters.accountIndustries,
    filters.accountPrimaryCategories,
    filters.accountPrimaryNatures,
    filters.accountNasscomStatuses,
    filters.accountEmployeesRanges,
    filters.accountCenterEmployees,
    filters.accountYearsInIndiaRange,
    filters.includeNullYearsInIndia,
    filters.accountFirstCenterYearRange,
    filters.includeNullFirstCenterYear,
  ])

  // Helper for range filter matching
  const rangeFilterMatch = (
    range: [number, number],
    value: number | string | null | undefined,
    includeNull: boolean,
    parser: (v: number | string | null | undefined) => number = (v) => {
      if (v === null || v === undefined || v === "") return 0
      const num = typeof v === "number" ? v : Number(v)
      return Number.isFinite(num) ? num : 0
    }
  ): boolean => {
    const numValue = parser(value)
    if (includeNull && (numValue === 0 || value === null || value === undefined || value === "")) {
      return true
    }
    if (!includeNull && (numValue === 0 || value === null || value === undefined || value === "")) {
      return false
    }
    return numValue >= range[0] && numValue <= range[1]
  }

  // Dynamic revenue range based on other filters
  const dynamicRevenueRange = useMemo((): RangeState => {
    const activeFilters = filterStateForRevenue
    
    const matchCountry = createValueMatcher(activeFilters.accountCountries)
    const matchIndustry = createValueMatcher(activeFilters.accountIndustries)
    const matchPrimaryCategory = createValueMatcher(activeFilters.accountPrimaryCategories)
    const matchPrimaryNature = createValueMatcher(activeFilters.accountPrimaryNatures)
    const matchNasscom = createValueMatcher(activeFilters.accountNasscomStatuses)
    const matchEmployeesRange = createValueMatcher(activeFilters.accountEmployeesRanges)
    const matchCenterEmployees = createValueMatcher(activeFilters.accountCenterEmployees)
    
    const matchYearsInIndiaRange = (value: number | string | null | undefined) =>
      rangeFilterMatch(activeFilters.accountYearsInIndiaRange, value, activeFilters.includeNullYearsInIndia)
    const matchFirstCenterYearRange = (value: number | string | null | undefined) =>
      rangeFilterMatch(activeFilters.accountFirstCenterYearRange, value, activeFilters.includeNullFirstCenterYear)

    const tempFilteredAccounts = accounts.filter((account) => {
      return (
        matchCountry(account.account_hq_country) &&
        matchIndustry(account.account_hq_industry) &&
        matchPrimaryCategory(account.account_primary_category) &&
        matchPrimaryNature(account.account_primary_nature) &&
        matchNasscom(account.account_nasscom_status) &&
        matchEmployeesRange(account.account_hq_employee_range) &&
        matchCenterEmployees(account.account_center_employees_range || "") &&
        matchYearsInIndiaRange(account.years_in_india) &&
        matchFirstCenterYearRange(account.account_first_center_year)
      )
    })

    const validRevenues = tempFilteredAccounts
      .map((account) => parseRevenue(account.account_hq_revenue ?? 0))
      .filter((rev) => rev > 0)

    if (validRevenues.length === 0) {
      return { min: 0, max: 1000000 }
    }

    return {
      min: Math.min(...validRevenues),
      max: Math.max(...validRevenues),
    }
  }, [accounts, filterStateForRevenue])

  // Update revenueRange when dynamicRevenueRange changes
  useEffect(() => {
    setRevenueRange(dynamicRevenueRange)

    setPendingFilters((prev) => {
      if (isRevenueRangeAutoRef.current) {
        if (
          prev.accountRevenueRange[0] !== dynamicRevenueRange.min ||
          prev.accountRevenueRange[1] !== dynamicRevenueRange.max
        ) {
          return {
            ...prev,
            accountRevenueRange: [dynamicRevenueRange.min, dynamicRevenueRange.max] as [number, number],
          }
        }
        return prev
      }

      const newMin = Math.max(prev.accountRevenueRange[0], dynamicRevenueRange.min)
      const newMax = Math.min(prev.accountRevenueRange[1], dynamicRevenueRange.max)

      if (newMin !== prev.accountRevenueRange[0] || newMax !== prev.accountRevenueRange[1]) {
        return {
          ...prev,
          accountRevenueRange: [newMin, newMax] as [number, number],
        }
      }

      return prev
    })
  }, [dynamicRevenueRange])

  // Auto-apply filters immediately without a paint gap
  useLayoutEffect(() => {
    setIsApplying(true)
    setFilters(pendingFilters)
    setIsApplying(false)
  }, [pendingFilters])

  const applyFilters = useCallback(() => {
    setIsApplying(true)
    startFilterTransition(() => {
      setFilters(pendingFilters)
      setIsApplying(false)
    })
  }, [pendingFilters])

  const resetFilters = useCallback(() => {
    const emptyFilters = createDefaultFilters({
      revenueRange: baseRevenueRange,
      yearsInIndiaRange: ranges.yearsInIndia,
      firstCenterYearRange: ranges.firstCenterYear,
      centerIncYearRange: ranges.centerIncYear,
    })
    isRevenueRangeAutoRef.current = true
    setRevenueRange(baseRevenueRange)
    setFilters(emptyFilters)
    setPendingFilters(emptyFilters)
  }, [baseRevenueRange, ranges])

  const getTotalPendingFilters = useCallback(() => {
    return (
      pendingFilters.accountCountries.length +
      pendingFilters.accountIndustries.length +
      pendingFilters.accountPrimaryCategories.length +
      pendingFilters.accountPrimaryNatures.length +
      pendingFilters.accountNasscomStatuses.length +
      pendingFilters.accountEmployeesRanges.length +
      pendingFilters.accountCenterEmployees.length +
      (pendingFilters.accountRevenueRange[0] !== revenueRange.min ||
        pendingFilters.accountRevenueRange[1] !== revenueRange.max ? 1 : 0) +
      (pendingFilters.includeNullRevenue ? 1 : 0) +
      (pendingFilters.accountYearsInIndiaRange[0] !== ranges.yearsInIndia.min ||
        pendingFilters.accountYearsInIndiaRange[1] !== ranges.yearsInIndia.max ? 1 : 0) +
      (pendingFilters.includeNullYearsInIndia ? 1 : 0) +
      (pendingFilters.accountFirstCenterYearRange[0] !== ranges.firstCenterYear.min ||
        pendingFilters.accountFirstCenterYearRange[1] !== ranges.firstCenterYear.max ? 1 : 0) +
      (pendingFilters.includeNullFirstCenterYear ? 1 : 0) +
      pendingFilters.accountNameKeywords.length +
      pendingFilters.centerTypes.length +
      pendingFilters.centerFocus.length +
      pendingFilters.centerCities.length +
      pendingFilters.centerStates.length +
      pendingFilters.centerCountries.length +
      pendingFilters.centerEmployees.length +
      pendingFilters.centerStatuses.length +
      (pendingFilters.centerIncYearRange[0] !== ranges.centerIncYear.min ||
        pendingFilters.centerIncYearRange[1] !== ranges.centerIncYear.max ? 1 : 0) +
      (pendingFilters.includeNullCenterIncYear ? 1 : 0) +
      pendingFilters.functionTypes.length +
      pendingFilters.centerSoftwareInUseKeywords.length +
      pendingFilters.prospectDepartments.length +
      pendingFilters.prospectLevels.length +
      pendingFilters.prospectCities.length +
      pendingFilters.prospectTitleKeywords.length
    )
  }, [pendingFilters, revenueRange, ranges])

  const hasUnappliedChanges = useCallback(() => {
    return JSON.stringify(filters) !== JSON.stringify(pendingFilters)
  }, [filters, pendingFilters])

  const getTotalActiveFilters = useCallback(() => {
    return (
      filters.accountCountries.length +
      filters.accountIndustries.length +
      filters.accountPrimaryCategories.length +
      filters.accountPrimaryNatures.length +
      filters.accountNasscomStatuses.length +
      filters.accountEmployeesRanges.length +
      filters.accountCenterEmployees.length +
      (filters.accountRevenueRange[0] !== revenueRange.min ||
        filters.accountRevenueRange[1] !== revenueRange.max ? 1 : 0) +
      (filters.includeNullRevenue ? 1 : 0) +
      (filters.accountYearsInIndiaRange[0] !== ranges.yearsInIndia.min ||
        filters.accountYearsInIndiaRange[1] !== ranges.yearsInIndia.max ? 1 : 0) +
      (filters.includeNullYearsInIndia ? 1 : 0) +
      (filters.accountFirstCenterYearRange[0] !== ranges.firstCenterYear.min ||
        filters.accountFirstCenterYearRange[1] !== ranges.firstCenterYear.max ? 1 : 0) +
      (filters.includeNullFirstCenterYear ? 1 : 0) +
      filters.accountNameKeywords.length +
      filters.centerTypes.length +
      filters.centerFocus.length +
      filters.centerCities.length +
      filters.centerStates.length +
      filters.centerCountries.length +
      filters.centerEmployees.length +
      filters.centerStatuses.length +
      (filters.centerIncYearRange[0] !== ranges.centerIncYear.min ||
        filters.centerIncYearRange[1] !== ranges.centerIncYear.max ? 1 : 0) +
      (filters.includeNullCenterIncYear ? 1 : 0) +
      filters.functionTypes.length +
      filters.centerSoftwareInUseKeywords.length +
      filters.prospectDepartments.length +
      filters.prospectLevels.length +
      filters.prospectCities.length +
      filters.prospectTitleKeywords.length
    )
  }, [filters, revenueRange, ranges])

  const handleLoadSavedFilters = useCallback((savedFilters: Filters) => {
    isRevenueRangeAutoRef.current = false
    setPendingFilters(savedFilters)
    setFilters(savedFilters)
  }, [])

  // Create range handlers using factory
  const revenueHandlers = createRangeHandlers(
    setPendingFilters, revenueRange, 'accountRevenueRange', isRevenueRangeAutoRef
  )
  const yearsInIndiaHandlers = createRangeHandlers(
    setPendingFilters, ranges.yearsInIndia, 'accountYearsInIndiaRange'
  )
  const firstCenterYearHandlers = createRangeHandlers(
    setPendingFilters, ranges.firstCenterYear, 'accountFirstCenterYearRange'
  )
  const centerIncYearHandlers = createRangeHandlers(
    setPendingFilters, ranges.centerIncYear, 'centerIncYearRange'
  )

  return {
    filters,
    pendingFilters,
    setFilters,
    setPendingFilters,
    isApplying,
    applyFilters,
    resetFilters,
    getTotalActiveFilters,
    getTotalPendingFilters,
    hasUnappliedChanges,
    handleLoadSavedFilters,
    handleMinRevenueChange: revenueHandlers.handleMinChange,
    handleMaxRevenueChange: revenueHandlers.handleMaxChange,
    handleRevenueRangeChange: revenueHandlers.handleRangeChange,
    handleMinYearsInIndiaChange: yearsInIndiaHandlers.handleMinChange,
    handleMaxYearsInIndiaChange: yearsInIndiaHandlers.handleMaxChange,
    handleYearsInIndiaRangeChange: yearsInIndiaHandlers.handleRangeChange,
    handleMinFirstCenterYearChange: firstCenterYearHandlers.handleMinChange,
    handleMaxFirstCenterYearChange: firstCenterYearHandlers.handleMaxChange,
    handleFirstCenterYearRangeChange: firstCenterYearHandlers.handleRangeChange,
    handleMinCenterIncYearChange: centerIncYearHandlers.handleMinChange,
    handleMaxCenterIncYearChange: centerIncYearHandlers.handleMaxChange,
    handleCenterIncYearRangeChange: centerIncYearHandlers.handleRangeChange,
    revenueRange,
    dynamicRevenueRange,
    baseRevenueRange,
    isRevenueRangeAutoRef,
  }
}
