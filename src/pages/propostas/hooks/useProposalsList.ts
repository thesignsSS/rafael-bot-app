import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../../contexts/auth-context'
import { fetchProposals, updateProposalStatus } from '../lib/proposalsApi'
import type { ProposalListItem } from '../types/proposal-list-item'
import {
  normalizeProposalStatus,
  type ProposalStatus,
} from '../types/proposal-status'
import { useProposalStatuses } from './useProposalStatuses'

const PAGE_SIZE = 100
const SEARCH_DEBOUNCE_MS = 300

export function useProposalsList() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const brokerUserId = user?.id ?? null

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [items, setItems] = useState<ProposalListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [movingProposalId, setMovingProposalId] = useState<string | null>(null)
  const [pendingMoveProposalId, setPendingMoveProposalId] = useState<string | null>(null)
  const [pendingReasonDraft, setPendingReasonDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { statusOptions, isLoadingStatuses } = useProposalStatuses()

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeout)
  }, [query])

  const loadProposals = useCallback(async () => {
    if (isAuthLoading) {
      return
    }

    if (!brokerUserId) {
      setItems([])
      setTotalCount(0)
      setError('Sessão expirada. Faça login novamente para consultar propostas.')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const firstPage = await fetchProposals({
        brokerUserId,
        page: 1,
        pageSize: PAGE_SIZE,
        search: debouncedQuery,
      })

      const allItems = [...firstPage.items]
      const total = firstPage.total
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

      for (let nextPage = 2; nextPage <= totalPages; nextPage += 1) {
        const response = await fetchProposals({
          brokerUserId,
          page: nextPage,
          pageSize: PAGE_SIZE,
          search: debouncedQuery,
        })

        allItems.push(...response.items)
      }

      setItems(allItems)
      setTotalCount(total)
    } catch (requestError) {
      setItems([])
      setTotalCount(0)
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível carregar as propostas.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [brokerUserId, debouncedQuery, isAuthLoading])

  useEffect(() => {
    void loadProposals()
  }, [loadProposals])

  const visibleCount = items.length

  const moveProposalInternal = useCallback(
    async (
      proposalId: string,
      status: ProposalStatus,
      options?: {
        pendingReason?: string
      },
    ) => {
      if (!brokerUserId || movingProposalId) {
        return
      }

      const proposal = items.find((item) => item.id === proposalId)
      const previousStatus = normalizeProposalStatus(proposal?.status)

      if (!proposal || previousStatus === status) {
        return
      }

      setMovingProposalId(proposalId)
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === proposalId ? { ...item, status } : item,
        ),
      )

      try {
        await updateProposalStatus(proposalId, {
          brokerUserId,
          status,
          pendingReason: options?.pendingReason,
        })
        toast.success('Situação da proposta atualizada.')
      } catch (moveError) {
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.id === proposalId ? { ...item, status: previousStatus } : item,
          ),
        )
        toast.error(
          moveError instanceof Error
            ? moveError.message
            : 'Não foi possível atualizar a situação da proposta.',
        )
      } finally {
        setMovingProposalId(null)
      }
    },
    [brokerUserId, items, movingProposalId],
  )

  const moveProposal = useCallback(
    async (proposalId: string, status: ProposalStatus) => {
      if (status === 'pendente') {
        setPendingMoveProposalId(proposalId)
        setPendingReasonDraft('')
        return
      }

      await moveProposalInternal(proposalId, status)
    },
    [moveProposalInternal],
  )

  const closePendingReasonModal = useCallback(() => {
    setPendingMoveProposalId(null)
    setPendingReasonDraft('')
  }, [])

  const confirmPendingReasonMove = useCallback(async () => {
    const pendingReason = pendingReasonDraft.trim()

    if (!pendingMoveProposalId) {
      return
    }

    if (!pendingReason) {
      toast.error('Informe o motivo da pendência antes de continuar.')
      return
    }

    await moveProposalInternal(pendingMoveProposalId, 'pendente', {
      pendingReason,
    })
    setPendingMoveProposalId(null)
    setPendingReasonDraft('')
  }, [moveProposalInternal, pendingMoveProposalId, pendingReasonDraft])

  return {
    query,
    setQuery,
    totalSent: totalCount,
    totalCount,
    visibleCount,
    items,
    isLoading,
    movingProposalId,
    statusOptions,
    isLoadingStatuses,
    error,
    isPendingReasonModalOpen: pendingMoveProposalId !== null,
    pendingReasonDraft,
    refetch: loadProposals,
    moveProposal,
    setPendingReasonDraft,
    closePendingReasonModal,
    confirmPendingReasonMove,
  }
}
