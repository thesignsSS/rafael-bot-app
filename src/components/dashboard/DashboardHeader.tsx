import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import {
  isBrazilTheme,
  usePreferences,
} from '../../contexts/preferences-context'
import {
  DASHBOARD_HEADER_FEEDBACK_EVENT,
  type DashboardHeaderFeedbackDetail,
} from '../../lib/dashboard-header-feedback'
import type { CurrentUserProfile } from '../../lib/current-user-profile'
import { getProfileAvatarUrl } from '../../lib/profile-avatar'
import { BadgeTrial } from './BadgeTrial'
import { CopaThemeBadge } from '../brand/CopaThemeBadge'
import { ThemeBrandMark } from '../brand/ThemeBrandMark'
import { Icon } from '../ui/Icon'
import { NotificationsMenu } from './NotificationsMenu'
import { useUserMenu } from './hooks/useUserMenu'

type DashboardHeaderProps = {
  title: string
  currentUserProfile: CurrentUserProfile | null
  user: User | null
  isAdmin?: boolean
  onOpenProfile: () => void
  onSignOut: () => void
  onOpenSidebar: () => void
}

export function DashboardHeader({
  title,
  currentUserProfile,
  user,
  isAdmin = false,
  onOpenProfile,
  onSignOut,
  onOpenSidebar,
}: DashboardHeaderProps) {
  const { isOpen, menuRef, toggleMenu, closeMenu } = useUserMenu()
  const { preferences } = usePreferences()
  const isBrazucaTheme = isBrazilTheme(preferences.theme)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const displayName =
    currentUserProfile?.fullName ?? user?.user_metadata.full_name ?? user?.email ?? 'Corretor'
  const avatarUrl = getProfileAvatarUrl(
    currentUserProfile?.avatarPath,
    currentUserProfile?.updatedAt,
  )

  const handleSignOut = () => {
    closeMenu()
    onSignOut()
  }

  const handleOpenProfile = () => {
    closeMenu()
    onOpenProfile()
  }

  useEffect(() => {
    const handleFeedback = (event: Event) => {
      const customEvent = event as CustomEvent<DashboardHeaderFeedbackDetail>
      const isVisible = customEvent.detail?.visible === true
      const message = customEvent.detail?.message?.trim()

      if (!isVisible) {
        setFeedbackMessage(null)
        return
      }

      setFeedbackMessage(message || 'Salvo com sucesso.')
    }

    window.addEventListener(DASHBOARD_HEADER_FEEDBACK_EVENT, handleFeedback)

    return () => {
      window.removeEventListener(DASHBOARD_HEADER_FEEDBACK_EVENT, handleFeedback)
    }
  }, [])

  return (
    <header className="dashboard-header-shell sticky top-0 z-10 border-b border-outline-variant bg-surface/95 px-4 py-2.5 backdrop-blur sm:px-8 lg:pl-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BadgeTrial />
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Abrir menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high lg:hidden"
          >
            <Icon name="menu" size={24} />
          </button>

          <div className="hidden sm:block">
            <h2 className="text-headline-lg font-semibold text-on-surface">{title}</h2>
            {isBrazucaTheme ? (
              <div className="mt-1">
                <CopaThemeBadge />
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {feedbackMessage ? (
            <span className="text-label-sm text-primary">{feedbackMessage}</span>
          ) : null}
          <NotificationsMenu currentUserProfile={currentUserProfile} />

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={toggleMenu}
              aria-expanded={isOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-lg px-2 py-1 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high sm:px-3"
            >
              <div className="flex flex-col items-start gap-0.5">
                <span className="max-w-32 truncate sm:max-w-44">Olá, {displayName}</span>
                {isAdmin ? (
                  <span className="rounded-full bg-primary-container px-2 py-0.5 text-label-sm font-semibold text-on-primary-container">
                    Administrador
                  </span>
                ) : isBrazucaTheme ? (
                  <span className="rounded-full bg-primary-container px-2 py-0.5 text-label-sm font-semibold text-on-primary-container">
                    Brazuca
                  </span>
                ) : null}
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-container-highest">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`Foto de perfil de ${displayName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ThemeBrandMark size="sm" className="h-full w-full rounded-full border-0 shadow-none" />
                )}
              </div>
            </button>

            {isOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+8px)] z-30 min-w-40 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-xl"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleOpenProfile}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-body-md text-on-surface transition-colors hover:bg-surface-container-low"
                >
                  <Icon name="person" size={18} className="text-on-surface-variant" />
                  Meu perfil
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-body-md text-on-surface transition-colors hover:bg-surface-container-low"
                >
                  <Icon name="logout" size={18} className="text-on-surface-variant" />
                  Sair
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
