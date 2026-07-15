import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import { useAuth } from '../../../contexts/auth-context'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import {
  filterProposalDocumentsExcludingIncomeValidation,
  inferDocumentKindFromContent,
} from '../lib/proposalDetailUtils'
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

const MIN_IMAGE_SCALE = 0.5
const DEFAULT_IMAGE_SCALE = 1

function DocumentPreview({
  document,
}: {
  document: ProposalDocumentPreview
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [imageScale, setImageScale] = useState(
    document.kind === 'image' ? MIN_IMAGE_SCALE : DEFAULT_IMAGE_SCALE,
  )
  const [imageRotation, setImageRotation] = useState(0)
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 })
  const [isDraggingImage, setIsDraggingImage] = useState(false)
  const dragStateRef = useRef<{
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setImageScale(
      document.kind === 'image' ? MIN_IMAGE_SCALE : DEFAULT_IMAGE_SCALE,
    )
    setImageRotation(0)
    setImageOffset({ x: 0, y: 0 })
    setIsDraggingImage(false)
    dragStateRef.current = null
  }, [document.id, document.kind, document.url])

  useEffect(() => {
    if (imageScale <= 1 && (imageOffset.x !== 0 || imageOffset.y !== 0)) {
      setImageOffset({ x: 0, y: 0 })
    }
  }, [imageOffset.x, imageOffset.y, imageScale])

  useEffect(() => {
    if (!isDraggingImage) {
      return
    }

    const handleMouseMove = (event: MouseEvent) => {
      const dragState = dragStateRef.current

      if (!dragState) {
        return
      }

      setImageOffset({
        x: dragState.originX + (event.clientX - dragState.startX),
        y: dragState.originY + (event.clientY - dragState.startY),
      })
    }

    const handleMouseUp = () => {
      setIsDraggingImage(false)
      dragStateRef.current = null
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingImage])

  function handleImageMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (imageScale <= 1) {
      return
    }

    event.preventDefault()
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: imageOffset.x,
      originY: imageOffset.y,
    }
    setIsDraggingImage(true)
  }

  function handleImageWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (!event.ctrlKey) {
      return
    }

    event.preventDefault()
    setImageScale((current) => {
      const nextScale = current + (event.deltaY > 0 ? -0.1 : 0.1)
      return Math.min(3, Math.max(MIN_IMAGE_SCALE, Number(nextScale.toFixed(2))))
    })
  }

  return (
    <article className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-3 border-b border-outline-variant bg-surface-container-low px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <h2 className="min-w-0 text-headline-md font-semibold text-on-surface sm:truncate">
          {document.fileName}
        </h2>

        <a
          href={document.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-outline px-3 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container sm:self-auto"
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
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3">
              <p className="text-body-sm text-on-surface-variant">
                Ajuste a visualização da imagem com zoom, giro e reset. Atalho:
                segure Ctrl + scroll para aplicar zoom.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setImageScale((current) => Math.max(MIN_IMAGE_SCALE, current - 0.1))
                  }
                  className="rounded-lg border border-outline p-2 text-primary transition-all hover:bg-surface-container"
                  aria-label="Diminuir zoom"
                  title="Diminuir zoom"
                >
                  <Icon name="zoom_out" size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setImageScale((current) => Math.min(3, current + 0.1))}
                  className="rounded-lg border border-outline p-2 text-primary transition-all hover:bg-surface-container"
                  aria-label="Aumentar zoom"
                  title="Aumentar zoom"
                >
                  <Icon name="zoom_in" size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setImageRotation((current) => current - 90)}
                  className="rounded-lg border border-outline p-2 text-primary transition-all hover:bg-surface-container"
                  aria-label="Girar para a esquerda"
                  title="Girar para a esquerda"
                >
                  <Icon name="rotate_90_degrees_ccw" size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setImageRotation((current) => current + 90)}
                  className="rounded-lg border border-outline p-2 text-primary transition-all hover:bg-surface-container"
                  aria-label="Girar para a direita"
                  title="Girar para a direita"
                >
                  <Icon name="rotate_90_degrees_cw" size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageScale(MIN_IMAGE_SCALE)
                    setImageRotation(0)
                    setImageOffset({ x: 0, y: 0 })
                  }}
                  className="rounded-lg border border-outline p-2 text-primary transition-all hover:bg-surface-container"
                  aria-label="Resetar visualização"
                  title="Resetar visualização"
                >
                  <Icon name="restart_alt" size={18} />
                </button>
              </div>
            </div>

            <div className="flex max-h-[calc(100dvh-180px)] justify-center overflow-auto rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
              <div
                onMouseDown={handleImageMouseDown}
                onWheel={handleImageWheel}
                className={`flex items-center justify-center ${
                  imageScale > 1
                    ? isDraggingImage
                      ? 'cursor-grabbing'
                      : 'cursor-grab'
                    : 'cursor-default'
                }`}
                style={{
                  transform: `translate(${imageOffset.x}px, ${imageOffset.y}px)`,
                }}
              >
                <img
                  src={document.url}
                  alt={document.fileName}
                  onLoad={() => setIsLoading(false)}
                  draggable={false}
                  className="h-auto max-w-full select-none object-contain transition-transform duration-200"
                  style={{
                    transform: `scale(${imageScale}) rotate(${imageRotation}deg)`,
                    transformOrigin: 'center center',
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <iframe
            title={document.fileName}
            src={document.url}
            onLoad={() => setIsLoading(false)}
            className="h-[60dvh] min-h-[320px] w-full rounded-lg border border-outline-variant bg-surface-container-lowest sm:h-[calc(100dvh-180px)] sm:min-h-[620px]"
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
    ? `Documentos ${proposal.proposalCode} | Effectus`
    : 'Documentos da Proposta | Effectus'
  const allProposalDocuments = useMemo(
    () =>
      proposal
        ? [
            ...filterProposalDocumentsExcludingIncomeValidation(
              proposal.documents,
              proposal.formData,
            ),
            ...proposal.sellerDocuments,
            ...proposal.propertyDocuments,
            ...proposal.incomeValidationDocuments,
          ]
        : [],
    [proposal],
  )

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

    if (allProposalDocuments.length === 0) {
      setPreviewDocuments([])
      setDocumentsError(null)
      setDocumentsStatus('ready')
      return
    }

    let shouldIgnore = false
    const currentProposal = proposal
    const currentProposalId = currentProposal.id
    const currentBrokerUserId = brokerUserId

    async function loadDocuments() {
      try {
        setDocumentsStatus('loading')
        setDocumentsError(null)

        const nextPreviewDocuments = await Promise.all(
          allProposalDocuments.map(async (document) => {
            const result = await viewProposalDocument(
              currentProposalId,
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
  }, [allProposalDocuments, brokerUserId, proposal, status])

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
              {allProposalDocuments.length === 1
                ? '1 arquivo enviado'
                : `${allProposalDocuments.length} arquivos enviados`}
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
