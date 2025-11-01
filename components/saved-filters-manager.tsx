"use client"

import { useState, useEffect } from "react"
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

export function SavedFiltersManager({ currentFilters, onLoadFilters, totalActiveFilters }: SavedFiltersManagerProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [loading, setLoading] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [manageDialogOpen, setManageDialogOpen] = useState(false)
  const [filterName, setFilterName] = useState("")
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null)
  const [editName, setEditName] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [filterToDelete, setFilterToDelete] = useState<SavedFilter | null>(null)

  // Load saved filters on component mount
  useEffect(() => {
    loadSavedFilters()
  }, [])

  const loadSavedFilters = async () => {
    setLoading(true)
    try {
      const filters = await getSavedFilters()
      setSavedFilters(filters)
    } catch (error) {
      console.error("Failed to load saved filters:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFilter = async () => {
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
  }

  const handleLoadFilter = (savedFilter: SavedFilter) => {
    onLoadFilters(savedFilter.filters)
  }

  const handleDeleteFilter = async (filter: SavedFilter) => {
    setFilterToDelete(filter)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteFilter = async () => {
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
  }

  const handleUpdateFilter = async () => {
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
  }

  const getFilterSummary = (filters: Filters) => {
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
  }

  return (
    <div className="flex items-center gap-2">
      {/* Save Current Filters */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={totalActiveFilters === 0}
            className="flex items-center gap-2 bg-transparent"
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
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Current Filters Summary:</p>
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
      {savedFilters.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <FolderOpen className="h-4 w-4" />
              Load saved filters...
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80">
            <div className="px-2 py-1.5 text-sm font-medium text-gray-700">Saved Filter Sets</div>
            <DropdownMenuSeparator />
            {savedFilters.map((filter) => (
              <DropdownMenuItem key={filter.id} className="flex items-center justify-between p-0">
                <button
                  className="flex-1 flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded text-left"
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
                className="w-full justify-start text-gray-600"
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
      {savedFilters.length > 0 && (
        <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Saved Filters</DialogTitle>
              <DialogDescription>View, edit, or delete your saved filter sets.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {savedFilters.map((filter) => (
                <Card key={filter.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{filter.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{getFilterSummary(filter.filters)} filters</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingFilter(filter)
                            setEditName(filter.name)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteFilter(filter)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
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
                        <Button variant="outline" size="sm" onClick={() => handleLoadFilter(filter)}>
                          <Filter className="h-4 w-4 mr-2" />
                          Load Filters
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {filter.filters.accountCountries.map((country) => (
                          <Badge key={country} variant="outline" className="text-xs">
                            Country: {country}
                          </Badge>
                        ))}
                        {filter.filters.accountRegions.map((region) => (
                          <Badge key={region} variant="outline" className="text-xs">
                            Region: {region}
                          </Badge>
                        ))}
                        {filter.filters.accountIndustries.map((industry) => (
                          <Badge key={industry} variant="outline" className="text-xs">
                            Industry: {industry}
                          </Badge>
                        ))}
                        {filter.filters.accountSubIndustries.map((subIndustry) => (
                          <Badge key={subIndustry} variant="outline" className="text-xs">
                            Sub Industry: {subIndustry}
                          </Badge>
                        ))}
                        {filter.filters.accountPrimaryCategories.map((category) => (
                          <Badge key={category} variant="outline" className="text-xs">
                            Category: {category}
                          </Badge>
                        ))}
                        {filter.filters.accountPrimaryNatures.map((nature) => (
                          <Badge key={nature} variant="outline" className="text-xs">
                            Nature: {nature}
                          </Badge>
                        ))}
                        {filter.filters.accountNasscomStatuses.map((status) => (
                          <Badge key={status} variant="outline" className="text-xs">
                            NASSCOM: {status}
                          </Badge>
                        ))}
                        {filter.filters.accountEmployeesRanges.map((range) => (
                          <Badge key={range} variant="outline" className="text-xs">
                            Emp Range: {range}
                          </Badge>
                        ))}
                        {filter.filters.accountCenterEmployees.map((emp) => (
                          <Badge key={emp} variant="outline" className="text-xs">
                            Center Emp: {emp}
                          </Badge>
                        ))}
                        {filter.filters.centerTypes.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            Type: {type}
                          </Badge>
                        ))}
                        {filter.filters.centerCities.map((city) => (
                          <Badge key={city} variant="outline" className="text-xs">
                            City: {city}
                          </Badge>
                        ))}
                        {filter.filters.centerCountries.map((country) => (
                          <Badge key={country} variant="outline" className="text-xs">
                            Center Country: {country}
                          </Badge>
                        ))}
                        {filter.filters.centerEmployees.map((emp) => (
                          <Badge key={emp} variant="outline" className="text-xs">
                            Center Employees: {emp}
                          </Badge>
                        ))}
                        {filter.filters.centerStatuses.map((status) => (
                          <Badge key={status} variant="outline" className="text-xs">
                            Center Status: {status}
                          </Badge>
                        ))}
                        {filter.filters.searchTerm && (
                          <Badge variant="outline" className="text-xs">
                            Search: "{filter.filters.searchTerm}"
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
              Are you sure you want to delete "{filterToDelete?.name}"? This action cannot be undone.
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
}
