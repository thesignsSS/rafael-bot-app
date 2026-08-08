import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../../contexts/auth-context'
import { fetchEngenhariaRequests, updateEngenhariaRequest } from '../lib/engenhariaRequestsApi'
import {
  ENGENHARIA_REQUEST_STATUS_OPTIONS,
  type EngenhariaRequestListItem,
  type EngenhariaRequestStatus,
} from '../types/engenhariaRequest'

const PAGE_SIZE = 100

export function useEngenhariaRequestsList() {
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth()
  const brokerUserId = user?.id ?? null

  const [search, setSearch] = useState('')
  const [items, setItems] = useState<EngenhariaRequestListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [movingRequestId, setMovingRequestId] = useState<string | null>(null)

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

  const moveRequest = useCallback(
    async (requestId: string, status: EngenhariaRequestStatus) => {
      if (!isAdmin || !brokerUserId || movingRequestId) {
        return
      }

      const request = items.find((item) => item.id === requestId)

      if (!request || request.status === status) {
        return
      }

      const previousStatus = request.status
      const statusLabel =
        ENGENHARIA_REQUEST_STATUS_OPTIONS.find((option) => option.value === status)
          ?.label ?? status

      setMovingRequestId(requestId)
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === requestId ? { ...item, status, statusLabel } : item,
        ),
      )

      try {
        await updateEngenhariaRequest(requestId, {
          brokerUserId,
          status,
        })
        toast.success('Situação da solicitação atualizada.')
      } catch (moveError) {
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.id === requestId
              ? { ...item, status: previousStatus, statusLabel: request.statusLabel }
              : item,
          ),
        )
        toast.error(
          moveError instanceof Error
            ? moveError.message
            : 'Não foi possível atualizar a situação da solicitação.',
        )
      } finally {
        setMovingRequestId(null)
      }
    },
    [isAdmin, brokerUserId, movingRequestId, items],
  )

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
    moveRequest,
    movingRequestId,
  }
}
