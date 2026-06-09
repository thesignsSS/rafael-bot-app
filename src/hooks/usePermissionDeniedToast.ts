import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

type PermissionDeniedState = {
  permissionDenied?: boolean
}

export function usePermissionDeniedToast() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const state = location.state as PermissionDeniedState | null

    if (!state?.permissionDenied) {
      return
    }

    toast.error('Sem permissão')

    navigate(location.pathname, { replace: true, state: {} })
  }, [location.pathname, location.state, navigate])
}
