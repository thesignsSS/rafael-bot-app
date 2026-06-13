import type { User } from '@supabase/supabase-js'
import type { CurrentUserProfile } from '../../lib/current-user-profile'
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

  const displayName =
    currentUserProfile?.fullName ?? user?.user_metadata.full_name ?? user?.email ?? 'Corretor'

  const handleSignOut = () => {
    closeMenu()
    onSignOut()
  }

  const handleOpenProfile = () => {
    closeMenu()
    onOpenProfile()
  }

  return (
    <header className="sticky top-0 z-10 border-b border-outline-variant bg-surface/95 px-4 py-4 backdrop-blur sm:px-8 lg:pl-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
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
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationsMenu currentUserProfile={currentUserProfile} />

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={toggleMenu}
              aria-expanded={isOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high sm:px-3"
            >
              <div className="flex flex-col items-start gap-0.5">
                <span className="max-w-32 truncate sm:max-w-44">Olá, {displayName}</span>
                {isAdmin ? (
                  <span className="rounded-full bg-primary-container px-2 py-0.5 text-label-sm font-semibold text-on-primary-container">
                    Administrador
                  </span>
                ) : null}
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-highest">
                <Icon name="person" size={20} className="text-primary" />
              </div>
            </button>

            {isOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+8px)] z-30 min-w-40 overflow-hidden rounded-lg border border-outline-variant bg-white shadow-xl"
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
