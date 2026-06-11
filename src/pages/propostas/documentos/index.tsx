import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import { useAuth } from '../../../contexts/auth-context'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { inferDocumentKindFromContent } from '../lib/proposalDetailUtils'
import { viewProposalDocument } from '../lib/proposalsApi'
import { useProposalDetail } from '../hooks/useProposalDetail'
import type { ProposalDocumentKind } from '../types/proposal-detail'

type DocumentsLoadStatus = 'idle' | 'loading' | 'ready' | 'error'

type ProposalDocumentPreview = {
  id: string
  fileName: string
  kind: ProposalDocumentKind
  url: string
}

function DocumentPreview({
  document,
}: {
  document: ProposalDocumentPreview
}) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
  }, [document.id, document.url])

  return (
    <article className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-low px-4 py-3 sm:px-5">
        <h2 className="min-w-0 truncate text-headline-md font-semibold text-on-surface">
          {document.fileName}
        </h2>

        <a
          href={document.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-outline px-3 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container"
        >
          <Icon name="open_in_new" size={18} />
          Abrir
        </a>
      </div>

      <div className="relative bg-surface-container-low p-3 sm:p-4">
        {isLoading ? (
          <div className="absolute inset-3 z-10 flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-lg bg-surface/90 sm:inset-4">
            <Icon name="sync" size={30} className="animate-spin text-primary" />
            <p className="text-body-md text-on-surface-variant">
              Carregando documento...
            </p>
          </div>
        ) : null}

        {document.kind === 'image' ? (
          <div className="flex max-h-[calc(100dvh-180px)] justify-center overflow-auto rounded-lg border border-outline-variant bg-white p-3">
            <img
              src={document.url}
              alt={document.fileName}
              onLoad={() => setIsLoading(false)}
              className="h-auto max-w-full object-contain"
            />
          </div>
        ) : (
          <iframe
            title={document.fileName}
            src={document.url}
            onLoad={() => setIsLoading(false)}
            className="h-[calc(100dvh-180px)] min-h-[620px] w-full rounded-lg border border-outline-variant bg-white"
          />
        )}
      </div>
    </article>
  )
}

export default function ProposalDocumentsPage() {
  const { proposalId } = useParams<{ proposalId: string }>()
  const navigate = useNavigate()
  const { user, isLoading: isAuthLoading } = useAuth()
  const { status, proposal, error, refetch } = useProposalDetail(proposalId)
  const [documentsStatus, setDocumentsStatus] =
    useState<DocumentsLoadStatus>('idle')
  const [documentsError, setDocumentsError] = useState<string | null>(null)
  const [previewDocuments, setPreviewDocuments] = useState<
    ProposalDocumentPreview[]
  >([])
  const brokerUserId = user?.id ?? null
  const pageTitle = proposal
    ? `Documentos ${proposal.proposalCode} | Rafael Bot`
    : 'Documentos da Proposta | Rafael Bot'

  useDocumentTitle(pageTitle)

  function goToProposal() {
    if (proposalId) {
      navigate(`/propostas/${proposalId}`)
      return
    }

    navigate('/propostas')
  }

  useEffect(() => {
    if (status !== 'ready' || !proposal || !brokerUserId) {
      return
    }

    if (proposal.documents.length === 0) {
      setPreviewDocuments([])
      setDocumentsError(null)
      setDocumentsStatus('ready')
      return
    }

    let shouldIgnore = false
    const currentProposal = proposal
    const currentBrokerUserId = brokerUserId

    async function loadDocuments() {
      try {
        setDocumentsStatus('loading')
        setDocumentsError(null)

        const nextPreviewDocuments = await Promise.all(
          currentProposal.documents.map(async (document) => {
            const result = await viewProposalDocument(
              currentProposal.id,
              document.id,
              currentBrokerUserId,
            )

            return {
              id: document.id,
              fileName:
                document.displayName ||
                document.originalFilename ||
                result.filename,
              kind: inferDocumentKindFromContent(
                document.contentType,
                document.filename || result.filename,
              ),
              url: result.url,
            } satisfies ProposalDocumentPreview
          }),
        )

        if (!shouldIgnore) {
          setPreviewDocuments(nextPreviewDocuments)
          setDocumentsStatus('ready')
        }
      } catch (loadError) {
        if (!shouldIgnore) {
          setPreviewDocuments([])
          setDocumentsError(
            loadError instanceof Error
              ? loadError.message
              : 'Não foi possível carregar os documentos.',
          )
          setDocumentsStatus('error')
        }
      }
    }

    void loadDocuments()

    return () => {
      shouldIgnore = true
    }
  }, [brokerUserId, proposal, status])

  if (isAuthLoading || status === 'loading') {
    return (
      <div className="mx-auto max-w-7xl animate-pulse space-y-5">
        <div className="h-20 rounded-xl bg-surface-container" />
        <div className="h-[620px] rounded-xl bg-surface-container" />
      </div>
    )
  }

  if (status === 'error' || status === 'not_found' || !proposal) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
        <h1 className="text-headline-lg font-semibold text-on-surface">
          Não foi possível carregar os documentos
        </h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          {error ?? 'Tente novamente em instantes.'}
        </p>
        <button
          type="button"
          onClick={goToProposal}
          className="mt-6 rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low"
        >
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl animate-fade-up space-y-5">
      <header className="sticky top-0 z-20 -mx-4 border-b border-outline-variant bg-page-floor/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:rounded-xl sm:border sm:bg-surface-container-lowest sm:px-5 sm:shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-label-md font-semibold text-primary">
              {proposal.proposalCode}
            </p>
            <h1 className="truncate text-headline-lg font-semibold text-on-surface">
              Todos os documentos
            </h1>
            <p className="text-body-sm text-on-surface-variant">
              {proposal.documents.length === 1
                ? '1 arquivo enviado'
                : `${proposal.documents.length} arquivos enviados`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={refetch}
              className="inline-flex items-center gap-2 rounded-lg border border-outline px-3 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container"
            >
              <Icon name="refresh" size={18} />
              Atualizar
            </button>
            <button
              type="button"
              onClick={goToProposal}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container"
            >
              <Icon name="close" size={18} />
              Fechar
            </button>
          </div>
        </div>
      </header>

      {documentsStatus === 'loading' || documentsStatus === 'idle' ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest">
          <Icon name="sync" size={32} className="animate-spin text-primary" />
          <p className="text-body-md text-on-surface-variant">
            Carregando documentos...
          </p>
        </div>
      ) : null}

      {documentsStatus === 'error' ? (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center">
          <h2 className="text-headline-md font-semibold text-on-surface">
            Não foi possível carregar os documentos
          </h2>
          <p className="mt-2 text-body-md text-on-surface-variant">
            {documentsError ?? 'Tente novamente em instantes.'}
          </p>
        </div>
      ) : null}

      {documentsStatus === 'ready' && previewDocuments.length === 0 ? (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
          Nenhum documento enviado ainda.
        </div>
      ) : null}

      {documentsStatus === 'ready' && previewDocuments.length > 0 ? (
        <div className="space-y-5">
          {previewDocuments.map((previewDocument) => (
            <DocumentPreview
              key={previewDocument.id}
              document={previewDocument}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
