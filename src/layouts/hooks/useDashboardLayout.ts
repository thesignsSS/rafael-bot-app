import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMobileSidebar } from '../../components/dashboard/hooks/useMobileSidebar'
import { useAuth } from '../../contexts/auth-context'
import { usePermissionDeniedToast } from '../../hooks/usePermissionDeniedToast'

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Nova Proposta',
  '/propostas': 'Minhas Propostas',
  '/perfil': 'Meu Perfil',
  '/admin': 'Gerenciar Perfis',
  '/admin/whatsapp': 'Bot do WhatsApp',
}

function resolveRouteTitle(pathname: string, isAdmin: boolean): string {
  if (pathname.startsWith('/propostas/')) {
    return 'Detalhes da Proposta'
  }

  if (pathname === '/propostas' && isAdmin) {
    return 'Todas as Propostas'
  }

  return ROUTE_TITLES[pathname] ?? 'Effectus'
}

export function useDashboardLayout() {
  const { currentUserProfile, user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isOpen: isSidebarOpen, open: openSidebar, close: closeSidebar } =
    useMobileSidebar()

  usePermissionDeniedToast()

  const title = useMemo(
    () => resolveRouteTitle(pathname, isAdmin),
    [pathname, isAdmin],
  )

  const handleSignOut = useCallback(async () => {
    await signOut()
    navigate('/login', { replace: true })
  }, [signOut, navigate])

  const handleOpenProfile = useCallback(() => {
    navigate('/perfil')
  }, [navigate])

  useEffect(() => {
    closeSidebar()
  }, [pathname, closeSidebar])

  return {
    title,
    currentUserProfile,
    user,
    isAdmin,
    handleOpenProfile,
    handleSignOut,
    isSidebarOpen,
    openSidebar,
    closeSidebar,
  }
}
