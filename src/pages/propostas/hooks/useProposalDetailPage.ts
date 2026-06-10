import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { inferDocumentKind } from '../lib/proposalDetailUtils'
import type { ProposalDocument } from '../types/proposal-detail'
import { useProposalDetail } from './useProposalDetail'

function createDocumentId() {
  return `doc-${crypto.randomUUID()}`
}

export function useProposalDetailPage() {
  const navigate = useNavigate()
  const { proposalId } = useParams<{ proposalId: string }>()
  const { status, proposal } = useProposalDetail(proposalId)
  const [documents, setDocuments] = useState<ProposalDocument[]>([])
  const hasHandledMissingProposal = useRef(false)

  const pageTitle = proposal
    ? `Proposta #${proposal.id} | Rafael Bot`
    : 'Detalhes da Proposta | Rafael Bot'

  useDocumentTitle(pageTitle)

  useEffect(() => {
    if (proposal) {
      setDocuments(proposal.documents)
    }
  }, [proposal])

  useEffect(() => {
    if (status !== 'not_found' || hasHandledMissingProposal.current) {
      return
    }

    hasHandledMissingProposal.current = true
    toast.error('Proposta não encontrada ou sem permissão de acesso.')
    navigate('/propostas', { replace: true })
  }, [status, navigate])

  const goBack = useCallback(() => {
    navigate('/propostas')
  }, [navigate])

  const downloadAll = useCallback(() => {
    if (!proposal) {
      return
    }

    toast.success(`Preparando download de ${documents.length} arquivos da proposta #${proposal.id}.`)
  }, [proposal, documents.length])

  const renameDocument = useCallback((documentId: string) => {
    const document = documents.find((item) => item.id === documentId)

    if (!document) {
      return
    }

    toast.info(`Renomear "${document.name}" estará disponível em breve.`)
  }, [documents])

  const deleteDocument = useCallback((documentId: string) => {
    setDocuments((current) => {
      const document = current.find((item) => item.id === documentId)

      if (document) {
        toast.success(`"${document.name}" removido da proposta.`)
      }

      return current.filter((item) => item.id !== documentId)
    })
  }, [])

  const viewDocument = useCallback((documentId: string) => {
    const document = documents.find((item) => item.id === documentId)

    if (!document) {
      return
    }

    toast.info(`Visualização de "${document.name}" estará disponível em breve.`)
  }, [documents])

  const addDocuments = useCallback((selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      return
    }

    const uploadedAt = new Date().toISOString()

    setDocuments((current) => [
      ...current,
      ...selectedFiles.map((file) => ({
        id: createDocumentId(),
        name: file.name,
        kind: inferDocumentKind(file.name),
        sizeBytes: file.size,
        uploadedAt,
      })),
    ])

    toast.success(
      selectedFiles.length === 1
        ? 'Documento adicionado à proposta.'
        : `${selectedFiles.length} documentos adicionados à proposta.`,
    )
  }, [])

  return {
    status,
    proposal,
    documents,
    goBack,
    downloadAll,
    renameDocument,
    deleteDocument,
    viewDocument,
    addDocuments,
  }
}
