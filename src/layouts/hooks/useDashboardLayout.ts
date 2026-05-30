import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMobileSidebar } from '../../components/dashboard/hooks/useMobileSidebar'
import { useAuth } from '../../contexts/auth-context'

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Nova Proposta',
  '/propostas': 'Minhas Propostas',
}

export function useDashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isOpen: isSidebarOpen, open: openSidebar, close: closeSidebar } =
    useMobileSidebar()

  const title = useMemo(
    () => ROUTE_TITLES[pathname] ?? 'Rafael Bot',
    [pathname],
  )

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
    handleSignOut,
    isSidebarOpen,
    openSidebar,
    closeSidebar,
  }
}
