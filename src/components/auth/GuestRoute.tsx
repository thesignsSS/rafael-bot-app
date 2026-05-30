import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'

export function GuestRoute() {
  const { session, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (session) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
