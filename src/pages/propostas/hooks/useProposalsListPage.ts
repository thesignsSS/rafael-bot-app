import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'

export function useProposalsListPage() {
  useDocumentTitle('Minhas Propostas | Rafael Bot')

  const navigate = useNavigate()

  const goToNewProposal = useCallback(() => {
    navigate('/')
  }, [navigate])

  return { goToNewProposal }
}
