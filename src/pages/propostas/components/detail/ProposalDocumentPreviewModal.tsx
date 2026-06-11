import { useEffect, useState } from 'react'
import { Icon } from '../../../../components/ui/Icon'
import type { ProposalDocumentKind } from '../../types/proposal-detail'

type ProposalDocumentPreviewModalProps = {
  fileName: string
  kind: ProposalDocumentKind
  url: string
  onClose: () => void
}

export function ProposalDocumentPreviewModal({
  fileName,
  kind,
  url,
  onClose,
}: ProposalDocumentPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true)

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

  useEffect(() => {
    setIsLoading(true)
  }, [fileName, kind, url])

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#131b2e]/55 backdrop-blur-[2px]">
      <button
        type="button"
        aria-label="Fechar visualização"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="flex min-h-full items-start justify-center p-4 sm:p-6">
        <div className="relative z-10 my-4 flex max-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0px_24px_80px_rgba(19,27,46,0.28)]">
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-5 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-headline-md font-semibold text-on-surface">
              {fileName}
            </h3>
            <p className="text-body-sm text-on-surface-variant">
              Visualização do documento
            </p>
          </div>

          <div className="ml-4 flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-outline px-3 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container"
            >
              Abrir em nova guia
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-on-surface-variant transition-all hover:bg-surface-container hover:text-on-surface"
              aria-label="Fechar"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
          </div>

          <div className="relative min-h-0 flex-1 bg-surface">
            {isLoading ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-surface/90">
                <Icon name="sync" size={30} className="animate-spin text-primary" />
                <p className="text-body-md text-on-surface-variant">
                  Carregando documento...
                </p>
              </div>
            ) : null}

            {kind === 'image' ? (
              <div className="flex h-full items-center justify-center overflow-auto bg-surface-container-low p-6">
                <img
                  src={url}
                  alt={fileName}
                  onLoad={() => setIsLoading(false)}
                  className="h-auto max-w-full rounded-lg border border-outline-variant bg-white object-contain shadow-[0px_1px_3px_rgba(0,0,0,0.05)]"
                />
              </div>
            ) : (
              <div className="h-full overflow-auto bg-surface-container-low p-4">
                <iframe
                  title={fileName}
                  src={url}
                  onLoad={() => setIsLoading(false)}
                  className="h-full min-h-[920px] w-full rounded-lg border border-outline-variant bg-white"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
