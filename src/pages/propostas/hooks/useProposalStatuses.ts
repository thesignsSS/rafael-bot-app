import { useCallback, useEffect, useState } from 'react'
import { fetchProposalStatuses } from '../lib/proposalsApi'
import {
  DEFAULT_PROPOSAL_STATUS_OPTIONS,
  type ProposalStatusOption,
} from '../types/proposal-status'

export function useProposalStatuses() {
  const [statusOptions, setStatusOptions] = useState<ProposalStatusOption[]>(
    DEFAULT_PROPOSAL_STATUS_OPTIONS,
  )
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true)

  const loadStatusOptions = useCallback(async () => {
    try {
      setIsLoadingStatuses(true)
      const options = await fetchProposalStatuses()
      setStatusOptions(options)
    } finally {
      setIsLoadingStatuses(false)
    }
  }, [])

  useEffect(() => {
    void loadStatusOptions()
  }, [loadStatusOptions])

  return {
    statusOptions,
    isLoadingStatuses,
    refetchStatusOptions: loadStatusOptions,
  }
}
