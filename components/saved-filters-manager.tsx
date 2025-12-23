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
import { saveFilterSet, getSavedFilters, deleteSavedFilter, updateSavedFilter } from "@/app/actions"

interface Filters {
  accountCountries: string[]
  accountRegions: string[]
  accountIndustries: string[]
  accountSubIndustries: string[]
  accountPrimaryCategories: string[]
  accountPrimaryNatures: string[]
  accountNasscomStatuses: string[]
  accountEmployeesRanges: string[]
  accountCenterEmployees: string[]
  centerTypes: string[]
  centerFocus: string[]
  centerCities: string[]
  centerStates: string[]
  centerCountries: string[]
  centerEmployees: string[]
  centerStatuses: string[]
  functionTypes: string[]
  searchTerm: string
}

interface SavedFilter {
  id: number
  name: string
  filters: Filters
  created_at: string
  updated_at: string
}

interface SavedFiltersManagerProps {
  currentFilters: Filters
  onLoadFilters: (filters: Filters) => void
  totalActiveFilters: number
  onReset?: () => void
  onExport?: () => void
}

// Memoized FilterBadge component to prevent re-renders
const FilterBadge = memo(({ filterKey, value }: { filterKey: string; value: string }) => (
  <Badge variant="outline" className="text-xs">
    {filterKey}: {value}
  </Badge>
))
FilterBadge.displayName = "FilterBadge"

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
    const filters = filter.filters
    return (
      filters.accountCountries.length +
      filters.accountRegions.length +
      filters.accountIndustries.length +
      filters.accountSubIndustries.length +
      filters.accountPrimaryCategories.length +
      filters.accountPrimaryNatures.length +
      filters.accountNasscomStatuses.length +
      filters.accountEmployeesRanges.length +
      filters.accountCenterEmployees.length +
      filters.centerTypes.length +
      filters.centerFocus.length +
      filters.centerCities.length +
      filters.centerStates.length +
      filters.centerCountries.length +
      filters.centerEmployees.length +
      filters.centerStatuses.length +
      filters.functionTypes.length +
      (filters.searchTerm ? 1 : 0)
    )
  }, [filter.filters])

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
            {filter.filters.accountCountries.map((country) => (
              <FilterBadge key={`country-${country}`} filterKey="Country" value={country} />
            ))}
            {filter.filters.accountRegions.map((region) => (
              <FilterBadge key={`region-${region}`} filterKey="Region" value={region} />
            ))}
            {filter.filters.accountIndustries.map((industry) => (
              <FilterBadge key={`industry-${industry}`} filterKey="Industry" value={industry} />
            ))}
            {filter.filters.accountSubIndustries.map((subIndustry) => (
              <FilterBadge key={`subind-${subIndustry}`} filterKey="Sub Industry" value={subIndustry} />
            ))}
            {filter.filters.accountPrimaryCategories.map((category) => (
              <FilterBadge key={`cat-${category}`} filterKey="Category" value={category} />
            ))}
            {filter.filters.accountPrimaryNatures.map((nature) => (
              <FilterBadge key={`nature-${nature}`} filterKey="Nature" value={nature} />
            ))}
            {filter.filters.accountNasscomStatuses.map((status) => (
              <FilterBadge key={`nasscom-${status}`} filterKey="NASSCOM" value={status} />
            ))}
            {filter.filters.accountEmployeesRanges.map((range) => (
              <FilterBadge key={`emprange-${range}`} filterKey="Emp Range" value={range} />
            ))}
            {filter.filters.accountCenterEmployees.map((emp) => (
              <FilterBadge key={`centemp-${emp}`} filterKey="Center Emp" value={emp} />
            ))}
            {filter.filters.centerTypes.map((type) => (
              <FilterBadge key={`type-${type}`} filterKey="Type" value={type} />
            ))}
            {filter.filters.centerCities.map((city) => (
              <FilterBadge key={`city-${city}`} filterKey="City" value={city} />
            ))}
            {filter.filters.centerCountries.map((country) => (
              <FilterBadge key={`centcountry-${country}`} filterKey="Center Country" value={country} />
            ))}
            {filter.filters.centerEmployees.map((emp) => (
              <FilterBadge key={`centemps-${emp}`} filterKey="Center Employees" value={emp} />
            ))}
            {filter.filters.centerStatuses.map((status) => (
              <FilterBadge key={`centstatus-${status}`} filterKey="Center Status" value={status} />
            ))}
            {filter.filters.searchTerm && (
              <FilterBadge filterKey="Search" value={`"${filter.filters.searchTerm}"`} />
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
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [loading, setLoading] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [manageDialogOpen, setManageDialogOpen] = useState(false)
  const [filterName, setFilterName] = useState("")
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null)
  const [editName, setEditName] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [filterToDelete, setFilterToDelete] = useState<SavedFilter | null>(null)

  // Memoize loadSavedFilters to prevent recreation
  const loadSavedFilters = useCallback(async () => {
    setLoading(true)
    try {
      const filters = await getSavedFilters()
      setSavedFilters(filters)
    } catch (error) {
      console.error("Failed to load saved filters:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load saved filters on component mount
  useEffect(() => {
    loadSavedFilters()
  }, [loadSavedFilters])

  // Memoize handleSaveFilter
  const handleSaveFilter = useCallback(async () => {
    if (!filterName.trim()) return

    setLoading(true)
    try {
      const result = await saveFilterSet(filterName.trim(), currentFilters)
      if (result.success) {
        setSaveDialogOpen(false)
        setFilterName("")
        await loadSavedFilters()
      } else {
        console.error("Failed to save filter:", result.error)
      }
    } catch (error) {
      console.error("Error saving filter:", error)
    } finally {
      setLoading(false)
    }
  }, [filterName, currentFilters, loadSavedFilters])

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
      const result = await deleteSavedFilter(filterToDelete.id)
      if (result.success) {
        await loadSavedFilters()
        setDeleteConfirmOpen(false)
        setFilterToDelete(null)
      } else {
        console.error("Failed to delete filter:", result.error)
      }
    } catch (error) {
      console.error("Error deleting filter:", error)
    } finally {
      setLoading(false)
    }
  }, [filterToDelete, loadSavedFilters])

  // Memoize handleUpdateFilter
  const handleUpdateFilter = useCallback(async () => {
    if (!editingFilter || !editName.trim()) return

    setLoading(true)
    try {
      const result = await updateSavedFilter(editingFilter.id, editName.trim(), editingFilter.filters)
      if (result.success) {
        setEditingFilter(null)
        setEditName("")
        await loadSavedFilters()
      } else {
        console.error("Failed to update filter:", result.error)
      }
    } catch (error) {
      console.error("Error updating filter:", error)
    } finally {
      setLoading(false)
    }
  }, [editingFilter, editName, loadSavedFilters])

  // Memoize getFilterSummary
  const getFilterSummary = useCallback((filters: Filters) => {
    const activeFilters = [
      ...filters.accountCountries,
      ...filters.accountRegions,
      ...filters.accountIndustries,
      ...filters.accountSubIndustries,
      ...filters.accountPrimaryCategories,
      ...filters.accountPrimaryNatures,
      ...filters.accountNasscomStatuses,
      ...filters.accountEmployeesRanges,
      ...filters.accountCenterEmployees,
      ...filters.centerTypes,
      ...filters.centerFocus,
      ...filters.centerCities,
      ...filters.centerStates,
      ...filters.centerCountries,
      ...filters.centerEmployees,
      ...filters.centerStatuses,
      ...filters.functionTypes,
    ]

    if (filters.searchTerm) {
      activeFilters.push(`Search: "${filters.searchTerm}"`)
    }

    return activeFilters.length
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
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 mr-1 transition-all"
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
