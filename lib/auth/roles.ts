export type UserRole = "viewer" | "admin"

export const DEFAULT_USER_ROLE: UserRole = "viewer"

export function normalizeUserRole(role: unknown): UserRole {
  return role === "admin" ? "admin" : "viewer"
}

export function canExportData(role: UserRole): boolean {
  return role === "admin"
}
