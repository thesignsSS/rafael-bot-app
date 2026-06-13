import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
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
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    return () => {
      setIsMounted(false)
    }
  }, [])

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

  if (!isMounted) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#131b2e]/55 backdrop-blur-[2px]">
      <button
        type="button"
        aria-label="Fechar visualização"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="flex min-h-full items-start justify-center p-3 sm:p-5">
        <div className="relative z-10 my-4 flex min-h-[60dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[0px_24px_80px_rgba(19,27,46,0.28)]">
          <div className="flex flex-col gap-3 border-b border-outline-variant bg-surface-container-low px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
            <div className="min-w-0">
              <h3 className="truncate text-headline-md font-semibold text-on-surface">
                {fileName}
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                Visualização do documento
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 sm:ml-4">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-w-0 items-center justify-center rounded-lg border border-outline px-3 py-2 text-center text-label-md font-semibold text-primary transition-all hover:bg-surface-container"
              >
                Abrir em nova guia
              </a>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg p-2 text-on-surface-variant transition-all hover:bg-surface-container hover:text-on-surface"
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
              <div className="flex min-h-[50dvh] items-center justify-center overflow-auto bg-surface-container-low p-4 sm:p-5">
                <img
                  src={url}
                  alt={fileName}
                  onLoad={() => setIsLoading(false)}
                  className="h-auto max-w-full rounded-lg border border-outline-variant bg-white object-contain shadow-[0px_1px_3px_rgba(0,0,0,0.05)]"
                />
              </div>
            ) : (
              <div className="bg-surface-container-low p-3 sm:p-4">
                <iframe
                  title={fileName}
                  src={url}
                  onLoad={() => setIsLoading(false)}
                  className="h-[72dvh] min-h-[540px] w-full rounded-lg border border-outline-variant bg-white"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
