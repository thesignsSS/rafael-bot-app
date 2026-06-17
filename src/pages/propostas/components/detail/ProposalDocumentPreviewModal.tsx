import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../../../../components/ui/Icon'
import type { ProposalDocumentKind } from '../../types/proposal-detail'

type ProposalDocumentPreviewModalProps = {
  fileName: string
  kind: ProposalDocumentKind
  url: string
  onClose: () => void
}

const MIN_IMAGE_SCALE = 0.5
const DEFAULT_IMAGE_SCALE = 1

export function ProposalDocumentPreviewModal({
  fileName,
  kind,
  url,
  onClose,
}: ProposalDocumentPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [imageScale, setImageScale] = useState(
    kind === 'image' ? MIN_IMAGE_SCALE : DEFAULT_IMAGE_SCALE,
  )
  const [imageRotation, setImageRotation] = useState(0)
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 })
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 })
  const [isDraggingImage, setIsDraggingImage] = useState(false)
  const dragStateRef = useRef<{
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

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
    setImageScale(kind === 'image' ? MIN_IMAGE_SCALE : DEFAULT_IMAGE_SCALE)
    setImageRotation(0)
    setImageOffset({ x: 0, y: 0 })
    setImageNaturalSize({ width: 0, height: 0 })
    setIsDraggingImage(false)
    dragStateRef.current = null
  }, [fileName, kind, url])

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
    setImageRotation((current) => current + (event.deltaY > 0 ? 90 : -90))
  }

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
        <div className="relative z-10 my-2 flex max-h-[calc(100dvh-1rem)] min-h-[60dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[0px_24px_80px_rgba(19,27,46,0.28)] sm:my-4 sm:max-h-[calc(100dvh-2rem)]">
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
              <div className="flex h-full min-h-0 flex-col">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-white px-4 py-3 sm:px-5">
                  <p className="text-body-sm text-on-surface-variant">
                    Use os controles para ajustar a visualização da imagem. Atalho:
                    segure Ctrl + scroll para girar.
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

                <div className="min-h-0 flex-1 bg-surface-container-low p-4 sm:p-5">
                  <div className="h-full overflow-x-auto overflow-y-auto overscroll-contain rounded-lg border border-outline-variant bg-white">
                    <div className="flex min-h-full min-w-full items-start justify-center p-3">
                    <div
                      onMouseDown={handleImageMouseDown}
                      onWheel={handleImageWheel}
                      className={`inline-flex ${
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
                        src={url}
                        alt={fileName}
                        onLoad={(event) => {
                          setImageNaturalSize({
                            width: event.currentTarget.naturalWidth,
                            height: event.currentTarget.naturalHeight,
                          })
                          setIsLoading(false)
                        }}
                        draggable={false}
                        className="block h-auto max-w-none select-none rounded-lg object-contain shadow-[0px_1px_3px_rgba(0,0,0,0.05)] transition-transform duration-200"
                        style={{
                          width:
                            imageNaturalSize.width > 0
                              ? `${imageNaturalSize.width * imageScale}px`
                              : undefined,
                          height:
                            imageNaturalSize.height > 0
                              ? `${imageNaturalSize.height * imageScale}px`
                              : undefined,
                          transform: `rotate(${imageRotation}deg)`,
                          transformOrigin: 'top center',
                        }}
                      />
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container-low p-3 sm:p-4">
                <iframe
                  title={fileName}
                  src={url}
                  onLoad={() => setIsLoading(false)}
                  className="h-[65dvh] min-h-[320px] w-full rounded-lg border border-outline-variant bg-white sm:h-[72dvh] sm:min-h-[540px]"
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
