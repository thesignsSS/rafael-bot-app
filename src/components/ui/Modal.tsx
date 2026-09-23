import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  titleId: string
  title: string
  children: ReactNode
  onClose: () => void
  maxWidthClassName?: string
}

export function Modal({
  titleId,
  title,
  children,
  onClose,
  maxWidthClassName = 'max-w-md',
}: ModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#131b2e]/70 p-3 backdrop-blur-sm sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`w-full ${maxWidthClassName} rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_28px_80px_rgba(0,0,0,0.32)]`}
      >
        <h2 id={titleId} className="text-headline-md font-semibold text-on-surface">
          {title}
        </h2>

        <div className="mt-4">{children}</div>
      </section>
    </div>,
    document.body,
  )
}
