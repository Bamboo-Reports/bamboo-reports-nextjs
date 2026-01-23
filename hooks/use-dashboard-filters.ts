import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { Account, Center, Function, Prospect, Service, Tech, Filters, AvailableOptions } from "@/lib/types"
import { createDefaultFilters } from "@/lib/dashboard/defaults"
import { calculateBaseRanges } from "@/lib/dashboard/ranges"
import {
  getAccountNames,
  getAvailableOptions,
  getDynamicRevenueRange,
  getFilteredData,
  type FilteredData,
  type RevenueRangeFilterState,
} from "@/lib/dashboard/filtering"
import { getAccountChartData, getCenterChartData, getProspectChartData } from "@/lib/dashboard/charts"

interface UseDashboardFiltersParams {
  accounts: Account[]
  centers: Center[]
  functions: Function[]
  services: Service[]
  prospects: Prospect[]
  tech: Tech[]
}

export function useDashboardFilters({
  accounts,
  centers,
  functions,
  services,
  prospects,
  tech,
}: UseDashboardFiltersParams) {
  const baseRanges = useMemo(() => calculateBaseRanges(accounts, centers), [accounts, centers])

  const [filters, setFilters] = useState<Filters>(() => createDefaultFilters())
  const [pendingFilters, setPendingFilters] = useState<Filters>(() => createDefaultFilters())
  const [isApplying, setIsApplying] = useState(false)

  const [revenueRange, setRevenueRange] = useState(baseRanges.revenueRange)
  const [yearsInIndiaRange, setYearsInIndiaRange] = useState(baseRanges.yearsInIndiaRange)
  const [firstCenterYearRange, setFirstCenterYearRange] = useState(baseRanges.firstCenterYearRange)
  const [centerIncYearRange, setCenterIncYearRange] = useState(baseRanges.centerIncYearRange)

  const isRevenueRangeAutoRef = useRef(true)

  useEffect(() => {
    isRevenueRangeAutoRef.current = true
    setRevenueRange(baseRanges.revenueRange)
    setYearsInIndiaRange(baseRanges.yearsInIndiaRange)
    setFirstCenterYearRange(baseRanges.firstCenterYearRange)
    setCenterIncYearRange(baseRanges.centerIncYearRange)

    const baseRevenue: [number, number] = [baseRanges.revenueRange.min, baseRanges.revenueRange.max]
    const baseYears: [number, number] = [baseRanges.yearsInIndiaRange.min, baseRanges.yearsInIndiaRange.max]
    const baseFirstCenter: [number, number] = [
      baseRanges.firstCenterYearRange.min,
      baseRanges.firstCenterYearRange.max,
    ]
    const baseCenterInc: [number, number] = [baseRanges.centerIncYearRange.min, baseRanges.centerIncYearRange.max]

    setFilters((prev) => ({
      ...prev,
      accountRevenueRange: baseRevenue,
      accountYearsInIndiaRange: baseYears,
      accountFirstCenterYearRange: baseFirstCenter,
      centerIncYearRange: baseCenterInc,
    }))

    setPendingFilters((prev) => ({
      ...prev,
      accountRevenueRange: baseRevenue,
      accountYearsInIndiaRange: baseYears,
      accountFirstCenterYearRange: baseFirstCenter,
      centerIncYearRange: baseCenterInc,
    }))
  }, [baseRanges])

  useLayoutEffect(() => {
    setIsApplying(true)
    setFilters(pendingFilters)
    setIsApplying(false)
  }, [pendingFilters])

  const accountNames = useMemo(() => getAccountNames(accounts), [accounts])

  const filteredData: FilteredData = useMemo(
    () => getFilteredData(accounts, centers, functions, services, prospects, tech, filters),
    [accounts, centers, functions, services, prospects, tech, filters]
  )

  const accountChartData = useMemo(
    () => getAccountChartData(filteredData.filteredAccounts),
    [filteredData.filteredAccounts]
  )

  const centerChartData = useMemo(
    () => getCenterChartData(filteredData.filteredCenters, filteredData.filteredFunctions),
    [filteredData.filteredCenters, filteredData.filteredFunctions]
  )

  const prospectChartData = useMemo(
    () => getProspectChartData(filteredData.filteredProspects),
    [filteredData.filteredProspects]
  )

  const filterStateForRevenue: RevenueRangeFilterState = useMemo(
    () => ({
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
    }),
    [
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
    ]
  )

  const dynamicRevenueRange = useMemo(
    () => getDynamicRevenueRange(accounts, filterStateForRevenue),
    [accounts, filterStateForRevenue]
  )

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

  const filterStateForOptions = useMemo(
    () => ({
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
      centerTypes: filters.centerTypes,
      centerFocus: filters.centerFocus,
      centerCities: filters.centerCities,
      centerStates: filters.centerStates,
      centerCountries: filters.centerCountries,
      centerEmployees: filters.centerEmployees,
      centerStatuses: filters.centerStatuses,
      centerIncYearRange: filters.centerIncYearRange,
      includeNullCenterIncYear: filters.includeNullCenterIncYear,
      functionTypes: filters.functionTypes,
      centerSoftwareInUseKeywords: filters.centerSoftwareInUseKeywords,
      prospectDepartments: filters.prospectDepartments,
      prospectLevels: filters.prospectLevels,
      prospectCities: filters.prospectCities,
      accountNameKeywords: filters.accountNameKeywords,
      accountRevenueRange: filters.accountRevenueRange,
      includeNullRevenue: filters.includeNullRevenue,
    }),
    [filters]
  )

  const availableOptions: AvailableOptions = useMemo(
    () => getAvailableOptions(accounts, centers, functions, prospects, tech, filterStateForOptions),
    [accounts, centers, functions, prospects, tech, filterStateForOptions]
  )

  const resetFilters = useCallback(() => {
    const emptyFilters = createDefaultFilters({
      accountRevenueRange: [baseRanges.revenueRange.min, baseRanges.revenueRange.max],
      accountYearsInIndiaRange: [baseRanges.yearsInIndiaRange.min, baseRanges.yearsInIndiaRange.max],
      accountFirstCenterYearRange: [baseRanges.firstCenterYearRange.min, baseRanges.firstCenterYearRange.max],
      centerIncYearRange: [baseRanges.centerIncYearRange.min, baseRanges.centerIncYearRange.max],
    })

    isRevenueRangeAutoRef.current = true
    setRevenueRange(baseRanges.revenueRange)
    setFilters(emptyFilters)
    setPendingFilters(emptyFilters)
  }, [baseRanges])

  const handleLoadSavedFilters = useCallback((savedFilters: Filters) => {
    isRevenueRangeAutoRef.current = false
    setPendingFilters(savedFilters)
    setFilters(savedFilters)
  }, [])

  const handleMinRevenueChange = useCallback(
    (value: string) => {
      const numValue = Number.parseFloat(value) || revenueRange.min
      const clampedValue = Math.max(revenueRange.min, Math.min(numValue, pendingFilters.accountRevenueRange[1]))
      isRevenueRangeAutoRef.current = false
      setPendingFilters((prev) => ({
        ...prev,
        accountRevenueRange: [clampedValue, prev.accountRevenueRange[1]],
      }))
    },
    [pendingFilters.accountRevenueRange, revenueRange]
  )

  const handleMaxRevenueChange = useCallback(
    (value: string) => {
      const numValue = Number.parseFloat(value) || revenueRange.max
      const clampedValue = Math.min(revenueRange.max, Math.max(numValue, pendingFilters.accountRevenueRange[0]))
      isRevenueRangeAutoRef.current = false
      setPendingFilters((prev) => ({
        ...prev,
        accountRevenueRange: [prev.accountRevenueRange[0], clampedValue],
      }))
    },
    [pendingFilters.accountRevenueRange, revenueRange]
  )

  const handleRevenueRangeChange = useCallback((value: [number, number]) => {
    isRevenueRangeAutoRef.current = false
    setPendingFilters((prev) => ({
      ...prev,
      accountRevenueRange: value,
    }))
  }, [])

  const handleMinYearsInIndiaChange = useCallback(
    (value: string) => {
      const numValue = Number.parseFloat(value) || yearsInIndiaRange.min
      const clampedValue = Math.max(yearsInIndiaRange.min, Math.min(numValue, pendingFilters.accountYearsInIndiaRange[1]))
      setPendingFilters((prev) => ({
        ...prev,
        accountYearsInIndiaRange: [clampedValue, prev.accountYearsInIndiaRange[1]],
      }))
    },
    [pendingFilters.accountYearsInIndiaRange, yearsInIndiaRange]
  )

  const handleMaxYearsInIndiaChange = useCallback(
    (value: string) => {
      const numValue = Number.parseFloat(value) || yearsInIndiaRange.max
      const clampedValue = Math.min(yearsInIndiaRange.max, Math.max(numValue, pendingFilters.accountYearsInIndiaRange[0]))
      setPendingFilters((prev) => ({
        ...prev,
        accountYearsInIndiaRange: [prev.accountYearsInIndiaRange[0], clampedValue],
      }))
    },
    [pendingFilters.accountYearsInIndiaRange, yearsInIndiaRange]
  )

  const handleYearsInIndiaRangeChange = useCallback((value: [number, number]) => {
    setPendingFilters((prev) => ({
      ...prev,
      accountYearsInIndiaRange: value,
    }))
  }, [])

  const handleMinFirstCenterYearChange = useCallback(
    (value: string) => {
      const numValue = Number.parseFloat(value) || firstCenterYearRange.min
      const clampedValue = Math.max(
        firstCenterYearRange.min,
        Math.min(numValue, pendingFilters.accountFirstCenterYearRange[1])
      )
      setPendingFilters((prev) => ({
        ...prev,
        accountFirstCenterYearRange: [clampedValue, prev.accountFirstCenterYearRange[1]],
      }))
    },
    [pendingFilters.accountFirstCenterYearRange, firstCenterYearRange]
  )

  const handleMaxFirstCenterYearChange = useCallback(
    (value: string) => {
      const numValue = Number.parseFloat(value) || firstCenterYearRange.max
      const clampedValue = Math.min(
        firstCenterYearRange.max,
        Math.max(numValue, pendingFilters.accountFirstCenterYearRange[0])
      )
      setPendingFilters((prev) => ({
        ...prev,
        accountFirstCenterYearRange: [prev.accountFirstCenterYearRange[0], clampedValue],
      }))
    },
    [pendingFilters.accountFirstCenterYearRange, firstCenterYearRange]
  )

  const handleFirstCenterYearRangeChange = useCallback((value: [number, number]) => {
    setPendingFilters((prev) => ({
      ...prev,
      accountFirstCenterYearRange: value,
    }))
  }, [])

  const handleMinCenterIncYearChange = useCallback(
    (value: string) => {
      const numValue = Number.parseFloat(value) || centerIncYearRange.min
      const clampedValue = Math.max(
        centerIncYearRange.min,
        Math.min(numValue, pendingFilters.centerIncYearRange[1])
      )
      setPendingFilters((prev) => ({
        ...prev,
        centerIncYearRange: [clampedValue, prev.centerIncYearRange[1]],
      }))
    },
    [pendingFilters.centerIncYearRange, centerIncYearRange]
  )

  const handleMaxCenterIncYearChange = useCallback(
    (value: string) => {
      const numValue = Number.parseFloat(value) || centerIncYearRange.max
      const clampedValue = Math.min(
        centerIncYearRange.max,
        Math.max(numValue, pendingFilters.centerIncYearRange[0])
      )
      setPendingFilters((prev) => ({
        ...prev,
        centerIncYearRange: [prev.centerIncYearRange[0], clampedValue],
      }))
    },
    [pendingFilters.centerIncYearRange, centerIncYearRange]
  )

  const handleCenterIncYearRangeChange = useCallback((value: [number, number]) => {
    setPendingFilters((prev) => ({
      ...prev,
      centerIncYearRange: value,
    }))
  }, [])

  const getTotalActiveFilters = useCallback(() => {
    return (
      filters.accountCountries.length +
      filters.accountIndustries.length +
      filters.accountPrimaryCategories.length +
      filters.accountPrimaryNatures.length +
      filters.accountNasscomStatuses.length +
      filters.accountEmployeesRanges.length +
      filters.accountCenterEmployees.length +
      (filters.accountRevenueRange[0] !== revenueRange.min || filters.accountRevenueRange[1] !== revenueRange.max
        ? 1
        : 0) +
      (filters.includeNullRevenue ? 1 : 0) +
      (filters.accountYearsInIndiaRange[0] !== yearsInIndiaRange.min ||
      filters.accountYearsInIndiaRange[1] !== yearsInIndiaRange.max
        ? 1
        : 0) +
      (filters.includeNullYearsInIndia ? 1 : 0) +
      (filters.accountFirstCenterYearRange[0] !== firstCenterYearRange.min ||
      filters.accountFirstCenterYearRange[1] !== firstCenterYearRange.max
        ? 1
        : 0) +
      (filters.includeNullFirstCenterYear ? 1 : 0) +
      filters.accountNameKeywords.length +
      filters.centerTypes.length +
      filters.centerFocus.length +
      filters.centerCities.length +
      filters.centerStates.length +
      filters.centerCountries.length +
      filters.centerEmployees.length +
      filters.centerStatuses.length +
      (filters.centerIncYearRange[0] !== centerIncYearRange.min ||
      filters.centerIncYearRange[1] !== centerIncYearRange.max
        ? 1
        : 0) +
      (filters.includeNullCenterIncYear ? 1 : 0) +
      filters.functionTypes.length +
      filters.centerSoftwareInUseKeywords.length +
      filters.prospectDepartments.length +
      filters.prospectLevels.length +
      filters.prospectCities.length +
      filters.prospectTitleKeywords.length
    )
  }, [
    filters,
    revenueRange,
    yearsInIndiaRange,
    firstCenterYearRange,
    centerIncYearRange,
  ])

  return {
    filters,
    pendingFilters,
    setPendingFilters,
    isApplying,
    revenueRange,
    yearsInIndiaRange,
    firstCenterYearRange,
    centerIncYearRange,
    accountNames,
    availableOptions,
    filteredData,
    accountChartData,
    centerChartData,
    prospectChartData,
    resetFilters,
    handleLoadSavedFilters,
    handleMinRevenueChange,
    handleMaxRevenueChange,
    handleRevenueRangeChange,
    handleMinYearsInIndiaChange,
    handleMaxYearsInIndiaChange,
    handleYearsInIndiaRangeChange,
    handleMinFirstCenterYearChange,
    handleMaxFirstCenterYearChange,
    handleFirstCenterYearRangeChange,
    handleMinCenterIncYearChange,
    handleMaxCenterIncYearChange,
    handleCenterIncYearRangeChange,
    getTotalActiveFilters,
  }
}
