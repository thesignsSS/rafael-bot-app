import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../contexts/auth-context'
import { getProposalsForUser } from '../mocks/proposals.mock'
import { normalizeProposalSearch } from '../lib/proposalListUtils'
import type { ProposalListItem } from '../types/proposal-list-item'

const PAGE_SIZE = 4

const filterProposals = (
  proposals: ProposalListItem[],
  query: string,
): ProposalListItem[] => {
  const normalizedQuery = normalizeProposalSearch(query)

  if (!normalizedQuery) {
    return proposals
  }

  return proposals.filter((proposal) => {
    const normalizedId = normalizeProposalSearch(proposal.id)
    const normalizedName = normalizeProposalSearch(proposal.clientName)

    return (
      normalizedId.includes(normalizedQuery) ||
      normalizedName.includes(normalizedQuery)
    )
  })
}

export function useProposalsList() {
  const { user, isAdmin } = useAuth()
  const userId = user?.id ?? null

  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const scopedProposals = useMemo(
    () => getProposalsForUser(userId, isAdmin),
    [userId, isAdmin],
  )

  const totalSent = scopedProposals.length

  const filteredItems = useMemo(
    () => filterProposals(scopedProposals, query),
    [scopedProposals, query],
  )

  const totalCount = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [query, userId, isAdmin])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const items = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredItems.slice(start, start + PAGE_SIZE)
  }, [filteredItems, page])

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
    totalSent,
    totalCount,
    visibleCount,
    items,
    goToPage,
    prevPage,
    nextPage,
    hasPrev,
    hasNext,
    pageNumbers,
  }
}
