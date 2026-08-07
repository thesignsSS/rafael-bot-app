import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../../contexts/auth-context'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { deleteEngenhariaRequest } from '../lib/engenhariaRequestsApi'
import { useEngenhariaRequestsList } from './useEngenhariaRequestsList'

type RequestPendingDeletion = {
  id: string
  requestCode: string
}

export function useEngenhariaRequestsPage() {
  const { isAdmin, user } = useAuth()
  const navigate = useNavigate()
  const list = useEngenhariaRequestsList()
  const [requestPendingDeletion, setRequestPendingDeletion] =
    useState<RequestPendingDeletion | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useDocumentTitle(
    isAdmin
      ? 'Solicitações de Engenharia | Effectus'
      : 'Minhas Solicitações de Engenharia | Effectus',
  )

  const goToNewRequest = useCallback(() => {
    navigate('/engenharia/nova')
  }, [navigate])

  const goToRequestDetail = useCallback(
    (requestId: string) => {
      navigate(`/engenharia/${requestId}`)
    },
    [navigate],
  )

  const goToEditRequest = useCallback(
    (requestId: string) => {
      navigate(`/engenharia/${requestId}`, { state: { startEditing: true } })
    },
    [navigate],
  )

  const openDeleteModal = useCallback((requestId: string, requestCode: string) => {
    setRequestPendingDeletion({ id: requestId, requestCode })
  }, [])

  const closeDeleteModal = useCallback(() => {
    setRequestPendingDeletion((current) => (isDeleting ? current : null))
  }, [isDeleting])

  const confirmDelete = useCallback(async () => {
    if (!requestPendingDeletion || !user?.id) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteEngenhariaRequest(requestPendingDeletion.id, user.id)
      list.removeItem(requestPendingDeletion.id)
      toast.success('Solicitação de engenharia excluída com sucesso.')
      setRequestPendingDeletion(null)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir a solicitação.',
      )
    } finally {
      setIsDeleting(false)
    }
  }, [requestPendingDeletion, user?.id, list])

  return {
    isAdmin,
    ...list,
    goToNewRequest,
    goToRequestDetail,
    goToEditRequest,
    requestPendingDeletion,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  }
}
