import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import { useWhatsAppConnectionStatus } from '../../hooks/useWhatsAppConnectionStatus'
import { Icon } from '../ui/Icon'

const NOTICE_STORAGE_KEY = 'effectus-whatsapp-bot-notice-dismissed'

const HIDDEN_ROUTES = new Set(['/login', '/cadastro', '/recuperar-senha', '/redefinir-senha'])

export function WhatsAppBotNotice() {
  const { session, isAdmin } = useAuth()
  const { pathname } = useLocation()
  const [isDismissed, setIsDismissed] = useState(false)
  const shouldLoadConnectionStatus =
    isAdmin &&
    pathname.startsWith('/admin') &&
    !HIDDEN_ROUTES.has(pathname) &&
    pathname !== '/admin/whatsapp'
  const connectionStatus = useWhatsAppConnectionStatus(shouldLoadConnectionStatus)

  useEffect(() => {
    setIsDismissed(window.localStorage.getItem(NOTICE_STORAGE_KEY) === 'true')
  }, [])

  if (
    !session ||
    !isAdmin ||
    isDismissed ||
    connectionStatus == null ||
    connectionStatus === 'connected' ||
    HIDDEN_ROUTES.has(pathname) ||
    pathname === '/admin/whatsapp'
  ) {
    return null
  }

  function handleDismiss() {
    setIsDismissed(true)
    window.localStorage.setItem(NOTICE_STORAGE_KEY, 'true')
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 w-[calc(100vw-2rem)] max-w-[320px] overflow-hidden rounded-[24px] border border-amber-200 bg-[linear-gradient(135deg,#fffdf2_0%,#fff7db_100%)] shadow-[0px_18px_48px_rgba(120,84,0,0.18)] sm:bottom-6 sm:left-6">
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white/90 shadow-[0px_10px_24px_rgba(120,84,0,0.12)]">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Icon name="robot_2" size={22} />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-[0px_6px_14px_rgba(245,158,11,0.35)]">
              <Icon name="priority_high" size={14} />
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-label-sm font-semibold uppercase tracking-[0.14em] text-amber-700">
                Aviso
              </p>
              <h3 className="mt-1 text-title-md font-semibold text-amber-950">
                Bot da Effectus desativado
              </h3>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-amber-700 transition-colors hover:bg-white/80 hover:text-amber-950"
              aria-label="Fechar aviso"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          <p className="mt-2 text-body-sm leading-5 text-amber-900/90">
            O bot da Effectus está desativado no momento.
            {' Acesse Bot do WhatsApp para mais informações.'}
          </p>

          <Link
            to="/admin/whatsapp"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-500 px-3.5 py-2 text-label-sm font-semibold text-white transition-all hover:bg-amber-600"
          >
            <Icon name="smartphone" size={16} />
            Bot do WhatsApp
          </Link>
        </div>
      </div>
    </div>
  )
}
