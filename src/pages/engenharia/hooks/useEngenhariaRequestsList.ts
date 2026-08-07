import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../../contexts/auth-context'
import { fetchEngenhariaRequests } from '../lib/engenhariaRequestsApi'
import type { EngenhariaRequestListItem } from '../types/engenhariaRequest'

const PAGE_SIZE = 100

export function useEngenhariaRequestsList() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const brokerUserId = user?.id ?? null

  const [search, setSearch] = useState('')
  const [items, setItems] = useState<EngenhariaRequestListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRequests = useCallback(async () => {
    if (isAuthLoading) {
      return
    }

    if (!brokerUserId) {
      setItems([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchEngenhariaRequests({
        brokerUserId,
        page: 1,
        pageSize: PAGE_SIZE,
      })
      setItems(result.items)
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Não foi possível carregar as solicitações de engenharia.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [brokerUserId, isAuthLoading])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const removeItem = useCallback((requestId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== requestId))
  }, [])

  const normalizedSearch = search.trim().toLowerCase()
  const filteredItems = normalizedSearch
    ? items.filter(
        (item) =>
          item.accompanyingName.toLowerCase().includes(normalizedSearch) ||
          item.requestCode.toLowerCase().includes(normalizedSearch),
      )
    : items

  return {
    search,
    setSearch,
    items: filteredItems,
    isLoading,
    error,
    refetch: loadRequests,
    removeItem,
  }
}
