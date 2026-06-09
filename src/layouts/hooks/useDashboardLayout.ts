import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMobileSidebar } from '../../components/dashboard/hooks/useMobileSidebar'
import { useAuth } from '../../contexts/auth-context'
import { usePermissionDeniedToast } from '../../hooks/usePermissionDeniedToast'

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Nova Proposta',
  '/propostas': 'Minhas Propostas',
}

export function useDashboardLayout() {
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isOpen: isSidebarOpen, open: openSidebar, close: closeSidebar } =
    useMobileSidebar()

  usePermissionDeniedToast()

  const title = useMemo(() => {
    if (pathname === '/propostas' && isAdmin) {
      return 'Todas as Propostas'
    }

    return ROUTE_TITLES[pathname] ?? 'Rafael Bot'
  }, [pathname, isAdmin])

  const handleSignOut = useCallback(async () => {
    await signOut()
    navigate('/login', { replace: true })
  }, [signOut, navigate])

  useEffect(() => {
    closeSidebar()
  }, [pathname, closeSidebar])

  return {
    title,
    user,
    isAdmin,
    handleSignOut,
    isSidebarOpen,
    openSidebar,
    closeSidebar,
  }
}
