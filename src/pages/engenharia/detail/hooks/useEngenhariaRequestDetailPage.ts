import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../../../contexts/auth-context'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { formatBrazilianPhone } from '../../../../lib/phone'
import {
  deleteEngenhariaRequest,
  fetchEngenhariaRequestDetail,
  updateEngenhariaRequest,
} from '../../lib/engenhariaRequestsApi'
import {
  formatPropertyValueInput,
  parsePropertyValueToNumber,
} from '../../lib/engenhariaUtils'
import type { PropertyKind } from '../../types/engenharia'
import type {
  EngenhariaRequestDetail,
  EngenhariaRequestStatus,
} from '../../types/engenhariaRequest'

type EditDraft = {
  propertyKind: PropertyKind
  propertyValue: string
  contactPhone: string
  accompanyingName: string
  status: EngenhariaRequestStatus
}

type DetailTab = 'dados' | 'comentarios'

export function useEngenhariaRequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [request, setRequest] = useState<EngenhariaRequestDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<DetailTab>('dados')

  const [isEditing, setIsEditing] = useState(false)
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [commentDraft, setCommentDraft] = useState('')
  const [isSavingComment, setIsSavingComment] = useState(false)

  useDocumentTitle(
    request ? `${request.requestCode} | Effectus` : 'Solicitação de Engenharia | Effectus',
  )

  const loadRequest = useCallback(async () => {
    if (isAuthLoading) {
      return
    }

    if (!requestId || !user?.id) {
      setIsLoading(false)
      setError('Solicitação de engenharia não encontrada.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const detail = await fetchEngenhariaRequestDetail(requestId, user.id)
      setRequest(detail)
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Não foi possível carregar a solicitação de engenharia.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [requestId, user?.id, isAuthLoading])

  useEffect(() => {
    loadRequest()
  }, [loadRequest])

  const startEditing = useCallback(() => {
    if (!request) {
      return
    }

    setEditDraft({
      propertyKind: request.propertyKind,
      propertyValue: formatPropertyValueInput(
        String(Math.round(request.propertyValue * 100)),
      ),
      contactPhone: request.contactPhone,
      accompanyingName: request.accompanyingName,
      status: request.status,
    })
    setIsEditing(true)
  }, [request])

  useEffect(() => {
    if (location.state && (location.state as { startEditing?: boolean }).startEditing) {
      startEditing()
      navigate(location.pathname, { replace: true })
    }
  }, [request, location.state, location.pathname, navigate, startEditing])

  const cancelEditing = useCallback(() => {
    setIsEditing(false)
    setEditDraft(null)
  }, [])

  const updateEditDraft = useCallback((updates: Partial<EditDraft>) => {
    setEditDraft((current) => (current ? { ...current, ...updates } : current))
  }, [])

  const handleEditPropertyValueChange = useCallback(
    (value: string) => {
      updateEditDraft({ propertyValue: formatPropertyValueInput(value) })
    },
    [updateEditDraft],
  )

  const handleEditContactPhoneChange = useCallback(
    (value: string) => {
      updateEditDraft({ contactPhone: formatBrazilianPhone(value) })
    },
    [updateEditDraft],
  )

  const saveEdits = useCallback(async () => {
    if (!requestId || !user?.id || !editDraft) {
      return
    }

    if (!editDraft.propertyKind) {
      toast.error('Selecione o tipo de imóvel.')
      return
    }

    if (!editDraft.contactPhone.trim()) {
      toast.error('Informe o contato.')
      return
    }

    if (!editDraft.accompanyingName.trim()) {
      toast.error('Informe o nome de quem irá acompanhar a engenharia.')
      return
    }

    try {
      setIsSaving(true)

      await updateEngenhariaRequest(requestId, {
        brokerUserId: user.id,
        propertyKind: editDraft.propertyKind,
        propertyValue: parsePropertyValueToNumber(editDraft.propertyValue),
        contactPhone: editDraft.contactPhone.trim(),
        accompanyingName: editDraft.accompanyingName.trim(),
        ...(isAdmin ? { status: editDraft.status } : {}),
      })

      toast.success('Solicitação atualizada com sucesso.')
      setIsEditing(false)
      setEditDraft(null)
      await loadRequest()
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : 'Não foi possível salvar as alterações.',
      )
    } finally {
      setIsSaving(false)
    }
  }, [requestId, user?.id, editDraft, isAdmin, loadRequest])

  const openDeleteModal = useCallback(() => setIsDeleteModalOpen(true), [])
  const closeDeleteModal = useCallback(() => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false)
    }
  }, [isDeleting])

  const confirmDelete = useCallback(async () => {
    if (!requestId || !user?.id) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteEngenhariaRequest(requestId, user.id)
      toast.success('Solicitação de engenharia excluída com sucesso.')
      navigate('/engenharia', { replace: true })
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : 'Não foi possível excluir a solicitação.',
      )
    } finally {
      setIsDeleting(false)
    }
  }, [requestId, user?.id, navigate])

  const addComment = useCallback(async () => {
    if (!requestId || !user?.id || !commentDraft.trim()) {
      return
    }

    try {
      setIsSavingComment(true)
      await updateEngenhariaRequest(requestId, {
        brokerUserId: user.id,
        commentMessage: commentDraft.trim(),
      })
      setCommentDraft('')
      await loadRequest()
    } catch (commentError) {
      toast.error(
        commentError instanceof Error
          ? commentError.message
          : 'Não foi possível adicionar o comentário.',
      )
    } finally {
      setIsSavingComment(false)
    }
  }, [requestId, user?.id, commentDraft, loadRequest])

  return {
    request,
    isLoading,
    error,
    isAdmin,
    activeTab,
    setActiveTab,
    isEditing,
    editDraft,
    isSaving,
    startEditing,
    cancelEditing,
    updateEditDraft,
    handleEditPropertyValueChange,
    handleEditContactPhoneChange,
    saveEdits,
    isDeleteModalOpen,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    commentDraft,
    setCommentDraft,
    isSavingComment,
    addComment,
    goBack: () => navigate('/engenharia'),
  }
}
