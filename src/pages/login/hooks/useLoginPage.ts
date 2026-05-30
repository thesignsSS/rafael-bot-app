import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'

export function useLoginPage() {
  useDocumentTitle('Rafael Bot - Login')

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const state = location.state as { passwordReset?: boolean } | null
    if (state?.passwordReset) {
      toast.success(
        'Senha redefinida com sucesso. Faça login com sua nova senha.',
      )
      navigate('.', { replace: true, state: {} })
    }
  }, [location.state, navigate])
}
