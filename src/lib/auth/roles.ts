import type { User } from '@supabase/supabase-js'

export const KNOWN_ROLES = ['admin', 'corretor'] as const

export type UserRole = (typeof KNOWN_ROLES)[number]

export const DEFAULT_ROLE: UserRole = 'corretor'

const isKnownRole = (value: unknown): value is UserRole =>
  typeof value === 'string' &&
  (KNOWN_ROLES as readonly string[]).includes(value)

export function parseUserRole(user: User | null): UserRole {
  const rawRole = user?.app_metadata?.role

  if (isKnownRole(rawRole)) {
    return rawRole
  }

  return DEFAULT_ROLE
}

export function hasRouteAccess(
  userRole: UserRole,
  allowedRoles?: UserRole[],
): boolean {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true
  }

  return allowedRoles.includes(userRole)
}

export function isAdminRole(role: UserRole): boolean {
  return role === 'admin'
}

export function isCorretorRole(role: UserRole): boolean {
  return role === 'corretor'
}
