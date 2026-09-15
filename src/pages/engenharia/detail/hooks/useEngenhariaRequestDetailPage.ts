import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../../../contexts/auth-context'
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import { formatBrazilianPhone } from '../../../../lib/phone'
import {
  deleteEngenhariaRequestDocument,
  deleteEngenhariaRequest,
  downloadEngenhariaRequestDocument,
  fetchEngenhariaRequestDetail,
  renameEngenhariaRequestDocument,
  updateEngenhariaRequest,
  uploadEngenhariaRequestDocuments,
  viewEngenhariaRequestDocument,
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

type DetailTab = 'dados' | 'documentos' | 'comentarios'

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
  const [commentDraftsByScope, setCommentDraftsByScope] = useState<Record<string, string>>({})
  const [isSavingComment, setIsSavingComment] = useState(false)
  const [isUpdatingDocuments, setIsUpdatingDocuments] = useState(false)

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

  const setScopedCommentDraft = useCallback((scope: string, value: string) => {
    setCommentDraftsByScope((current) => ({ ...current, [scope]: value }))
  }, [])

  const addScopedComment = useCallback(async (scope: string) => {
    const message = commentDraftsByScope[scope]?.trim()
    if (!requestId || !user?.id || !message) return
    try {
      setIsSavingComment(true)
      await updateEngenhariaRequest(requestId, {
        brokerUserId: user.id,
        commentMessage: message,
        commentScope: scope,
      })
      setCommentDraftsByScope((current) => ({ ...current, [scope]: '' }))
      await loadRequest()
    } catch (commentError) {
      toast.error(commentError instanceof Error ? commentError.message : 'Não foi possível adicionar o comentário.')
    } finally {
      setIsSavingComment(false)
    }
  }, [requestId, user?.id, commentDraftsByScope, loadRequest])

  const uploadDocuments = useCallback(async (documentKey: string, files: File[]) => {
    if (!requestId || !user?.id || files.length === 0) return
    try {
      setIsUpdatingDocuments(true)
      await uploadEngenhariaRequestDocuments(requestId, user.id, documentKey, files)
      await loadRequest()
      toast.success('Documento(s) anexado(s) com sucesso.')
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : 'Não foi possível anexar os documentos.')
    } finally {
      setIsUpdatingDocuments(false)
    }
  }, [requestId, user?.id, loadRequest])

  const renameDocument = useCallback(async (documentId: string) => {
    const document = request?.documents.find((item) => item.id === documentId)
    const originalFilename = window.prompt('Novo nome do arquivo', document?.originalFilename ?? '')?.trim()
    if (!requestId || !user?.id || !originalFilename || originalFilename === document?.originalFilename) return
    try {
      setIsUpdatingDocuments(true)
      await renameEngenhariaRequestDocument(requestId, documentId, user.id, originalFilename)
      await loadRequest()
      toast.success('Documento renomeado com sucesso.')
    } catch (renameError) {
      toast.error(renameError instanceof Error ? renameError.message : 'Não foi possível renomear o documento.')
    } finally {
      setIsUpdatingDocuments(false)
    }
  }, [requestId, user?.id, request?.documents, loadRequest])

  const deleteDocument = useCallback(async (documentId: string) => {
    const document = request?.documents.find((item) => item.id === documentId)
    if (!requestId || !user?.id || !window.confirm(`Excluir "${document?.originalFilename ?? 'documento'}"?`)) return
    try {
      setIsUpdatingDocuments(true)
      await deleteEngenhariaRequestDocument(requestId, documentId, user.id)
      await loadRequest()
      toast.success('Documento excluído com sucesso.')
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'Não foi possível excluir o documento.')
    } finally {
      setIsUpdatingDocuments(false)
    }
  }, [requestId, user?.id, request?.documents, loadRequest])

  const viewDocument = useCallback(async (documentId: string) => {
    if (!requestId || !user?.id) return
    try {
      const result = await viewEngenhariaRequestDocument(requestId, documentId, user.id)
      window.open(result.url, '_blank', 'noopener,noreferrer')
    } catch (viewError) {
      toast.error(viewError instanceof Error ? viewError.message : 'Não foi possível visualizar o documento.')
    }
  }, [requestId, user?.id])

  const downloadDocument = useCallback(async (documentId: string) => {
    if (!requestId || !user?.id) return
    try {
      const result = await downloadEngenhariaRequestDocument(requestId, documentId, user.id)
      const url = URL.createObjectURL(result.blob)
      const link = document.createElement('a')
      link.href = url
      link.download = result.filename
      link.click()
      URL.revokeObjectURL(url)
    } catch (downloadError) {
      toast.error(downloadError instanceof Error ? downloadError.message : 'Não foi possível baixar o documento.')
    }
  }, [requestId, user?.id])

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
    commentDraftsByScope,
    setScopedCommentDraft,
    addScopedComment,
    isUpdatingDocuments,
    uploadDocuments,
    renameDocument,
    deleteDocument,
    viewDocument,
    downloadDocument,
    goBack: () => navigate('/engenharia'),
  }
}
