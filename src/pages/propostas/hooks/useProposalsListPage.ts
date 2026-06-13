import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/auth-context'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'

export function useProposalsListPage() {
  const { isAdmin } = useAuth()

  useDocumentTitle(
    isAdmin ? 'Todas as Propostas | Effectus' : 'Minhas Propostas | Effectus',
  )

  const navigate = useNavigate()

  const goToNewProposal = useCallback(() => {
    navigate('/')
  }, [navigate])

  const goToProposalDetail = useCallback(
    (proposalId: string) => {
      navigate(`/propostas/${proposalId}`)
    },
    [navigate],
  )

  return { goToNewProposal, goToProposalDetail }
}
