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
const PROPOSALS_LIST_CACHE_PREFIX = 'effectus-proposals-list:'

type CachedProposalsList = {
  items: ProposalListItem[]
  totalCount: number
}

const proposalsListRequestCache = new Map<string, Promise<CachedProposalsList>>()

function buildProposalsListCacheKey(brokerUserId: string, query: string) {
  return `${brokerUserId}::${query.trim().toLowerCase()}`
}

function buildProposalsListStorageKey(cacheKey: string) {
  return `${PROPOSALS_LIST_CACHE_PREFIX}${cacheKey}`
}

export function invalidateProposalsListCache(brokerUserId: string, query?: string) {
  const normalizedQuery = query?.trim().toLowerCase()

  if (normalizedQuery !== undefined) {
    const cacheKey = buildProposalsListCacheKey(brokerUserId, normalizedQuery)
    window.sessionStorage.removeItem(buildProposalsListStorageKey(cacheKey))
    proposalsListRequestCache.delete(cacheKey)
    return
  }

  const cacheKeyPrefix = buildProposalsListStorageKey(`${brokerUserId}::`)

  for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
    const storageKey = window.sessionStorage.key(index)

    if (storageKey?.startsWith(cacheKeyPrefix)) {
      window.sessionStorage.removeItem(storageKey)
    }
  }

  for (const requestKey of proposalsListRequestCache.keys()) {
    if (requestKey.startsWith(`${brokerUserId}::`)) {
      proposalsListRequestCache.delete(requestKey)
    }
  }
}

function readStoredProposalsList(cacheKey: string): CachedProposalsList | null {
  const rawValue = window.sessionStorage.getItem(
    buildProposalsListStorageKey(cacheKey),
  )

  if (!rawValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(rawValue) as CachedProposalsList

    if (!Array.isArray(parsedValue.items) || typeof parsedValue.totalCount !== 'number') {
      return null
    }

    return parsedValue
  } catch {
    return null
  }
}

function storeProposalsList(cacheKey: string, value: CachedProposalsList) {
  window.sessionStorage.setItem(
    buildProposalsListStorageKey(cacheKey),
    JSON.stringify(value),
  )
}

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
      const cacheKey = buildProposalsListCacheKey(brokerUserId, debouncedQuery)
      const storedValue = readStoredProposalsList(cacheKey)

      if (storedValue) {
        setItems(storedValue.items)
        setTotalCount(storedValue.totalCount)
        setIsLoading(false)
        return
      }

      let request = proposalsListRequestCache.get(cacheKey)

      if (!request) {
        request = (async () => {
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

          const result = {
            items: allItems,
            totalCount: total,
          }

          storeProposalsList(cacheKey, result)
          return result
        })()

        proposalsListRequestCache.set(cacheKey, request)
      }

      const result = await request

      if (proposalsListRequestCache.get(cacheKey) === request) {
        proposalsListRequestCache.delete(cacheKey)
      }

      setItems(result.items)
      setTotalCount(result.totalCount)
    } catch (requestError) {
      if (brokerUserId) {
        const cacheKey = buildProposalsListCacheKey(brokerUserId, debouncedQuery)
        proposalsListRequestCache.delete(cacheKey)
      }

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

  const invalidateCurrentListCache = useCallback(() => {
    if (!brokerUserId) {
      return
    }

    invalidateProposalsListCache(brokerUserId, debouncedQuery)
  }, [brokerUserId, debouncedQuery])

  const refetch = useCallback(async () => {
    invalidateCurrentListCache()
    await loadProposals()
  }, [invalidateCurrentListCache, loadProposals])

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
        invalidateCurrentListCache()
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
    [brokerUserId, invalidateCurrentListCache, items, movingProposalId],
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
    refetch,
    moveProposal,
    setPendingReasonDraft,
    closePendingReasonModal,
    confirmPendingReasonMove,
  }
}
