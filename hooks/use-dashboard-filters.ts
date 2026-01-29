import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
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

type RangeTuple = [number, number]

type RangeBounds = {
  min: number
  max: number
}

export type UseDashboardFiltersResult = {
  filters: Filters
  pendingFilters: Filters
  setPendingFilters: Dispatch<SetStateAction<Filters>>
  isApplying: boolean
  revenueRange: RangeBounds
  yearsInIndiaRange: RangeBounds
  firstCenterYearRange: RangeBounds
  centerIncYearRange: RangeBounds
  accountNames: string[]
  availableOptions: AvailableOptions
  filteredData: FilteredData
  accountChartData: ReturnType<typeof getAccountChartData>
  centerChartData: ReturnType<typeof getCenterChartData>
  prospectChartData: ReturnType<typeof getProspectChartData>
  resetFilters: () => void
  handleLoadSavedFilters: (savedFilters: Filters) => void
  handleMinRevenueChange: (value: string) => void
  handleMaxRevenueChange: (value: string) => void
  handleRevenueRangeChange: (value: RangeTuple) => void
  handleMinYearsInIndiaChange: (value: string) => void
  handleMaxYearsInIndiaChange: (value: string) => void
  handleYearsInIndiaRangeChange: (value: RangeTuple) => void
  handleMinFirstCenterYearChange: (value: string) => void
  handleMaxFirstCenterYearChange: (value: string) => void
  handleFirstCenterYearRangeChange: (value: RangeTuple) => void
  handleMinCenterIncYearChange: (value: string) => void
  handleMaxCenterIncYearChange: (value: string) => void
  handleCenterIncYearRangeChange: (value: RangeTuple) => void
  getTotalActiveFilters: () => number
}

interface UseDashboardFiltersParams {
  accounts: Account[]
  centers: Center[]
  functions: Function[]
  services: Service[]
  prospects: Prospect[]
  tech: Tech[]
}

const buildRangeTuple = (range: RangeBounds): RangeTuple => [range.min, range.max]

const parseNumberOr = (value: string, fallback: number): number => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const clampNumber = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))

const countRangeFilter = (range: RangeTuple, baseRange: RangeBounds): number =>
  range[0] !== baseRange.min || range[1] !== baseRange.max ? 1 : 0

export function useDashboardFilters({
  accounts,
  centers,
  functions,
  services,
  prospects,
  tech,
}: UseDashboardFiltersParams): UseDashboardFiltersResult {
  const baseRanges = useMemo(() => calculateBaseRanges(accounts, centers), [accounts, centers])

  const [filters, setFilters] = useState<Filters>(() => createDefaultFilters())
  const [pendingFilters, setPendingFilters] = useState<Filters>(() => createDefaultFilters())
  const [isApplying, setIsApplying] = useState(false)

  const [revenueRange, setRevenueRange] = useState(baseRanges.revenueRange)
  const [yearsInIndiaRange, setYearsInIndiaRange] = useState(baseRanges.yearsInIndiaRange)
  const [firstCenterYearRange, setFirstCenterYearRange] = useState(baseRanges.firstCenterYearRange)
  const [centerIncYearRange, setCenterIncYearRange] = useState(baseRanges.centerIncYearRange)

  const isRevenueRangeAutoRef = useRef(true)

  const baseRangeFilters = useMemo(
    () => ({
      accountRevenueRange: buildRangeTuple(baseRanges.revenueRange),
      accountYearsInIndiaRange: buildRangeTuple(baseRanges.yearsInIndiaRange),
      accountFirstCenterYearRange: buildRangeTuple(baseRanges.firstCenterYearRange),
      centerIncYearRange: buildRangeTuple(baseRanges.centerIncYearRange),
    }),
    [baseRanges]
  )

  useEffect(() => {
    isRevenueRangeAutoRef.current = true
    setRevenueRange(baseRanges.revenueRange)
    setYearsInIndiaRange(baseRanges.yearsInIndiaRange)
    setFirstCenterYearRange(baseRanges.firstCenterYearRange)
    setCenterIncYearRange(baseRanges.centerIncYearRange)

    setFilters((prev) => ({
      ...prev,
      ...baseRangeFilters,
    }))

    setPendingFilters((prev) => ({
      ...prev,
      ...baseRangeFilters,
    }))
  }, [baseRanges, baseRangeFilters])

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
    [filters]
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
            accountRevenueRange: [dynamicRevenueRange.min, dynamicRevenueRange.max] as RangeTuple,
          }
        }

        return prev
      }

      const newMin = Math.max(prev.accountRevenueRange[0], dynamicRevenueRange.min)
      const newMax = Math.min(prev.accountRevenueRange[1], dynamicRevenueRange.max)

      if (newMin !== prev.accountRevenueRange[0] || newMax !== prev.accountRevenueRange[1]) {
        return {
          ...prev,
          accountRevenueRange: [newMin, newMax] as RangeTuple,
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
    const emptyFilters = createDefaultFilters(baseRangeFilters)

    isRevenueRangeAutoRef.current = true
    setRevenueRange(baseRanges.revenueRange)
    setFilters(emptyFilters)
    setPendingFilters(emptyFilters)
  }, [baseRangeFilters, baseRanges])

  const handleLoadSavedFilters = useCallback((savedFilters: Filters) => {
    isRevenueRangeAutoRef.current = false
    setPendingFilters(savedFilters)
    setFilters(savedFilters)
  }, [])

  const handleMinRevenueChange = useCallback(
    (value: string) => {
      const numValue = parseNumberOr(value, revenueRange.min)
      const clampedValue = clampNumber(numValue, revenueRange.min, pendingFilters.accountRevenueRange[1])
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
      const numValue = parseNumberOr(value, revenueRange.max)
      const clampedValue = clampNumber(numValue, pendingFilters.accountRevenueRange[0], revenueRange.max)
      isRevenueRangeAutoRef.current = false
      setPendingFilters((prev) => ({
        ...prev,
        accountRevenueRange: [prev.accountRevenueRange[0], clampedValue],
      }))
    },
    [pendingFilters.accountRevenueRange, revenueRange]
  )

  const handleRevenueRangeChange = useCallback((value: RangeTuple) => {
    isRevenueRangeAutoRef.current = false
    setPendingFilters((prev) => ({
      ...prev,
      accountRevenueRange: value,
    }))
  }, [])

  const handleMinYearsInIndiaChange = useCallback(
    (value: string) => {
      const numValue = parseNumberOr(value, yearsInIndiaRange.min)
      const clampedValue = clampNumber(numValue, yearsInIndiaRange.min, pendingFilters.accountYearsInIndiaRange[1])
      setPendingFilters((prev) => ({
        ...prev,
        accountYearsInIndiaRange: [clampedValue, prev.accountYearsInIndiaRange[1]],
      }))
    },
    [pendingFilters.accountYearsInIndiaRange, yearsInIndiaRange]
  )

  const handleMaxYearsInIndiaChange = useCallback(
    (value: string) => {
      const numValue = parseNumberOr(value, yearsInIndiaRange.max)
      const clampedValue = clampNumber(numValue, pendingFilters.accountYearsInIndiaRange[0], yearsInIndiaRange.max)
      setPendingFilters((prev) => ({
        ...prev,
        accountYearsInIndiaRange: [prev.accountYearsInIndiaRange[0], clampedValue],
      }))
    },
    [pendingFilters.accountYearsInIndiaRange, yearsInIndiaRange]
  )

  const handleYearsInIndiaRangeChange = useCallback((value: RangeTuple) => {
    setPendingFilters((prev) => ({
      ...prev,
      accountYearsInIndiaRange: value,
    }))
  }, [])

  const handleMinFirstCenterYearChange = useCallback(
    (value: string) => {
      const numValue = parseNumberOr(value, firstCenterYearRange.min)
      const clampedValue = clampNumber(
        numValue,
        firstCenterYearRange.min,
        pendingFilters.accountFirstCenterYearRange[1]
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
      const numValue = parseNumberOr(value, firstCenterYearRange.max)
      const clampedValue = clampNumber(
        numValue,
        pendingFilters.accountFirstCenterYearRange[0],
        firstCenterYearRange.max
      )
      setPendingFilters((prev) => ({
        ...prev,
        accountFirstCenterYearRange: [prev.accountFirstCenterYearRange[0], clampedValue],
      }))
    },
    [pendingFilters.accountFirstCenterYearRange, firstCenterYearRange]
  )

  const handleFirstCenterYearRangeChange = useCallback((value: RangeTuple) => {
    setPendingFilters((prev) => ({
      ...prev,
      accountFirstCenterYearRange: value,
    }))
  }, [])

  const handleMinCenterIncYearChange = useCallback(
    (value: string) => {
      const numValue = parseNumberOr(value, centerIncYearRange.min)
      const clampedValue = clampNumber(numValue, centerIncYearRange.min, pendingFilters.centerIncYearRange[1])
      setPendingFilters((prev) => ({
        ...prev,
        centerIncYearRange: [clampedValue, prev.centerIncYearRange[1]],
      }))
    },
    [pendingFilters.centerIncYearRange, centerIncYearRange]
  )

  const handleMaxCenterIncYearChange = useCallback(
    (value: string) => {
      const numValue = parseNumberOr(value, centerIncYearRange.max)
      const clampedValue = clampNumber(numValue, pendingFilters.centerIncYearRange[0], centerIncYearRange.max)
      setPendingFilters((prev) => ({
        ...prev,
        centerIncYearRange: [prev.centerIncYearRange[0], clampedValue],
      }))
    },
    [pendingFilters.centerIncYearRange, centerIncYearRange]
  )

  const handleCenterIncYearRangeChange = useCallback((value: RangeTuple) => {
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
      countRangeFilter(filters.accountRevenueRange, revenueRange) +
      (filters.includeNullRevenue ? 1 : 0) +
      countRangeFilter(filters.accountYearsInIndiaRange, yearsInIndiaRange) +
      (filters.includeNullYearsInIndia ? 1 : 0) +
      countRangeFilter(filters.accountFirstCenterYearRange, firstCenterYearRange) +
      (filters.includeNullFirstCenterYear ? 1 : 0) +
      filters.accountNameKeywords.length +
      filters.centerTypes.length +
      filters.centerFocus.length +
      filters.centerCities.length +
      filters.centerStates.length +
      filters.centerCountries.length +
      filters.centerEmployees.length +
      filters.centerStatuses.length +
      countRangeFilter(filters.centerIncYearRange, centerIncYearRange) +
      (filters.includeNullCenterIncYear ? 1 : 0) +
      filters.functionTypes.length +
      filters.centerSoftwareInUseKeywords.length +
      filters.prospectDepartments.length +
      filters.prospectLevels.length +
      filters.prospectCities.length +
      filters.prospectTitleKeywords.length
    )
  }, [filters, revenueRange, yearsInIndiaRange, firstCenterYearRange, centerIncYearRange])

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
