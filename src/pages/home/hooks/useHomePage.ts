import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/auth-context'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'

export function useHomePage() {
  useDocumentTitle('Nova Proposta | Rafael Bot')

  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = useCallback(async () => {
    await signOut()
    navigate('/login', { replace: true })
  }, [signOut, navigate])

  return { user, handleSignOut }
}
