import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import { CHAT_OPEN_EVENT } from '../../lib/chat'
import type { CurrentUserProfile } from '../../lib/current-user-profile'
import { Icon } from '../ui/Icon'

type NotificationsMenuProps = {
  currentUserProfile: CurrentUserProfile | null
}

function formatNotificationDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function NotificationsMenu({ currentUserProfile }: NotificationsMenuProps) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { items, isLoading, unreadCount, markAsRead, markAllAsRead } = useNotifications(
    currentUserProfile?.id,
  )

  const hasUnread = unreadCount > 0
  const visibleItems = useMemo(() => items, [items])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  async function handleOpenNotification(
    notificationId: string,
    notificationType: string,
    proposalId: string | null,
    conversationId: string | null,
  ) {
    await markAsRead(notificationId)
    setIsOpen(false)

    if (conversationId) {
      window.dispatchEvent(
        new CustomEvent(CHAT_OPEN_EVENT, {
          detail: { conversationId },
        }),
      )
      return
    }

    if (notificationType === 'proposal_invitation_received') {
      navigate('/convites')
      return
    }

    if (proposalId && currentUserProfile) {
      navigate(`/propostas/${proposalId}`)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Abrir notificações"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
      >
        <Icon name="notifications" size={22} />
        {hasUnread ? (
          <span className="absolute top-1.5 left-1.5 h-2.5 w-2.5 rounded-full bg-primary animate-gentle-pulse" />
        ) : null}
        {hasUnread ? (
          <span className="absolute top-1 right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[11px] font-semibold text-on-error">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[0px_20px_40px_rgba(19,27,46,0.16)]">
          <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
            <div>
              <h3 className="text-label-md font-semibold text-on-surface">
                Notificações
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                {hasUnread
                  ? `${unreadCount} não ${unreadCount === 1 ? 'lida' : 'lidas'}`
                  : 'Tudo em dia'}
              </p>
            </div>
            {hasUnread ? (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="text-body-sm font-semibold text-primary transition-colors hover:text-primary-container"
              >
                Marcar tudo
              </button>
            ) : null}
          </div>

          <div className="max-h-[372px] overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-6 text-body-md text-on-surface-variant">
                Carregando notificações...
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-body-md text-on-surface-variant">
                Nenhuma notificação por enquanto.
              </div>
            ) : (
              visibleItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    void handleOpenNotification(
                      item.id,
                      item.type,
                      item.proposalId,
                      item.conversationId,
                    )
                  }
                  className={`flex w-full flex-col items-start gap-1 border-b border-outline-variant px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-surface-container-low ${
                    item.readAt === null
                      ? 'bg-primary-fixed/35'
                      : 'bg-surface-container-lowest'
                  }`}
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2">
                      {item.readAt === null ? (
                        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                      ) : null}
                      <span className="text-label-md font-semibold text-on-surface">
                        {item.title}
                      </span>
                    </div>
                  </div>
                  <p className="text-body-md text-on-surface-variant">{item.message}</p>
                  <span className="text-body-sm text-on-surface-variant">
                    {formatNotificationDate(item.createdAt)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
