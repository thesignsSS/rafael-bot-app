import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../../contexts/auth-context'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { formatBrazilianPhone } from '../../../lib/phone'
import { filesToSubmissionDocuments } from '../../home/lib/submitProposal'
import type { PropertyType, ProposalBank } from '../../home/types/proposal'
import { inferDocumentKindFromContent } from '../lib/proposalDetailUtils'
import {
  createProposalInvitation,
  searchInviteCandidates,
} from '../lib/invitationsApi'
import {
  createProposalShareLink,
  deleteProposal,
  deleteProposalDocument,
  downloadProposalDocument,
  downloadProposalZip,
  removeProposalGuest,
  renameProposalDocument,
  updateProposal,
  updateProposalStatus,
  uploadProposalDocuments,
  viewProposalDocument,
} from '../lib/proposalsApi'
import type {
  ProposalDocumentKind,
  ProposalDocumentScope,
} from '../types/proposal-detail'
import {
  isBrokerReadOnlyProposalStatus,
  normalizeProposalStatus,
  type ProposalStatus,
} from '../types/proposal-status'
import { useProposalDetail } from './useProposalDetail'
import { invalidateProposalsListCache } from './useProposalsList'
import { useProposalStatuses } from './useProposalStatuses'

export type ProposalEditDraft = {
  brokerPhone: string
  clientName: string
  clientCpf: string
  clientEmail: string
  clientPhone: string
  propertyType: PropertyType
  selectedBank: ProposalBank | ''
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
  const { status, proposal, error, refetch, updateProposalState } =
    useProposalDetail(proposalId)
  const { statusOptions, isLoadingStatuses } = useProposalStatuses()
  const [isEditing, setIsEditing] = useState(false)
  const [editDraft, setEditDraft] = useState<ProposalEditDraft | null>(null)
  const [isSavingProposal, setIsSavingProposal] = useState(false)
  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [isSavingComment, setIsSavingComment] = useState(false)
  const [isUpdatingDocuments, setIsUpdatingDocuments] = useState(false)
  const [isPendingReasonModalOpen, setIsPendingReasonModalOpen] = useState(false)
  const [isPendingDocumentsModalOpen, setIsPendingDocumentsModalOpen] = useState(false)
  const [isDeleteProposalModalOpen, setIsDeleteProposalModalOpen] = useState(false)
  const [pendingReasonDraft, setPendingReasonDraft] = useState('')
  const [pendingDocumentsDraft, setPendingDocumentsDraft] = useState<File[]>([])
  const [commentDraft, setCommentDraft] = useState('')
  const [hasPendingUpdates, setHasPendingUpdates] = useState(false)
  const [isDeletingProposal, setIsDeletingProposal] = useState(false)
  const [isManagingGuests, setIsManagingGuests] = useState(false)
  const [inviteQuery, setInviteQuery] = useState('')
  const [inviteCandidates, setInviteCandidates] = useState<
    Array<{ id: string; fullName: string; role: 'admin' | 'broker'; isAdmin: boolean }>
  >([])
  const [selectedInviteeId, setSelectedInviteeId] = useState<string | null>(null)
  const [isSearchingInviteCandidates, setIsSearchingInviteCandidates] = useState(false)
  const [guestPendingRemoval, setGuestPendingRemoval] = useState<{
    userId: string
    name: string
  } | null>(null)
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [documentPreview, setDocumentPreview] =
    useState<ProposalDocumentPreview | null>(null)
  const hasHandledMissingProposal = useRef(false)
  const normalizedStatus = normalizeProposalStatus(proposal?.status)
  const isBrokerReadOnly = !isAdmin && isBrokerReadOnlyProposalStatus(normalizedStatus)
  const canBrokerHandlePending = !isAdmin && normalizedStatus === 'pendente'
  const canManageGuests = (proposal?.isOwnedByCurrentUser ?? false) && !isBrokerReadOnly
  const canViewGuests = canManageGuests || isAdmin
  const canDeleteProposal = (proposal?.canDeleteProposal ?? false) && !isBrokerReadOnly
  const inviteHelperMessage =
    inviteQuery.trim().length > 0 && inviteQuery.trim().length < 5
      ? 'Digite pelo menos 5 letras para buscar um usuário.'
      : inviteQuery.trim().length >= 5 &&
          !isSearchingInviteCandidates &&
          inviteCandidates.length === 0
        ? 'Nenhum usuário encontrado com esse nome.'
        : null

  const pageTitle = proposal
    ? `Proposta ${proposal.proposalCode} | Effectus`
    : 'Detalhes da Proposta | Effectus'

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
      brokerPhone: formatBrazilianPhone(proposal.brokerPhone),
      clientName: proposal.client.name,
      clientCpf: proposal.client.cpf,
      clientEmail: proposal.client.email,
      clientPhone: proposal.client.phone,
      propertyType: proposal.property.type,
      selectedBank: extractProposalBank(proposal.formData),
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
    setShareLink(
      proposal?.shareLinkToken
        ? `${window.location.origin}/propostas/compartilhar/${proposal.shareLinkToken}`
        : null,
    )
    setInviteQuery('')
    setInviteCandidates([])
    setSelectedInviteeId(null)
    setGuestPendingRemoval(null)
  }, [proposal?.id, proposal?.pendingReason, proposal?.shareLinkToken, normalizedStatus])

  useEffect(() => {
    async function loadInviteCandidates() {
      if (!canManageGuests || !brokerUserId) {
        setInviteCandidates([])
        return
      }

      const trimmedQuery = inviteQuery.trim()

      if (trimmedQuery.length < 5) {
        setInviteCandidates([])
        setSelectedInviteeId(null)
        return
      }

      try {
        setIsSearchingInviteCandidates(true)
        const items = await searchInviteCandidates(brokerUserId, trimmedQuery)
        setInviteCandidates(items)
      } catch {
        setInviteCandidates([])
      } finally {
        setIsSearchingInviteCandidates(false)
      }
    }

    const timeoutId = window.setTimeout(() => {
      void loadInviteCandidates()
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [brokerUserId, canManageGuests, inviteQuery])

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
    if (!proposal || isBrokerReadOnly) {
      return
    }

    setEditDraft({
      brokerPhone: formatBrazilianPhone(proposal.brokerPhone),
      clientName: proposal.client.name,
      clientCpf: proposal.client.cpf,
      clientEmail: proposal.client.email,
      clientPhone: proposal.client.phone,
      propertyType: proposal.property.type,
      selectedBank: extractProposalBank(proposal.formData),
      propertyCity: proposal.property.city,
      propertyState: proposal.property.state,
      additionalInfo: proposal.additionalInfo,
    })
    setIsEditing(true)
  }, [isBrokerReadOnly, proposal])

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
          'Banco Escolhido': editDraft.selectedBank,
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
        return true
      }

      try {
        const context = requireProposalContext()
        setIsSavingStatus(true)
        await updateProposalStatus(context.proposalId, {
          brokerUserId: context.brokerUserId,
          status: nextStatus,
        })
        invalidateProposalsListCache(context.brokerUserId)
        await refetch()
        toast.success('Situação da proposta atualizada.')
        return true
      } catch (statusError) {
        toast.error(
          statusError instanceof Error
            ? statusError.message
            : 'Não foi possível atualizar a situação da proposta.',
        )
        return false
      } finally {
        setIsSavingStatus(false)
      }
    },
    [proposal, refetch, requireProposalContext],
  )

  const changeProposalStatus = useCallback(
    async (nextStatus: ProposalStatus) => {
      const normalizedNextStatus = normalizeProposalStatus(nextStatus)

      if (normalizedNextStatus === 'pendente' && isAdmin) {
        setPendingReasonDraft(proposal?.pendingReason ?? '')
        setIsPendingReasonModalOpen(true)
        return false
      }

      return updateProposalStatusWithPayload(normalizedNextStatus)
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

  const allProposalDocuments = [
    ...(proposal?.documents ?? []),
    ...(proposal?.sellerDocuments ?? []),
    ...(proposal?.propertyDocuments ?? []),
    ...(proposal?.incomeValidationDocuments ?? []),
  ]

  const renameDocument = useCallback(
    async (documentId: string) => {
      const document = allProposalDocuments.find((item) => item.id === documentId)
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
    [allProposalDocuments, refetch, requireProposalContext],
  )

  const downloadDocument = useCallback(
    async (documentId: string) => {
      try {
        const context = requireProposalContext()
        const document = allProposalDocuments.find((item) => item.id === documentId)
        const result = await downloadProposalDocument(
          context.proposalId,
          documentId,
          context.brokerUserId,
        )

        downloadBlob(
          result.blob,
          result.filename ||
            document?.displayName ||
            document?.originalFilename ||
            document?.filename ||
            'documento',
        )
      } catch (downloadError) {
        toast.error(
          downloadError instanceof Error
            ? downloadError.message
            : 'Não foi possível baixar o documento.',
        )
      }
    },
    [allProposalDocuments, requireProposalContext],
  )

  const deleteDocument = useCallback(
    async (documentId: string) => {
      const document = allProposalDocuments.find((item) => item.id === documentId)
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
    [allProposalDocuments, refetch, requireProposalContext],
  )

  const viewDocument = useCallback(
    async (documentId: string) => {
      try {
        const context = requireProposalContext()
        const document = allProposalDocuments.find((item) => item.id === documentId)
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
    [allProposalDocuments, requireProposalContext],
  )

  const openAllDocumentsPreview = useCallback(() => {
    if (!allProposalDocuments.length || !proposal?.id) {
      return
    }

    const documentsUrl = `/propostas/${proposal.id}/documentos`
    window.open(documentsUrl, '_blank', 'noopener,noreferrer')
  }, [allProposalDocuments.length, proposal?.id])

  const addDocuments = useCallback(
    async (selectedFiles: File[], documentScope: ProposalDocumentScope = 'proposal') => {
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
          documentScope,
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
    [canBrokerHandlePending, refetch, requireProposalContext],
  )

  const generateShareLink = useCallback(async () => {
    if (!proposal?.isOwnedByCurrentUser) {
      toast.error('Somente o dono da proposta pode gerar o link de compartilhamento.')
      return
    }

    try {
      const context = requireProposalContext()
      setIsGeneratingShareLink(true)
      const result = await createProposalShareLink(
        context.proposalId,
        context.brokerUserId,
      )
      const nextShareLink = `${window.location.origin}/propostas/compartilhar/${result.token}`

      setShareLink(nextShareLink)
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(nextShareLink)
        toast.success('Link de compartilhamento copiado.')
      } else {
        window.prompt('Copie o link de compartilhamento', nextShareLink)
        toast.success('Link de compartilhamento gerado.')
      }
    } catch (shareError) {
      toast.error(
        shareError instanceof Error
          ? shareError.message
          : 'Não foi possível gerar o link de compartilhamento.',
      )
    } finally {
      setIsGeneratingShareLink(false)
    }
  }, [proposal?.isOwnedByCurrentUser, requireProposalContext])

  const updateInviteQuery = useCallback((value: string) => {
    setInviteQuery(value)
    setSelectedInviteeId(null)
  }, [])

  const selectInvitee = useCallback((userId: string) => {
    setSelectedInviteeId(userId)
  }, [])

  const sendInvitation = useCallback(async () => {
    if (!selectedInviteeId) {
      toast.error('Selecione um usuário para enviar o convite.')
      return
    }

    try {
      const context = requireProposalContext()
      setIsManagingGuests(true)
      await createProposalInvitation(
        context.proposalId,
        context.brokerUserId,
        selectedInviteeId,
      )
      await refetch()
      setInviteQuery('')
      setInviteCandidates([])
      setSelectedInviteeId(null)
      toast.success('Convite enviado com sucesso.')
    } catch (inviteError) {
      toast.error(
        inviteError instanceof Error
          ? inviteError.message
          : 'Não foi possível enviar o convite.',
      )
    } finally {
      setIsManagingGuests(false)
    }
  }, [refetch, requireProposalContext, selectedInviteeId])

  const openRemoveGuestModal = useCallback(
    (guestUserId: string) => {
      if (!proposal) {
        return
      }

      const guest = proposal.guests.find((item) => item.userId === guestUserId)

      if (!guest) {
        return
      }

      setGuestPendingRemoval({
        userId: guest.userId,
        name: guest.name,
      })
    },
    [proposal],
  )

  const closeRemoveGuestModal = useCallback(() => {
    if (isManagingGuests) {
      return
    }

    setGuestPendingRemoval(null)
  }, [isManagingGuests])

  const confirmRemoveGuest = useCallback(async () => {
      if (!guestPendingRemoval) {
        return
      }

      try {
        const context = requireProposalContext()
        setIsManagingGuests(true)
        await removeProposalGuest(
          context.proposalId,
          guestPendingRemoval.userId,
          context.brokerUserId,
        )
        await refetch()
        setGuestPendingRemoval(null)
        toast.success('Vínculo removido com sucesso.')
      } catch (removeError) {
        toast.error(
          removeError instanceof Error
            ? removeError.message
            : 'Não foi possível remover o vínculo do convidado.',
        )
      } finally {
        setIsManagingGuests(false)
      }
    },
    [guestPendingRemoval, refetch, requireProposalContext],
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

  const openDeleteProposalModal = useCallback(() => {
    setIsDeleteProposalModalOpen(true)
  }, [])

  const closeDeleteProposalModal = useCallback(() => {
    if (isDeletingProposal) {
      return
    }

    setIsDeleteProposalModalOpen(false)
  }, [isDeletingProposal])

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
    const hasDraftComment = commentDraft.trim().length > 0
    const canResendNow =
      hasPendingUpdates || hasDraftComment || pendingDocumentsDraft.length > 0

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

  const confirmDeleteProposal = useCallback(async () => {
    try {
      const context = requireProposalContext()
      setIsDeletingProposal(true)
      await deleteProposal(context.proposalId, context.brokerUserId)
      invalidateProposalsListCache(context.brokerUserId)
      setIsDeleteProposalModalOpen(false)
      toast.success('Proposta excluída com sucesso.')
      navigate('/propostas', { replace: true })
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : 'Não foi possível excluir a proposta.',
      )
    } finally {
      setIsDeletingProposal(false)
    }
  }, [navigate, requireProposalContext])

  return {
    status,
    proposal,
    documents: proposal?.documents ?? [],
    error,
    refetch,
    isEditing,
    isAdmin,
    isBrokerReadOnly,
    canBrokerHandlePending,
    canViewGuests,
    canManageGuests,
    canDeleteProposal,
    editDraft,
    shareLink,
    inviteQuery,
    inviteCandidates,
    selectedInviteeId,
    inviteHelperMessage,
    documentPreview,
    isSavingProposal,
    isSavingStatus,
    isSavingComment,
    statusOptions,
    isLoadingStatuses,
    isUpdatingDocuments,
    isManagingGuests,
    guestPendingRemoval,
    isGeneratingShareLink,
    isSearchingInviteCandidates,
    isPendingReasonModalOpen,
    isPendingDocumentsModalOpen,
    isDeleteProposalModalOpen,
    isDeletingProposal,
    pendingReasonDraft,
    pendingDocumentsDraft,
    commentDraft,
    hasPendingUpdates,
    updateProposalState,
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
    downloadDocument,
    deleteDocument,
    viewDocument,
    openAllDocumentsPreview,
    closeDocumentPreview,
    addDocuments,
    generateShareLink,
    updateInviteQuery,
    selectInvitee,
    sendInvitation,
    openRemoveGuestModal,
    closeRemoveGuestModal,
    confirmRemoveGuest,
    openPendingDocumentsModal,
    closePendingDocumentsModal,
    openDeleteProposalModal,
    closeDeleteProposalModal,
    confirmDeleteProposal,
    stagePendingDocuments,
    removePendingDocument,
    addComment,
    setCommentDraft,
    resendForAnalysis,
    proposalBank: proposal ? extractProposalBank(proposal.formData) : '',
  }
}

function extractProposalBank(formData: Record<string, unknown>): ProposalBank | '' {
  const possibleKeys = ['Banco Escolhido', 'Banco da Proposta', 'bank', 'selectedBank']

  for (const key of possibleKeys) {
    const value = formData[key]

    if (typeof value === 'string') {
      const normalizedValue = value.trim()

      if (isProposalBank(normalizedValue)) {
        return normalizedValue
      }
    }
  }

  return ''
}

function isProposalBank(value: string): value is ProposalBank {
  return ['Caixa', 'Bradesco', 'Itaú', 'Santander', 'Inter', 'Todos'].includes(value)
}
