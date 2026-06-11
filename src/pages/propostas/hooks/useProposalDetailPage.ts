import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../../contexts/auth-context'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { filesToSubmissionDocuments } from '../../home/lib/submitProposal'
import type { PropertyType } from '../../home/types/proposal'
import { inferDocumentKindFromContent } from '../lib/proposalDetailUtils'
import {
  deleteProposalDocument,
  downloadProposalZip,
  renameProposalDocument,
  updateProposal,
  updateProposalStatus,
  uploadProposalDocuments,
  viewProposalDocument,
} from '../lib/proposalsApi'
import type { ProposalDocumentKind } from '../types/proposal-detail'
import {
  normalizeProposalStatus,
  type ProposalStatus,
} from '../types/proposal-status'
import { useProposalDetail } from './useProposalDetail'
import { useProposalStatuses } from './useProposalStatuses'

export type ProposalEditDraft = {
  brokerPhone: string
  clientName: string
  clientCpf: string
  clientEmail: string
  clientPhone: string
  propertyType: PropertyType
  propertyCity: string
  propertyState: string
  additionalInfo: string
}

export type ProposalDocumentPreview = {
  id: string
  fileName: string
  kind: ProposalDocumentKind
  url: string
}

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function useProposalDetailPage() {
  const navigate = useNavigate()
  const { proposalId } = useParams<{ proposalId: string }>()
  const { user, isAdmin } = useAuth()
  const brokerUserId = user?.id ?? null
  const { status, proposal, error, refetch } = useProposalDetail(proposalId)
  const { statusOptions, isLoadingStatuses } = useProposalStatuses()
  const [isEditing, setIsEditing] = useState(false)
  const [editDraft, setEditDraft] = useState<ProposalEditDraft | null>(null)
  const [isSavingProposal, setIsSavingProposal] = useState(false)
  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [isSavingComment, setIsSavingComment] = useState(false)
  const [isUpdatingDocuments, setIsUpdatingDocuments] = useState(false)
  const [isPendingReasonModalOpen, setIsPendingReasonModalOpen] = useState(false)
  const [isPendingDocumentsModalOpen, setIsPendingDocumentsModalOpen] = useState(false)
  const [pendingReasonDraft, setPendingReasonDraft] = useState('')
  const [pendingDocumentsDraft, setPendingDocumentsDraft] = useState<File[]>([])
  const [commentDraft, setCommentDraft] = useState('')
  const [hasPendingUpdates, setHasPendingUpdates] = useState(false)
  const [documentPreview, setDocumentPreview] =
    useState<ProposalDocumentPreview | null>(null)
  const hasHandledMissingProposal = useRef(false)
  const normalizedStatus = normalizeProposalStatus(proposal?.status)
  const canBrokerHandlePending = !isAdmin && normalizedStatus === 'pendente'

  const pageTitle = proposal
    ? `Proposta ${proposal.proposalCode} | Rafael Bot`
    : 'Detalhes da Proposta | Rafael Bot'

  useDocumentTitle(pageTitle)

  useEffect(() => {
    if (status !== 'not_found' || hasHandledMissingProposal.current) {
      return
    }

    hasHandledMissingProposal.current = true
    toast.error('Proposta não encontrada ou sem permissão de acesso.')
    navigate('/propostas', { replace: true })
  }, [status, navigate])

  useEffect(() => {
    if (!proposal || isEditing) {
      return
    }

    setEditDraft({
      brokerPhone: proposal.brokerPhone,
      clientName: proposal.client.name,
      clientCpf: proposal.client.cpf,
      clientEmail: proposal.client.email,
      clientPhone: proposal.client.phone,
      propertyType: proposal.property.type,
      propertyCity: proposal.property.city,
      propertyState: proposal.property.state,
      additionalInfo: proposal.additionalInfo,
    })
  }, [isEditing, proposal])

  useEffect(() => {
    setPendingReasonDraft(proposal?.pendingReason ?? '')
    setPendingDocumentsDraft([])
    setCommentDraft('')
    setHasPendingUpdates(false)
  }, [proposal?.id, proposal?.pendingReason, normalizedStatus])

  const requireProposalContext = useCallback(() => {
    if (!proposalId || !brokerUserId) {
      throw new Error('Sessão expirada. Faça login novamente para continuar.')
    }

    return { proposalId, brokerUserId }
  }, [brokerUserId, proposalId])

  const goBack = useCallback(() => {
    navigate('/propostas')
  }, [navigate])

  const startEditing = useCallback(() => {
    if (!proposal) {
      return
    }

    setEditDraft({
      brokerPhone: proposal.brokerPhone,
      clientName: proposal.client.name,
      clientCpf: proposal.client.cpf,
      clientEmail: proposal.client.email,
      clientPhone: proposal.client.phone,
      propertyType: proposal.property.type,
      propertyCity: proposal.property.city,
      propertyState: proposal.property.state,
      additionalInfo: proposal.additionalInfo,
    })
    setIsEditing(true)
  }, [proposal])

  const cancelEditing = useCallback(() => {
    setIsEditing(false)
  }, [])

  const updateEditDraft = useCallback(
    <Field extends keyof ProposalEditDraft>(
      field: Field,
      value: ProposalEditDraft[Field],
    ) => {
      setEditDraft((current) => (current ? { ...current, [field]: value } : current))
    },
    [],
  )

  const saveProposal = useCallback(async () => {
    if (!proposal || !editDraft) {
      return
    }

    try {
      const context = requireProposalContext()
      setIsSavingProposal(true)

      await updateProposal(context.proposalId, {
        brokerUserId: context.brokerUserId,
        brokerPhone: editDraft.brokerPhone.trim(),
        clientName: editDraft.clientName.trim(),
        clientCpf: editDraft.clientCpf.trim(),
        clientEmail: editDraft.clientEmail.trim(),
        clientPhone: editDraft.clientPhone.trim(),
        propertyType: editDraft.propertyType,
        propertyCity: editDraft.propertyCity.trim(),
        propertyState: editDraft.propertyState.trim(),
        additionalInfo: editDraft.additionalInfo.trim(),
        formData: {
          ...proposal.formData,
          'WhatsApp do Corretor': editDraft.brokerPhone.trim(),
          'Nome do Cliente Completo': editDraft.clientName.trim(),
          'CPF do Cliente': editDraft.clientCpf.trim(),
          'E-mail do Cliente': editDraft.clientEmail.trim(),
          'Telefone do Cliente': editDraft.clientPhone.trim(),
          'Tipo do Imóvel': editDraft.propertyType,
          'Município do Imóvel': editDraft.propertyCity.trim(),
          'UF do Imóvel': editDraft.propertyState.trim(),
          'Informações Adicionais': editDraft.additionalInfo.trim(),
        },
      })

      await refetch()
      if (canBrokerHandlePending) {
        setHasPendingUpdates(true)
      }
      setIsEditing(false)
      toast.success('Proposta atualizada com sucesso.')
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : 'Não foi possível atualizar a proposta.',
      )
    } finally {
      setIsSavingProposal(false)
    }
  }, [editDraft, proposal, refetch, requireProposalContext])

  const updateProposalStatusWithPayload = useCallback(
    async (nextStatus: ProposalStatus) => {
      if (!proposal || normalizeProposalStatus(proposal.status) === nextStatus) {
        return
      }

      try {
        const context = requireProposalContext()
        setIsSavingStatus(true)
        await updateProposalStatus(context.proposalId, {
          brokerUserId: context.brokerUserId,
          status: nextStatus,
        })
        await refetch()
        toast.success('Situação da proposta atualizada.')
      } catch (statusError) {
        toast.error(
          statusError instanceof Error
            ? statusError.message
            : 'Não foi possível atualizar a situação da proposta.',
        )
      } finally {
        setIsSavingStatus(false)
      }
    },
    [proposal, refetch, requireProposalContext],
  )

  const changeProposalStatus = useCallback(
    async (nextStatus: ProposalStatus) => {
      if (nextStatus === 'pendente' && isAdmin) {
        setPendingReasonDraft(proposal?.pendingReason ?? '')
        setIsPendingReasonModalOpen(true)
        return
      }

      await updateProposalStatusWithPayload(nextStatus)
    },
    [isAdmin, proposal?.pendingReason, updateProposalStatusWithPayload],
  )

  const closePendingReasonModal = useCallback(() => {
    setIsPendingReasonModalOpen(false)
    setPendingReasonDraft(proposal?.pendingReason ?? '')
  }, [proposal?.pendingReason])

  const confirmPendingReason = useCallback(async () => {
    const pendingReason = pendingReasonDraft.trim()

    if (!pendingReason) {
      toast.error('Informe o motivo da pendência antes de continuar.')
      return
    }

    try {
      const context = requireProposalContext()
      setIsSavingStatus(true)
      await updateProposalStatus(context.proposalId, {
        brokerUserId: context.brokerUserId,
        status: 'pendente',
        pendingReason,
      })
      await refetch()
      setIsPendingReasonModalOpen(false)
      toast.success('Proposta movida para pendente.')
    } catch (statusError) {
      toast.error(
        statusError instanceof Error
          ? statusError.message
          : 'Não foi possível atualizar a situação da proposta.',
      )
    } finally {
      setIsSavingStatus(false)
    }
  }, [pendingReasonDraft, refetch, requireProposalContext])

  const downloadAll = useCallback(async () => {
    try {
      const context = requireProposalContext()
      const { blob, filename } = await downloadProposalZip(
        context.proposalId,
        context.brokerUserId,
      )

      downloadBlob(blob, filename)
    } catch (downloadError) {
      toast.error(
        downloadError instanceof Error
          ? downloadError.message
          : 'Não foi possível baixar os documentos.',
      )
    }
  }, [requireProposalContext])

  const renameDocument = useCallback(
    async (documentId: string) => {
      const document = proposal?.documents.find((item) => item.id === documentId)
      const currentName =
        document?.displayName ?? document?.originalFilename ?? document?.filename ?? ''
      const displayName = window.prompt('Novo nome do arquivo', currentName)?.trim()

      if (!displayName || displayName === currentName) {
        return
      }

      try {
        const context = requireProposalContext()
        setIsUpdatingDocuments(true)
        await renameProposalDocument(
          context.proposalId,
          documentId,
          context.brokerUserId,
          displayName,
        )
        await refetch()
        if (canBrokerHandlePending) {
          setHasPendingUpdates(true)
        }
        toast.success('Documento renomeado com sucesso.')
      } catch (renameError) {
        toast.error(
          renameError instanceof Error
            ? renameError.message
            : 'Não foi possível renomear o documento.',
        )
      } finally {
        setIsUpdatingDocuments(false)
      }
    },
    [proposal?.documents, refetch, requireProposalContext],
  )

  const deleteDocument = useCallback(
    async (documentId: string) => {
      const document = proposal?.documents.find((item) => item.id === documentId)
      const displayName =
        document?.displayName ?? document?.originalFilename ?? document?.filename

      if (!window.confirm(`Excluir "${displayName ?? 'documento'}"?`)) {
        return
      }

      try {
        const context = requireProposalContext()
        setIsUpdatingDocuments(true)
        await deleteProposalDocument(
          context.proposalId,
          documentId,
          context.brokerUserId,
        )
        await refetch()
        if (canBrokerHandlePending) {
          setHasPendingUpdates(true)
        }
        toast.success('Documento excluído com sucesso.')
      } catch (deleteError) {
        toast.error(
          deleteError instanceof Error
            ? deleteError.message
            : 'Não foi possível excluir o documento.',
        )
      } finally {
        setIsUpdatingDocuments(false)
      }
    },
    [proposal?.documents, refetch, requireProposalContext],
  )

  const viewDocument = useCallback(
    async (documentId: string) => {
      try {
        const context = requireProposalContext()
        const document = proposal?.documents.find((item) => item.id === documentId)
        const result = await viewProposalDocument(
          context.proposalId,
          documentId,
          context.brokerUserId,
        )

        setDocumentPreview({
          id: documentId,
          fileName:
            document?.displayName ??
            document?.originalFilename ??
            result.filename,
          kind: inferDocumentKindFromContent(
            document?.contentType ?? 'application/pdf',
            document?.filename ?? result.filename,
          ),
          url: result.url,
        })
      } catch (viewError) {
        toast.error(
          viewError instanceof Error
            ? viewError.message
            : 'Não foi possível visualizar o documento.',
        )
      }
    },
    [proposal?.documents, requireProposalContext],
  )

  const openAllDocumentsPreview = useCallback(() => {
    if (!proposal?.documents.length) {
      return
    }

    const documentsUrl = `/propostas/${proposal.id}/documentos`
    window.open(documentsUrl, '_blank', 'noopener,noreferrer')
  }, [proposal?.documents.length, proposal?.id])

  const addDocuments = useCallback(
    async (selectedFiles: File[]) => {
      if (selectedFiles.length === 0) {
        return
      }

      try {
        const context = requireProposalContext()
        setIsUpdatingDocuments(true)
        const documents = await filesToSubmissionDocuments(selectedFiles)
        await uploadProposalDocuments(
          context.proposalId,
          context.brokerUserId,
          documents,
        )
        await refetch()
        if (canBrokerHandlePending) {
          setHasPendingUpdates(true)
        }
        toast.success(
          selectedFiles.length === 1
            ? 'Documento enviado com sucesso.'
            : `${selectedFiles.length} documentos enviados com sucesso.`,
        )
      } catch (uploadError) {
        toast.error(
          uploadError instanceof Error
            ? uploadError.message
            : 'Não foi possível enviar os documentos.',
        )
      } finally {
        setIsUpdatingDocuments(false)
      }
    },
    [refetch, requireProposalContext],
  )

  const closeDocumentPreview = useCallback(() => {
    setDocumentPreview(null)
  }, [])

  const openPendingDocumentsModal = useCallback(() => {
    setIsPendingDocumentsModalOpen(true)
  }, [])

  const closePendingDocumentsModal = useCallback(() => {
    setIsPendingDocumentsModalOpen(false)
  }, [])

  const stagePendingDocuments = useCallback(async (selectedFiles: File[]) => {
      if (selectedFiles.length === 0) {
        return
      }

      setPendingDocumentsDraft((currentFiles) => {
        const currentKeys = new Set(currentFiles.map(fileKey))
        const nextFiles = selectedFiles.filter(
          (file) => !currentKeys.has(fileKey(file)),
        )

        return [...currentFiles, ...nextFiles]
      })
      setIsPendingDocumentsModalOpen(false)
      toast.success(
        selectedFiles.length === 1
          ? 'Documento pendente adicionado.'
          : `${selectedFiles.length} documentos pendentes adicionados.`,
      )
    }, [])

  const removePendingDocument = useCallback((targetFile: File) => {
    setPendingDocumentsDraft((currentFiles) =>
      currentFiles.filter((file) => fileKey(file) !== fileKey(targetFile)),
    )
  }, [])

  const addComment = useCallback(async () => {
    const message = commentDraft.trim()

    if (!message) {
      toast.error('Escreva um comentário antes de enviar.')
      return
    }

    try {
      const context = requireProposalContext()
      setIsSavingComment(true)
      await updateProposal(context.proposalId, {
        brokerUserId: context.brokerUserId,
        brokerPhone: proposal?.brokerPhone ?? '',
        clientName: proposal?.client.name ?? '',
        clientCpf: proposal?.client.cpf ?? '',
        clientEmail: proposal?.client.email ?? '',
        clientPhone: proposal?.client.phone ?? '',
        propertyType: proposal?.property.type ?? 'Novo',
        propertyCity: proposal?.property.city ?? '',
        propertyState: proposal?.property.state ?? '',
        additionalInfo: proposal?.additionalInfo ?? '',
        formData: proposal?.formData ?? {},
        commentMessage: message,
      })
      await refetch()
      setCommentDraft('')
      if (canBrokerHandlePending) {
        setHasPendingUpdates(true)
      }
      toast.success('Comentário adicionado.')
    } catch (commentError) {
      toast.error(
        commentError instanceof Error
          ? commentError.message
          : 'Não foi possível adicionar o comentário.',
      )
    } finally {
      setIsSavingComment(false)
    }
  }, [canBrokerHandlePending, commentDraft, proposal, refetch, requireProposalContext])

  const resendForAnalysis = useCallback(async () => {
    const canResendNow = hasPendingUpdates || pendingDocumentsDraft.length > 0

    if (!canBrokerHandlePending || !canResendNow) {
      return
    }

    try {
      const context = requireProposalContext()
      setIsSavingStatus(true)

      if (pendingDocumentsDraft.length > 0) {
        const documents = await filesToSubmissionDocuments(pendingDocumentsDraft)
        await uploadProposalDocuments(
          context.proposalId,
          context.brokerUserId,
          documents,
        )
      }

      await updateProposalStatus(context.proposalId, {
        brokerUserId: context.brokerUserId,
        status: 'em_analise',
        commentMessage: commentDraft.trim() || undefined,
      })
      await refetch()
      setCommentDraft('')
      setPendingDocumentsDraft([])
      setHasPendingUpdates(false)
      toast.success('Proposta reenviada para análise.')
    } catch (statusError) {
      toast.error(
        statusError instanceof Error
          ? statusError.message
          : 'Não foi possível reenviar a proposta para análise.',
      )
    } finally {
      setIsSavingStatus(false)
    }
  }, [
    canBrokerHandlePending,
    commentDraft,
    hasPendingUpdates,
    pendingDocumentsDraft,
    refetch,
    requireProposalContext,
  ])

  return {
    status,
    proposal,
    documents: proposal?.documents ?? [],
    error,
    refetch,
    isEditing,
    isAdmin,
    canBrokerHandlePending,
    editDraft,
    documentPreview,
    isSavingProposal,
    isSavingStatus,
    isSavingComment,
    statusOptions,
    isLoadingStatuses,
    isUpdatingDocuments,
    isPendingReasonModalOpen,
    isPendingDocumentsModalOpen,
    pendingReasonDraft,
    pendingDocumentsDraft,
    commentDraft,
    hasPendingUpdates,
    goBack,
    startEditing,
    cancelEditing,
    updateEditDraft,
    saveProposal,
    changeProposalStatus,
    closePendingReasonModal,
    confirmPendingReason,
    setPendingReasonDraft,
    downloadAll,
    renameDocument,
    deleteDocument,
    viewDocument,
    openAllDocumentsPreview,
    closeDocumentPreview,
    addDocuments,
    openPendingDocumentsModal,
    closePendingDocumentsModal,
    stagePendingDocuments,
    removePendingDocument,
    addComment,
    setCommentDraft,
    resendForAnalysis,
  }
}
