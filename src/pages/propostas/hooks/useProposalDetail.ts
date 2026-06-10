import { useMemo } from 'react'
import { useAuth } from '../../../contexts/auth-context'
import { getProposalDetailForUser } from '../mocks/proposal-detail.mock'

export type ProposalDetailStatus = 'loading' | 'ready' | 'not_found'

export function useProposalDetail(proposalId: string | undefined) {
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth()

  const status: ProposalDetailStatus = useMemo(() => {
    if (isAuthLoading || !proposalId) {
      return 'loading'
    }

    const detail = getProposalDetailForUser(
      proposalId,
      user?.id ?? null,
      isAdmin,
    )

    return detail ? 'ready' : 'not_found'
  }, [isAuthLoading, proposalId, user?.id, isAdmin])

  const proposal = useMemo(() => {
    if (!proposalId || status !== 'ready') {
      return null
    }

    return getProposalDetailForUser(proposalId, user?.id ?? null, isAdmin)
  }, [proposalId, status, user?.id, isAdmin])

  return { status, proposal }
}
