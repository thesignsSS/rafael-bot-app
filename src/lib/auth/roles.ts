import type { User } from '@supabase/supabase-js'

export const KNOWN_ROLES = ['admin', 'broker'] as const

export type UserRole = (typeof KNOWN_ROLES)[number]

export const DEFAULT_ROLE: UserRole = 'broker'

const ROLE_ALIASES: Record<string, UserRole> = {
  admin: 'admin',
  broker: 'broker',
  corretor: 'broker',
}

function normalizeRole(value: unknown): UserRole | null {
  if (typeof value !== 'string') {
    return null
  }

  return ROLE_ALIASES[value] ?? null
}

export function parseUserRole(input: User | null | string | null): UserRole {
  const rawRole = typeof input === 'string' || input === null
    ? input
    : input?.app_metadata?.role

  const normalizedRole = normalizeRole(rawRole)

  if (normalizedRole) {
    return normalizedRole
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

export function isBrokerRole(role: UserRole): boolean {
  return role === 'broker'
}

export function isCorretorRole(role: UserRole): boolean {
  return isBrokerRole(role)
}
