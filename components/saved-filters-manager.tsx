"use client"

import { useState, useCallback, useEffect, memo } from "react"
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
import { Save, FolderOpen, Settings, X, ChevronDown } from "lucide-react"
import { captureEvent } from "@/lib/analytics/client"
import { ANALYTICS_EVENTS } from "@/lib/analytics/events"
import { buildTrackedFiltersSnapshot, normalizeTrackedText, toTrackedStringArray } from "@/lib/analytics/tracking"
import type { Filters } from "@/lib/types"
import { calculateActiveFilters } from "@/lib/dashboard/filter-summary"
import { SavedFilterCard, type SavedFilter } from "@/components/filters/saved-filter-card"
import { useSavedFilters } from "@/hooks/use-saved-filters"

interface SavedFiltersManagerProps {
  currentFilters: Filters
  onLoadFilters: (filters: Filters) => void
  totalActiveFilters: number
  onReset?: () => void
  onExport?: () => void
}

export const SavedFiltersManager = memo(function SavedFiltersManager({
  currentFilters,
  onLoadFilters,
  totalActiveFilters,
  onReset,
  onExport
}: SavedFiltersManagerProps) {
  const { 
    savedFilters, 
    loading, 
    saveFilter, 
    deleteFilter, 
    updateFilter 
  } = useSavedFilters()

  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [manageDialogOpen, setManageDialogOpen] = useState(false)
  const [savedFiltersDropdownOpen, setSavedFiltersDropdownOpen] = useState(false)
  const [filterName, setFilterName] = useState("")
  
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null)
  const [editName, setEditName] = useState("")
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [filterToDelete, setFilterToDelete] = useState<SavedFilter | null>(null)

  const handleSaveFilter = useCallback(async () => {
    const success = await saveFilter(filterName, currentFilters)
    if (success) {
      setSaveDialogOpen(false)
      setFilterName("")
    }
  }, [currentFilters, filterName, saveFilter])

  const handleLoadFilter = useCallback((savedFilter: SavedFilter) => {
    onLoadFilters(savedFilter.filters)
    captureEvent(ANALYTICS_EVENTS.SAVED_FILTER_LOADED, {
      saved_filter_id: savedFilter.id,
      saved_filter_name: normalizeTrackedText(savedFilter.name),
      loaded_active_filters_count: calculateActiveFilters(savedFilter.filters),
      loaded_filters_snapshot: buildTrackedFiltersSnapshot(savedFilter.filters),
    })
  }, [onLoadFilters])

  const handleDeleteFilter = useCallback((filter: SavedFilter) => {
    setFilterToDelete(filter)
    setDeleteConfirmOpen(true)
  }, [])

  const confirmDeleteFilter = useCallback(async () => {
    if (!filterToDelete) return
    const success = await deleteFilter(filterToDelete.id)
    if (success) {
      setDeleteConfirmOpen(false)
      setFilterToDelete(null)
    }
  }, [filterToDelete, deleteFilter])

  const handleUpdateFilter = useCallback(async () => {
    if (!editingFilter || !editName.trim()) return
    const success = await updateFilter(editingFilter.id, editName, editingFilter.filters)
    if (success) {
      setEditingFilter(null)
      setEditName("")
    }
  }, [editingFilter, editName, updateFilter])

  const getFilterSummary = useCallback((filters: Filters) => {
    return calculateActiveFilters(filters)
  }, [])

  const handleEdit = useCallback((filter: SavedFilter) => {
    setEditingFilter(filter)
    setEditName(filter.name)
  }, [])

  useEffect(() => {
    if (!savedFiltersDropdownOpen) return
    captureEvent(ANALYTICS_EVENTS.SAVED_FILTERS_DROPDOWN_OPENED, {
      saved_filter_count: savedFilters.length,
      saved_filter_ids: toTrackedStringArray(savedFilters.map((filter) => filter.id)),
      saved_filter_names: toTrackedStringArray(savedFilters.map((filter) => filter.name)),
    })
  }, [savedFiltersDropdownOpen, savedFilters])

  useEffect(() => {
    if (!saveDialogOpen) return
    captureEvent(ANALYTICS_EVENTS.SAVED_FILTER_SAVE_DIALOG_OPENED, {
      total_active_filters: totalActiveFilters,
      current_filters_snapshot: buildTrackedFiltersSnapshot(currentFilters),
    })
  }, [saveDialogOpen, totalActiveFilters, currentFilters])

  useEffect(() => {
    if (!manageDialogOpen) return
    captureEvent(ANALYTICS_EVENTS.SAVED_FILTERS_MANAGE_OPENED, {
      saved_filter_count: savedFilters.length,
      saved_filter_ids: toTrackedStringArray(savedFilters.map((filter) => filter.id)),
      saved_filter_names: toTrackedStringArray(savedFilters.map((filter) => filter.name)),
    })
  }, [manageDialogOpen, savedFilters])

  useEffect(() => {
    if (!deleteConfirmOpen) return
    captureEvent(ANALYTICS_EVENTS.SAVED_FILTER_DELETE_CONFIRM_OPENED, {
      saved_filter_id: filterToDelete?.id ?? null,
      saved_filter_name: filterToDelete?.name ? normalizeTrackedText(filterToDelete.name) : null,
      saved_filter_active_filters_count: filterToDelete ? calculateActiveFilters(filterToDelete.filters) : null,
      saved_filter_snapshot: filterToDelete ? buildTrackedFiltersSnapshot(filterToDelete.filters) : null,
    })
  }, [deleteConfirmOpen, filterToDelete])

  return (
    <div className="flex flex-col gap-3 w-full bg-sidebar-accent/5 p-3 rounded-lg border border-sidebar-border/50">
      <div className="flex items-center gap-2 w-full">
        <DropdownMenu open={savedFiltersDropdownOpen} onOpenChange={setSavedFiltersDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 justify-between h-9"
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
                    className="flex-1 flex items-center justify-between px-2 py-2 hover:bg-accent/40 rounded-sm text-left transition-colors duration-150"
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
                    className="h-7 w-7 text-foreground hover:text-destructive hover:bg-destructive/5 mr-1 transition-colors duration-150"
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

        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              disabled={totalActiveFilters === 0}
              className="h-9 w-9 rounded-full shrink-0"
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

      {(onReset || onExport) && (
        <div className="grid grid-cols-2 gap-2 w-full">
          {onReset && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="w-full h-8 text-xs font-medium"
            >
              Reset
            </Button>
          )}
          {onExport && (
            <Button
              variant="default"
              size="sm"
              onClick={onExport}
              className="w-full h-8 text-xs font-medium"
            >
              Export
            </Button>
          )}
        </div>
      )}

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
            <AlertDialogAction
              onClick={confirmDeleteFilter}
              className="bg-destructive hover:bg-destructive/90"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
