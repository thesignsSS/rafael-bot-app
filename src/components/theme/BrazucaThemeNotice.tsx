import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/auth-context'
import {
  isBrazilTheme,
  type AppTheme,
  usePreferences,
} from '../../contexts/preferences-context'

type BrazucaThemeNoticeStatus = 'accepted' | 'dismissed'

const BRAZUCA_THEME_NOTICE_STORAGE_PREFIX = 'effectus-theme-notice:brazuca:'

function getBrazucaThemeNoticeStorageKey(userId: string) {
  return `${BRAZUCA_THEME_NOTICE_STORAGE_PREFIX}${userId}`
}

function readBrazucaThemeNoticeStatus(userId: string): BrazucaThemeNoticeStatus | null {
  const storedStatus = window.localStorage.getItem(
    getBrazucaThemeNoticeStorageKey(userId),
  )

  if (storedStatus === 'accepted' || storedStatus === 'dismissed') {
    return storedStatus
  }

  return null
}

function storeBrazucaThemeNoticeStatus(
  userId: string,
  status: BrazucaThemeNoticeStatus,
) {
  window.localStorage.setItem(getBrazucaThemeNoticeStorageKey(userId), status)
}

function BrazucaThemeBadge() {
  return (
    <svg
      viewBox="0 0 72 72"
      className="h-12 w-12 shrink-0 drop-shadow-[0_10px_20px_rgba(0,84,61,0.24)]"
      role="img"
      aria-label="Ícone do tema Brazuca"
    >
      <defs>
        <linearGradient id="brazuca-card" x1="10%" x2="90%" y1="10%" y2="90%">
          <stop offset="0%" stopColor="#0f8a47" />
          <stop offset="100%" stopColor="#046c39" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="60" height="60" rx="18" fill="url(#brazuca-card)" />
      <path d="M36 16 53 36 36 56 19 36Z" fill="#f7d038" opacity="0.96" />
      <circle cx="36" cy="36" r="11.5" fill="#1b4fb9" />
      <circle cx="51" cy="51" r="11" fill="#fffdf7" />
      <path
        d="M51 44.5l4.1 3 1.6 4.8-3 4.1h-5.3l-3-4.1 1.6-4.8 4-3Z"
        fill="#0f172a"
      />
      <path
        d="M51 44.5v4.1m-4 3h8m-6.6-1.6-2.2 3.2m9-3.2 2.2 3.2"
        fill="none"
        stroke="#0f172a"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function BrazucaThemeNotice() {
  const { user, session } = useAuth()
  const { preferences, updatePreferences } = usePreferences()
  const [status, setStatus] = useState<BrazucaThemeNoticeStatus | null>(null)
  const [hasResolvedStorage, setHasResolvedStorage] = useState(false)

  useEffect(() => {
    if (!user?.id) {
      setStatus(null)
      setHasResolvedStorage(false)
      return
    }

    const nextStatus = readBrazucaThemeNoticeStatus(user.id)
    setStatus(nextStatus)
    setHasResolvedStorage(true)
  }, [user?.id])

  useEffect(() => {
    if (!user?.id || !isBrazilTheme(preferences.theme)) {
      return
    }

    storeBrazucaThemeNoticeStatus(user.id, 'accepted')
    setStatus('accepted')
    setHasResolvedStorage(true)
  }, [preferences.theme, user?.id])

  const isVisible = useMemo(() => {
    if (!session || !user?.id || !hasResolvedStorage) {
      return false
    }

    return status === null
  }, [hasResolvedStorage, session, status, user?.id])

  if (!isVisible) {
    return null
  }

  function handleDismiss() {
    if (!user?.id) {
      return
    }

    storeBrazucaThemeNoticeStatus(user.id, 'dismissed')
    setStatus('dismissed')
  }

  function handleActivateTheme(theme: Extract<AppTheme, 'brazuca' | 'brazuca-dark'>) {
    if (!user?.id) {
      return
    }

    updatePreferences({
      theme,
      chatWallpaper: 'classic',
    })
    storeBrazucaThemeNoticeStatus(user.id, 'accepted')
    setStatus('accepted')
  }

  return (
    <aside className="fixed bottom-36 left-4 z-40 w-[min(90vw,19rem)] overflow-hidden rounded-[22px] border border-[#f7d038]/50 bg-[linear-gradient(160deg,rgba(5,91,50,0.97)_0%,rgba(10,122,64,0.98)_58%,rgba(245,210,52,0.95)_100%)] text-white shadow-[0_20px_48px_rgba(3,74,43,0.3)] backdrop-blur-sm sm:bottom-4">
      <div
        className="absolute inset-0 opacity-70"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 14% 22%, rgba(255,255,255,0.2) 0, rgba(255,255,255,0.2) 14px, transparent 15px), radial-gradient(circle at 82% 20%, rgba(255,221,87,0.2) 0, rgba(255,221,87,0.2) 18px, transparent 19px), radial-gradient(circle at 76% 78%, rgba(255,255,255,0.18) 0, rgba(255,255,255,0.18) 16px, transparent 17px), url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='180' viewBox='0 0 240 180'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.18' stroke-width='1.5'%3E%3Ccircle cx='44' cy='42' r='20'/%3E%3Ccircle cx='186' cy='54' r='16'/%3E%3Ccircle cx='178' cy='138' r='28'/%3E%3Cpath d='M22 112h48c14 0 26 12 26 26v20'/%3E%3Cpath d='M118 34h28m-14-14v28'/%3E%3Cpath d='M110 150c0-13 10-24 24-24s24 11 24 24'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: 'auto, auto, auto, 220px 160px',
          backgroundPosition: '0 0, 0 0, 0 0, center',
        }}
      />

      <div className="relative p-4">
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fechar aviso de tema"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/18 bg-white/10 text-white transition-colors hover:bg-white/18"
        >
          <span className="text-base leading-none" aria-hidden="true">
            ×
          </span>
        </button>

        <div className="flex items-start gap-3">
          <BrazucaThemeBadge />

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#fff4ba]">
              Novo tema disponível
            </p>
            <h2 className="mt-1 text-[1.15rem] font-semibold leading-6 text-white">
              Brasil em campo no Effectus
            </h2>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={() => handleActivateTheme('brazuca')}
            className="flex items-center justify-between rounded-[1.15rem] bg-white px-3.5 py-2.5 text-left text-sm font-semibold text-[#06683a] transition-transform hover:scale-[1.01]"
          >
            <span>
              <span className="block">Usar Brazuca Claro</span>
              <span className="mt-0.5 block text-[11px] font-medium text-[#4f765f]">
                Campo iluminado, vibe de festa e Copa.
              </span>
            </span>
            <span className="rounded-full bg-[#f3fbf1] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#0a6c3a]">
              Claro
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleActivateTheme('brazuca-dark')}
            className="flex items-center justify-between rounded-[1.15rem] border border-white/18 bg-[#0b1f17]/72 px-3.5 py-2.5 text-left text-sm font-semibold text-white transition-transform hover:scale-[1.01] hover:bg-[#0e281d]"
          >
            <span>
              <span className="block">Usar Brazuca Escuro</span>
              <span className="mt-0.5 block text-[11px] font-medium text-white/72">
                Noite de estádio, contraste forte e clima decisivo.
              </span>
            </span>
            <span className="rounded-full bg-white/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
              Escuro
            </span>
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-full border border-white/30 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/16"
          >
            Agora não
          </button>
        </div>
      </div>
    </aside>
  )
}
