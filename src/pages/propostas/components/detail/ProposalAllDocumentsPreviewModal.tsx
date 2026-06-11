import { useEffect, useState } from 'react'
import { Icon } from '../../../../components/ui/Icon'
import type { ProposalDocumentPreview } from '../../hooks/useProposalDetailPage'

type ProposalAllDocumentsPreviewModalProps = {
  documents: ProposalDocumentPreview[]
  isLoading: boolean
  onClose: () => void
}

function DocumentPreviewFrame({
  document,
}: {
  document: ProposalDocumentPreview
}) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
  }, [document.id, document.url])

  return (
    <article className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-low px-4 py-3">
        <h4 className="truncate text-body-lg font-semibold text-on-surface">
          {document.fileName}
        </h4>
        <a
          href={document.url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-lg border border-outline px-3 py-2 text-label-sm font-semibold text-primary transition-all hover:bg-surface-container"
        >
          Abrir
        </a>
      </div>

      <div className="relative bg-surface">
        {isLoading ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-surface/90">
            <Icon name="sync" size={28} className="animate-spin text-primary" />
            <p className="text-body-sm text-on-surface-variant">
              Carregando documento...
            </p>
          </div>
        ) : null}

        {document.kind === 'image' ? (
          <div className="max-h-[min(70dvh,960px)] overflow-auto bg-surface-container-low p-4">
            <img
              src={document.url}
              alt={document.fileName}
              onLoad={() => setIsLoading(false)}
              className="mx-auto h-auto max-w-full rounded-lg border border-outline-variant bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.05)]"
            />
          </div>
        ) : (
          <div className="h-[min(70dvh,960px)] overflow-auto bg-surface-container-low p-4">
            <iframe
              title={document.fileName}
              src={document.url}
              onLoad={() => setIsLoading(false)}
              className="h-full min-h-[920px] w-full rounded-lg border border-outline-variant bg-white"
            />
          </div>
        )}
      </div>
    </article>
  )
}

export function ProposalAllDocumentsPreviewModal({
  documents,
  isLoading,
  onClose,
}: ProposalAllDocumentsPreviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#131b2e]/55 backdrop-blur-[2px]">
      <button
        type="button"
        aria-label="Fechar visualização"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 flex min-h-full items-start justify-center p-3 sm:p-4">
        <div className="flex w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0px_24px_80px_rgba(19,27,46,0.28)]">
          <div
            className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-outline-variant bg-surface-container-low px-5 py-4"
          >
            <div className="min-w-0">
              <h3 className="truncate text-headline-md font-semibold text-on-surface">
                Todos os documentos
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                Visualize todos os arquivos da proposta em uma única janela.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="ml-4 rounded-lg p-2 text-on-surface-variant transition-all hover:bg-surface-container hover:text-on-surface"
              aria-label="Fechar"
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          <div className="bg-surface-container-low p-5 pb-8">
            {isLoading ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">
                <Icon name="sync" size={30} className="animate-spin text-primary" />
                <p className="text-body-md text-on-surface-variant">
                  Carregando documentos...
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {documents.map((previewDocument) => (
                  <article key={previewDocument.id}>
                    <DocumentPreviewFrame document={previewDocument} />
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
