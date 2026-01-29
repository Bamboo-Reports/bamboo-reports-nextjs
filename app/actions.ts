/**
 * This file is now a central export point for server actions.
 * The implementation has been split into modular files in:
 * - lib/db/connection.ts
 * - lib/db/cache.ts
 * - app/actions/data.ts
 * - app/actions/saved-filters.ts
 * - app/actions/system.ts
 */

export { clearCache } from "@/lib/db/cache"
export { 
  getAccounts, 
  getCenters, 
  getFunctions, 
  getServices, 
  getTech, 
  getProspects, 
  getAllData, 
  getFilteredAccounts,
  loadData,
  exportToExcel,
} from "@/app/actions/data"
export { 
  saveFilterSet, 
  getSavedFilters, 
  deleteSavedFilter, 
  updateSavedFilter, 
  loadFilterSets, 
  deleteFilterSet,
  type FilterSet
} from "@/app/actions/saved-filters"
export { 
  testConnection, 
  getDatabaseStatus 
} from "@/app/actions/system"
