import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../contexts/auth-context'
import { Icon } from '../ui/Icon'

const ANNOUNCEMENT_ID = 'renda-formal-2026-07'
const ANNOUNCEMENT_STORAGE_PREFIX = 'effectus-announcement:hidden:'

function getAnnouncementStorageKey(userId: string) {
  return `${ANNOUNCEMENT_STORAGE_PREFIX}${ANNOUNCEMENT_ID}:${userId}`
}

function isAnnouncementPermanentlyHidden(userId: string) {
  try {
    return window.localStorage.getItem(getAnnouncementStorageKey(userId)) === 'true'
  } catch {
    return false
  }
}

function permanentlyHideAnnouncement(userId: string) {
  try {
    window.localStorage.setItem(getAnnouncementStorageKey(userId), 'true')
  } catch {
    // The current visit can still dismiss the modal when storage is unavailable.
  }
}

export function IncomeFormalAnnouncementModal() {
  const { currentUserProfile, session, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [dismissedForUserId, setDismissedForUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!session || !user?.id || !currentUserProfile) {
      setIsOpen(false)
      setDismissedForUserId(null)
      return
    }

    if (dismissedForUserId === user.id) {
      setIsOpen(false)
      return
    }

    setIsOpen(!isAnnouncementPermanentlyHidden(user.id))
  }, [currentUserProfile, dismissedForUserId, session, user?.id])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDismissedForUserId(user?.id ?? null)
        setIsOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, user?.id])

  if (!isOpen || !user?.id) {
    return null
  }

  const handleNeverShowAgain = () => {
    permanentlyHideAnnouncement(user.id)
    setDismissedForUserId(user.id)
    setIsOpen(false)
  }

  const handleClose = () => {
    setDismissedForUserId(user.id)
    setIsOpen(false)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#131b2e]/70 p-3 backdrop-blur-sm sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="income-formal-announcement-title"
        aria-describedby="income-formal-announcement-description"
        className="flex h-[92dvh] max-h-[920px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[0_28px_80px_rgba(0,0,0,0.32)]"
      >
        <h2 id="income-formal-announcement-title" className="sr-only">
          Novidade sobre comprovação de renda
        </h2>
        <p id="income-formal-announcement-description" className="sr-only">
          Rendas de aplicativos de entrega e transporte agora podem ser consideradas
          renda formal mediante o envio dos documentos informados no anúncio.
        </p>

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-surface-container-low p-2 sm:p-4">
          <img
            src="/announcements/renda-formal-effectus.png?v=2"
            alt="Comunicado Effectus: renda de aplicativos agora pode ser considerada renda formal, com orientações sobre extratos e relatórios necessários."
            className="h-full w-full object-contain"
          />
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-primary text-on-primary shadow-[0_6px_18px_rgba(0,74,198,0.28)] transition-all hover:bg-primary-container active:scale-95 sm:right-4 sm:top-4"
            aria-label="Fechar comunicado"
            title="Fechar"
          >
            <Icon name="close" size={22} />
          </button>
        </div>

        <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-outline-variant bg-surface-container-lowest px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-outline px-5 py-2.5 text-label-md font-semibold text-primary transition-colors hover:bg-surface-container"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleNeverShowAgain}
            className="rounded-lg bg-primary px-5 py-2.5 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container"
          >
            Não exibir mais
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  )
}
