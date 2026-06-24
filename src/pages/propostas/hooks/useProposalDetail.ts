import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../../contexts/auth-context'
import { fetchProposalDetail } from '../lib/proposalsApi'
import type { ProposalDetail } from '../types/proposal-detail'

export type ProposalDetailStatus = 'loading' | 'ready' | 'not_found' | 'error'

export function useProposalDetail(proposalId: string | undefined) {
  const { user, isLoading: isAuthLoading } = useAuth()
  const brokerUserId = user?.id ?? null

  const [status, setStatus] = useState<ProposalDetailStatus>('loading')
  const [proposal, setProposal] = useState<ProposalDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadProposal = useCallback(async () => {
    if (isAuthLoading) {
      return
    }

    if (!proposalId || !brokerUserId) {
      setProposal(null)
      setError('Sessão expirada. Faça login novamente para consultar a proposta.')
      setStatus('error')
      return
    }

    try {
      setStatus('loading')
      setError(null)

      const detail = await fetchProposalDetail(proposalId, brokerUserId)

      setProposal(detail)
      setStatus('ready')
    } catch (requestError) {
      setProposal(null)

      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível carregar a proposta.'

      setError(message)
      setStatus(message === 'Proposta não encontrada.' ? 'not_found' : 'error')
    }
  }, [brokerUserId, isAuthLoading, proposalId])

  useEffect(() => {
    void loadProposal()
  }, [loadProposal])

  const updateProposalState = useCallback(
    (updater: (currentProposal: ProposalDetail) => ProposalDetail) => {
      setProposal((currentProposal) =>
        currentProposal ? updater(currentProposal) : currentProposal,
      )
    },
    [],
  )

  return { status, proposal, error, refetch: loadProposal, updateProposalState }
}
