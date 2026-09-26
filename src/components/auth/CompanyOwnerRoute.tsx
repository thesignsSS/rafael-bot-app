import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'

/** Só o dono da empresa (quem contratou o plano). O backend também bloqueia. */
export function CompanyOwnerRoute() {
  const { currentUserProfile, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!currentUserProfile?.isCompanyOwner) {
    return <Navigate to="/" replace state={{ permissionDenied: true }} />
  }

  return <Outlet />
}
