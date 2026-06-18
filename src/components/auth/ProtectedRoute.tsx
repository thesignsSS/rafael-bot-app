import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import { hasRouteAccess } from '../../lib/auth/roles'
import type { UserRole } from '../../lib/auth/roles'

type ProtectedRouteProps = {
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const { session, role, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          redirectTo: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    )
  }

  if (!hasRouteAccess(role, allowedRoles)) {
    return (
      <Navigate to="/" replace state={{ permissionDenied: true }} />
    )
  }

  return <Outlet />
}
