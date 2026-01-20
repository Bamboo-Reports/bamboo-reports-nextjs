"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, FolderOpen, Settings, Trash2, Edit, Calendar, Filter, X, ChevronDown } from "lucide-react"
import type { Filters, FilterValue } from "@/lib/types"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface SavedFilter {
  id: string
  name: string
  filters: Filters
  created_at: string
  updated_at: string
}

type FilterValueLike = FilterValue | string | null | undefined

const DEFAULT_REVENUE_RANGE: [number, number] = [0, 1000000]
const DEFAULT_YEARS_IN_INDIA_RANGE: [number, number] = [0, 1000000]
const DEFAULT_FIRST_CENTER_YEAR_RANGE: [number, number] = [0, 1000000]
const DEFAULT_CENTER_INC_YEAR_RANGE: [number, number] = [0, 1000000]

const calculateActiveFilters = (filters: Filters) => {
  const [minRevenue, maxRevenue] = filters.accountRevenueRange || DEFAULT_REVENUE_RANGE
  const revenueFilterActive = minRevenue !== DEFAULT_REVENUE_RANGE[0] || maxRevenue !== DEFAULT_REVENUE_RANGE[1]
  const [minYearsInIndia, maxYearsInIndia] = filters.accountYearsInIndiaRange || DEFAULT_YEARS_IN_INDIA_RANGE
  const yearsInIndiaFilterActive =
    minYearsInIndia !== DEFAULT_YEARS_IN_INDIA_RANGE[0] || maxYearsInIndia !== DEFAULT_YEARS_IN_INDIA_RANGE[1]
  const [minFirstCenterYear, maxFirstCenterYear] =
    filters.accountFirstCenterYearRange || DEFAULT_FIRST_CENTER_YEAR_RANGE
  const firstCenterYearFilterActive =
    minFirstCenterYear !== DEFAULT_FIRST_CENTER_YEAR_RANGE[0] || maxFirstCenterYear !== DEFAULT_FIRST_CENTER_YEAR_RANGE[1]
  const [minCenterIncYear, maxCenterIncYear] = filters.centerIncYearRange || DEFAULT_CENTER_INC_YEAR_RANGE
  const centerIncYearFilterActive =
    minCenterIncYear !== DEFAULT_CENTER_INC_YEAR_RANGE[0] || maxCenterIncYear !== DEFAULT_CENTER_INC_YEAR_RANGE[1]

  return (
    filters.accountCountries.length +
    filters.accountIndustries.length +
    filters.accountPrimaryCategories.length +
    filters.accountPrimaryNatures.length +
    filters.accountNasscomStatuses.length +
    filters.accountEmployeesRanges.length +
    filters.accountCenterEmployees.length +
    (revenueFilterActive ? 1 : 0) +
    (filters.includeNullRevenue ? 1 : 0) +
    (yearsInIndiaFilterActive ? 1 : 0) +
    (filters.includeNullYearsInIndia ? 1 : 0) +
    (firstCenterYearFilterActive ? 1 : 0) +
    (filters.includeNullFirstCenterYear ? 1 : 0) +
    filters.accountNameKeywords.length +
    filters.centerTypes.length +
    filters.centerFocus.length +
    filters.centerCities.length +
    filters.centerStates.length +
    filters.centerCountries.length +
    filters.centerEmployees.length +
    filters.centerStatuses.length +
    (centerIncYearFilterActive ? 1 : 0) +
    (filters.includeNullCenterIncYear ? 1 : 0) +
    filters.functionTypes.length +
    filters.prospectDepartments.length +
    filters.prospectLevels.length +
    filters.prospectCities.length +
    filters.prospectTitleKeywords.length
  )
}

const withFilterDefaults = (filters: Partial<Filters> | null | undefined): Filters => {
  const revenueRange = Array.isArray(filters?.accountRevenueRange) && filters?.accountRevenueRange.length === 2
    ? filters.accountRevenueRange.map(Number) as [number, number]
    : DEFAULT_REVENUE_RANGE
  const yearsInIndiaRange = Array.isArray(filters?.accountYearsInIndiaRange) && filters?.accountYearsInIndiaRange.length === 2
    ? filters.accountYearsInIndiaRange.map(Number) as [number, number]
    : DEFAULT_YEARS_IN_INDIA_RANGE
  const firstCenterYearRange = Array.isArray(filters?.accountFirstCenterYearRange) && filters?.accountFirstCenterYearRange.length === 2
    ? filters.accountFirstCenterYearRange.map(Number) as [number, number]
    : DEFAULT_FIRST_CENTER_YEAR_RANGE
  const centerIncYearRange = Array.isArray(filters?.centerIncYearRange) && filters?.centerIncYearRange.length === 2
    ? filters.centerIncYearRange.map(Number) as [number, number]
    : DEFAULT_CENTER_INC_YEAR_RANGE

  return {
    accountCountries: filters?.accountCountries ?? [],
    accountIndustries: filters?.accountIndustries ?? [],
    accountPrimaryCategories: filters?.accountPrimaryCategories ?? [],
    accountPrimaryNatures: filters?.accountPrimaryNatures ?? [],
    accountNasscomStatuses: filters?.accountNasscomStatuses ?? [],
    accountEmployeesRanges: filters?.accountEmployeesRanges ?? [],
    accountCenterEmployees: filters?.accountCenterEmployees ?? [],
    accountRevenueRange: revenueRange,
    includeNullRevenue: filters?.includeNullRevenue ?? false,
    accountYearsInIndiaRange: yearsInIndiaRange,
    includeNullYearsInIndia: filters?.includeNullYearsInIndia ?? false,
    accountFirstCenterYearRange: firstCenterYearRange,
    includeNullFirstCenterYear: filters?.includeNullFirstCenterYear ?? false,
    accountNameKeywords: filters?.accountNameKeywords ?? [],
    centerTypes: filters?.centerTypes ?? [],
    centerFocus: filters?.centerFocus ?? [],
    centerCities: filters?.centerCities ?? [],
    centerStates: filters?.centerStates ?? [],
    centerCountries: filters?.centerCountries ?? [],
    centerEmployees: filters?.centerEmployees ?? [],
    centerStatuses: filters?.centerStatuses ?? [],
    centerIncYearRange: centerIncYearRange,
    includeNullCenterIncYear: filters?.includeNullCenterIncYear ?? false,
    functionTypes: filters?.functionTypes ?? [],
    prospectDepartments: filters?.prospectDepartments ?? [],
    prospectLevels: filters?.prospectLevels ?? [],
    prospectCities: filters?.prospectCities ?? [],
    prospectTitleKeywords: filters?.prospectTitleKeywords ?? [],
  }
}

interface SavedFiltersManagerProps {
  currentFilters: Filters
  onLoadFilters: (filters: Filters) => void
  totalActiveFilters: number
  onReset?: () => void
  onExport?: () => void
}

// Safely extract label/mode from saved filter values (handles legacy string arrays too)
const normalizeFilterValue = (value: FilterValueLike) => {
  if (!value) return null
  if (typeof value === "string") return { label: value, mode: "include" as FilterValue["mode"] }
  if (typeof value === "object" && "value" in value) return { label: value.value, mode: value.mode }
  return { label: String(value), mode: "include" as FilterValue["mode"] }
}

// Memoized FilterBadge component to prevent re-renders
const FilterBadge = memo((
  { filterKey, value, mode }: { filterKey: string; value: string; mode?: FilterValue["mode"] }
) => (
  <Badge variant={mode === "exclude" ? "destructive" : "outline"} className="text-xs">
    {filterKey}: {value}
    {mode === "exclude" ? " (excluded)" : ""}
  </Badge>
))
FilterBadge.displayName = "FilterBadge"

const renderFilterValues = (values: FilterValueLike[] = [], label: string) =>
  values.map((item, index) => {
    const normalized = normalizeFilterValue(item)
    if (!normalized) return null

    return (
      <FilterBadge
        key={`${label}-${normalized.label}-${index}`}
        filterKey={label}
        value={normalized.label}
        mode={normalized.mode}
      />
    )
  })

// Memoized SavedFilterCard component to prevent re-renders
const SavedFilterCard = memo(({
  filter,
  onLoad,
  onEdit,
  onDelete
}: {
  filter: SavedFilter
  onLoad: (filter: SavedFilter) => void
  onEdit: (filter: SavedFilter) => void
  onDelete: (filter: SavedFilter) => void
}) => {
  // Memoize filter count calculation
  const filterCount = useCallback(() => {
    return calculateActiveFilters(filter.filters)
  }, [filter.filters])
  const [minRevenue, maxRevenue] = filter.filters.accountRevenueRange || DEFAULT_REVENUE_RANGE
  const revenueFilterActive = minRevenue !== DEFAULT_REVENUE_RANGE[0] || maxRevenue !== DEFAULT_REVENUE_RANGE[1]
  const [minYearsInIndia, maxYearsInIndia] = filter.filters.accountYearsInIndiaRange || DEFAULT_YEARS_IN_INDIA_RANGE
  const yearsInIndiaFilterActive =
    minYearsInIndia !== DEFAULT_YEARS_IN_INDIA_RANGE[0] || maxYearsInIndia !== DEFAULT_YEARS_IN_INDIA_RANGE[1]
  const [minFirstCenterYear, maxFirstCenterYear] =
    filter.filters.accountFirstCenterYearRange || DEFAULT_FIRST_CENTER_YEAR_RANGE
  const firstCenterYearFilterActive =
    minFirstCenterYear !== DEFAULT_FIRST_CENTER_YEAR_RANGE[0] || maxFirstCenterYear !== DEFAULT_FIRST_CENTER_YEAR_RANGE[1]
  const [minCenterIncYear, maxCenterIncYear] = filter.filters.centerIncYearRange || DEFAULT_CENTER_INC_YEAR_RANGE
  const centerIncYearFilterActive =
    minCenterIncYear !== DEFAULT_CENTER_INC_YEAR_RANGE[0] || maxCenterIncYear !== DEFAULT_CENTER_INC_YEAR_RANGE[1]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{filter.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{filterCount()} filters</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(filter)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete(filter)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Created: {new Date(filter.created_at).toLocaleDateString()}
          </div>
          {filter.updated_at !== filter.created_at && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Updated: {new Date(filter.updated_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Filter Details:</span>
            <Button variant="outline" size="sm" onClick={() => onLoad(filter)}>
              <Filter className="h-4 w-4 mr-2" />
              Load Filters
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {renderFilterValues(filter.filters.accountNameKeywords, "Account Name")}
            {renderFilterValues(filter.filters.accountCountries, "Country")}
            {renderFilterValues(filter.filters.accountIndustries, "Industry")}
            {renderFilterValues(filter.filters.accountPrimaryCategories, "Category")}
            {renderFilterValues(filter.filters.accountPrimaryNatures, "Nature")}
            {renderFilterValues(filter.filters.accountNasscomStatuses, "NASSCOM")}
            {renderFilterValues(filter.filters.accountEmployeesRanges, "Emp Range")}
            {renderFilterValues(filter.filters.accountCenterEmployees, "Center Emp")}
            {renderFilterValues(filter.filters.centerTypes, "Type")}
            {renderFilterValues(filter.filters.centerFocus, "Focus")}
            {renderFilterValues(filter.filters.centerCities, "City")}
            {renderFilterValues(filter.filters.centerStates, "State")}
            {renderFilterValues(filter.filters.centerCountries, "Center Country")}
            {renderFilterValues(filter.filters.centerEmployees, "Center Employees")}
            {renderFilterValues(filter.filters.centerStatuses, "Center Status")}
            {renderFilterValues(filter.filters.functionTypes, "Function")}
            {renderFilterValues(filter.filters.prospectDepartments, "Department")}
            {renderFilterValues(filter.filters.prospectLevels, "Prospect Level")}
            {renderFilterValues(filter.filters.prospectCities, "Prospect City")}
            {renderFilterValues(filter.filters.prospectTitleKeywords, "Job Title")}
            {revenueFilterActive && (
              <FilterBadge
                filterKey="Revenue"
                value={`${minRevenue.toLocaleString()} - ${maxRevenue.toLocaleString()}`}
              />
            )}
            {filter.filters.includeNullRevenue && (
              <FilterBadge filterKey="Revenue" value="Include null revenue" />
            )}
            {yearsInIndiaFilterActive && (
              <FilterBadge
                filterKey="India Headcount"
                value={`${minYearsInIndia.toLocaleString()} - ${maxYearsInIndia.toLocaleString()}`}
              />
            )}
            {filter.filters.includeNullYearsInIndia && (
              <FilterBadge filterKey="India Headcount" value="Include null/zero" />
            )}
            {firstCenterYearFilterActive && (
              <FilterBadge
                filterKey="Years In India"
                value={`${minFirstCenterYear.toLocaleString()} - ${maxFirstCenterYear.toLocaleString()}`}
              />
            )}
            {filter.filters.includeNullFirstCenterYear && (
              <FilterBadge filterKey="Years In India" value="Include null/zero" />
            )}
            {centerIncYearFilterActive && (
              <FilterBadge
                filterKey="Timeline"
                value={`${minCenterIncYear.toLocaleString()} - ${maxCenterIncYear.toLocaleString()}`}
              />
            )}
            {filter.filters.includeNullCenterIncYear && (
              <FilterBadge filterKey="Timeline" value="Include null/zero" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
SavedFilterCard.displayName = "SavedFilterCard"

// Main component wrapped in memo to prevent unnecessary re-renders
export const SavedFiltersManager = memo(function SavedFiltersManager({
  currentFilters,
  onLoadFilters,
  totalActiveFilters,
  onReset,
  onExport
}: SavedFiltersManagerProps) {
  const supabase = getSupabaseBrowserClient()
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [loading, setLoading] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [manageDialogOpen, setManageDialogOpen] = useState(false)
  const [filterName, setFilterName] = useState("")
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null)
  const [editName, setEditName] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [filterToDelete, setFilterToDelete] = useState<SavedFilter | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setUserId(data.session?.user.id ?? null)
      setAuthReady(true)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      setUserId(session?.user.id ?? null)
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  // Memoize loadSavedFilters to prevent recreation
  const loadSavedFilters = useCallback(async () => {
    if (!userId) {
      setSavedFilters([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("saved_filters")
        .select("id, name, filters, created_at, updated_at")
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      const normalizedFilters = Array.isArray(data)
        ? data
            .map((filter) => {
              try {
                const parsedFilters = typeof filter.filters === "string" ? JSON.parse(filter.filters) : filter.filters
                if (!parsedFilters) return null
                return { ...filter, filters: withFilterDefaults(parsedFilters) } as SavedFilter
              } catch (error) {
                console.error("Failed to parse saved filter:", error)
                return null
              }
            })
            .filter((item): item is SavedFilter => Boolean(item))
        : []
      setSavedFilters(normalizedFilters)
    } catch (error) {
      console.error("Failed to load saved filters:", error)
    } finally {
      setLoading(false)
    }
  }, [supabase, userId])

  // Load saved filters on component mount
  useEffect(() => {
    if (!authReady) return
    loadSavedFilters()
  }, [authReady, loadSavedFilters, userId])

  // Memoize handleSaveFilter
  const handleSaveFilter = useCallback(async () => {
    if (!filterName.trim() || !userId) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("saved_filters")
        .insert({ name: filterName.trim(), filters: currentFilters, user_id: userId })

      if (error) throw error

      setSaveDialogOpen(false)
      setFilterName("")
      await loadSavedFilters()
    } catch (error) {
      console.error("Error saving filter:", error)
    } finally {
      setLoading(false)
    }
  }, [currentFilters, filterName, loadSavedFilters, supabase, userId])

  // Memoize handleLoadFilter
  const handleLoadFilter = useCallback((savedFilter: SavedFilter) => {
    onLoadFilters(savedFilter.filters)
  }, [onLoadFilters])

  // Memoize handleDeleteFilter
  const handleDeleteFilter = useCallback((filter: SavedFilter) => {
    setFilterToDelete(filter)
    setDeleteConfirmOpen(true)
  }, [])

  // Memoize confirmDeleteFilter
  const confirmDeleteFilter = useCallback(async () => {
    if (!filterToDelete) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("saved_filters")
        .delete()
        .eq("id", filterToDelete.id)

      if (error) throw error

      await loadSavedFilters()
      setDeleteConfirmOpen(false)
      setFilterToDelete(null)
    } catch (error) {
      console.error("Error deleting filter:", error)
    } finally {
      setLoading(false)
    }
  }, [filterToDelete, loadSavedFilters, supabase])

  // Memoize handleUpdateFilter
  const handleUpdateFilter = useCallback(async () => {
    if (!editingFilter || !editName.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("saved_filters")
        .update({
          name: editName.trim(),
          filters: editingFilter.filters,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingFilter.id)

      if (error) throw error

      setEditingFilter(null)
      setEditName("")
      await loadSavedFilters()
    } catch (error) {
      console.error("Error updating filter:", error)
    } finally {
      setLoading(false)
    }
  }, [editingFilter, editName, loadSavedFilters, supabase])

  // Memoize getFilterSummary
  const getFilterSummary = useCallback((filters: Filters) => {
    return calculateActiveFilters(filters)
  }, [])

  // Memoize edit handler
  const handleEdit = useCallback((filter: SavedFilter) => {
    setEditingFilter(filter)
    setEditName(filter.name)
  }, [])

  return (
    <div className="flex flex-col gap-3 w-full bg-sidebar-accent/5 p-3 rounded-lg border border-sidebar-border/50">
      <div className="flex items-center gap-2 w-full">
        {/* Load Saved Filters Dropdown - Takes full width minus button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 justify-between bg-background hover:bg-accent/50 border-input/50 h-9"
            >
              <div className="flex items-center gap-2 truncate">
                <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">Saved Filters</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 opacity-50 ml-2 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[220px]" align="start">
            <div className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              My Saved Filters
            </div>
            <DropdownMenuSeparator />
            {savedFilters.length === 0 ? (
              <div className="px-4 py-3 text-sm text-center text-muted-foreground italic">
                No saved filters yet
              </div>
            ) : (
              savedFilters.map((filter) => (
                <DropdownMenuItem key={filter.id} className="flex items-center justify-between p-0 group">
                  <button
                    className="flex-1 flex items-center justify-between px-2 py-2 hover:bg-accent rounded-sm text-left transition-colors"
                    onClick={() => handleLoadFilter(filter)}
                  >
                    <span className="font-medium text-sm truncate max-w-[180px]">{filter.name}</span>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 ml-2 shrink-0 bg-muted/50">
                      {getFilterSummary(filter.filters)}
                    </Badge>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-foreground hover:text-destructive hover:bg-destructive/10 mr-1 transition-all"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteFilter(filter)
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuItem>
              ))
            )}
            {savedFilters.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-8 font-normal text-muted-foreground hover:text-foreground"
                    onClick={() => setManageDialogOpen(true)}
                  >
                    <Settings className="h-3.5 w-3.5 mr-2" />
                    Manage all filters...
                  </Button>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Save Current Filters - Circular Button */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              disabled={totalActiveFilters === 0}
              className="h-9 w-9 rounded-full shrink-0 bg-background hover:bg-primary hover:text-primary-foreground border-input/50 transition-all shadow-sm"
              title="Save current filters"
            >
              <Save className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Filter Configuration</DialogTitle>
              <DialogDescription>
                Save your current layout of {totalActiveFilters} active filters to easily access them later.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="filter-name">Name</Label>
                <Input
                  id="filter-name"
                  placeholder="e.g., Q4 Prospect List, Tech Hiring..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveFilter} disabled={!filterName.trim() || loading}>
                {loading ? "Saving..." : "Save List"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Action Buttons Row */}
      {(onReset || onExport) && (
        <div className="grid grid-cols-2 gap-2 w-full">
          {onReset && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onReset}
              className="w-full h-8 text-xs font-medium bg-secondary/50 hover:bg-secondary/80 text-secondary-foreground border border-transparent hover:border-border/50 transition-all"
            >
              Reset
            </Button>
          )}
          {onExport && (
            <Button
              variant="default"
              size="sm"
              onClick={onExport}
              className="w-full h-8 text-xs font-medium shadow-none hover:shadow-sm transition-all"
            >
              Export
            </Button>
          )}
        </div>
      )}

      {/* Logic for Managing and Deleting Filters (unchanged usually but included for completeness in single file) */}

      {/* Manage Saved Filters */}
      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Saved Filters</DialogTitle>
            <DialogDescription>View, edit, or delete your saved filter sets.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {savedFilters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No saved filters found.</div>
            ) : (
              savedFilters.map((filter) => (
                <SavedFilterCard
                  key={filter.id}
                  filter={filter}
                  onLoad={(f) => {
                    handleLoadFilter(f)
                    setManageDialogOpen(false)
                  }}
                  onEdit={handleEdit}
                  onDelete={handleDeleteFilter}
                />
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Filter Set</AlertDialogTitle>
            <AlertDialogDescription>
              {`Are you sure you want to delete "${filterToDelete?.name ?? ""}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFilterToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFilter} className="bg-destructive hover:bg-destructive/90" disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Filter Dialog */}
      <Dialog
        open={!!editingFilter}
        onOpenChange={(open) => {
          if (!open) {
            setEditingFilter(null)
            setEditName("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Filter Set</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingFilter(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFilter} disabled={!editName.trim() || loading}>
              {loading ? "Updating..." : "Update Name"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
})
