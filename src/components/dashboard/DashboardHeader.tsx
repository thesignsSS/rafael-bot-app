import type { User } from '@supabase/supabase-js'
import { Icon } from '../ui/Icon'
import { useUserMenu } from './hooks/useUserMenu'

type DashboardHeaderProps = {
  title: string
  user: User | null
  onSignOut: () => void
  onOpenSidebar: () => void
}

export function DashboardHeader({
  title,
  user,
  onSignOut,
  onOpenSidebar,
}: DashboardHeaderProps) {
  const { isOpen, menuRef, toggleMenu, closeMenu } = useUserMenu()

  const displayName =
    user?.user_metadata.full_name ?? user?.email ?? 'Corretor'

  const handleSignOut = () => {
    closeMenu()
    onSignOut()
  }

  return (
    <header className="sticky top-0 z-10 border-b border-outline-variant bg-surface/95 px-4 py-4 backdrop-blur sm:px-8 lg:pl-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Abrir menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            <Icon name="menu" size={24} />
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary">
            <Icon name="description" size={24} />
          </div>
          <div>
            <p className="text-label-md font-bold text-on-surface">{title}</p>
            <p className="text-body-sm text-on-surface-variant">Rafael Bot</p>
          </div>
        </div>

        <h2 className="hidden text-headline-lg font-semibold text-on-surface lg:block">
          {title}
        </h2>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={toggleMenu}
            aria-expanded={isOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            <span className="hidden max-w-44 truncate sm:block">
              Olá, {displayName}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest">
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
    </header>
  )
}
