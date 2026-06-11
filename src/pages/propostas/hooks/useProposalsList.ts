import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../contexts/auth-context'
import { fetchProposals } from '../lib/proposalsApi'
import type { ProposalListItem } from '../types/proposal-list-item'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 300

export function useProposalsList() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const brokerUserId = user?.id ?? null

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<ProposalListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    setPage(1)
  }, [debouncedQuery, brokerUserId])

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

      const response = await fetchProposals({
        brokerUserId,
        page,
        pageSize: PAGE_SIZE,
        search: debouncedQuery,
      })

      setItems(response.items)
      setTotalCount(response.total)
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
  }, [brokerUserId, debouncedQuery, isAuthLoading, page])

  useEffect(() => {
    void loadProposals()
  }, [loadProposals])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const visibleCount = items.length
  const hasPrev = page > 1
  const hasNext = page < totalPages

  const goToPage = useCallback(
    (nextPage: number) => {
      setPage(Math.min(Math.max(nextPage, 1), totalPages))
    },
    [totalPages],
  )

  const prevPage = useCallback(() => {
    setPage((current) => Math.max(current - 1, 1))
  }, [])

  const nextPage = useCallback(() => {
    setPage((current) => Math.min(current + 1, totalPages))
  }, [totalPages])

  const pageNumbers = useMemo(() => {
    const maxVisible = 3
    let start = Math.max(1, page - 1)
    const end = Math.min(totalPages, start + maxVisible - 1)
    start = Math.max(1, end - maxVisible + 1)

    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
  }, [page, totalPages])

  return {
    query,
    setQuery,
    page,
    totalPages,
    totalSent: totalCount,
    totalCount,
    visibleCount,
    items,
    isLoading,
    error,
    refetch: loadProposals,
    goToPage,
    prevPage,
    nextPage,
    hasPrev,
    hasNext,
    pageNumbers,
  }
}
