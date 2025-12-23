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
  totalActiveFilters 
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

  const hasSavedFilters = savedFilters.length > 0

  return (
    <div className={`grid w-full gap-2 ${hasSavedFilters ? "grid-cols-2" : "grid-cols-1"}`}>
      {/* Save Current Filters */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={totalActiveFilters === 0}
            className="h-10 w-full items-center justify-center gap-2 border-dashed border-sidebar-border/70 bg-background/70"
          >
            <Save className="h-4 w-4" />
            Save Filters
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current Filters</DialogTitle>
            <DialogDescription>Give your current filter combination a name to save it for later use.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Filter Set Name</Label>
              <Input
                id="filter-name"
                placeholder="e.g., US Tech Companies, Indian Centers..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-2">Current Filters Summary:</p>
              <Badge variant="secondary">{totalActiveFilters} active filters</Badge>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFilter} disabled={!filterName.trim() || loading}>
              {loading ? "Saving..." : "Save Filters"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Saved Filters with Delete Option */}
      {hasSavedFilters && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="h-10 w-full items-center justify-center gap-2 border border-sidebar-border/60 bg-background"
            >
              <FolderOpen className="h-4 w-4" />
              Load saved filters
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80">
            <div className="px-2 py-1.5 text-sm font-medium text-foreground">Saved Filter Sets</div>
            <DropdownMenuSeparator />
            {savedFilters.map((filter) => (
              <DropdownMenuItem key={filter.id} className="flex items-center justify-between p-0">
                <button
                  className="flex-1 flex items-center justify-between px-2 py-1.5 hover:bg-muted rounded text-left"
                  onClick={() => handleLoadFilter(filter)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{filter.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {getFilterSummary(filter.filters)}
                    </Badge>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 mr-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteFilter(filter)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-0">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                onClick={() => setManageDialogOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage all filters...
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Manage Saved Filters */}
      {hasSavedFilters && (
        <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Saved Filters</DialogTitle>
              <DialogDescription>View, edit, or delete your saved filter sets.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {savedFilters.map((filter) => (
                <SavedFilterCard
                  key={filter.id}
                  filter={filter}
                  onLoad={handleLoadFilter}
                  onEdit={handleEdit}
                  onDelete={handleDeleteFilter}
                />
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

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
            <AlertDialogAction onClick={confirmDeleteFilter} className="bg-red-600 hover:bg-red-700" disabled={loading}>
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
            <DialogTitle>Edit Filter Name</DialogTitle>
            <DialogDescription>Change the name of your saved filter set.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Filter Set Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFilter(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFilter} disabled={!editName.trim() || loading}>
              {loading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
})
