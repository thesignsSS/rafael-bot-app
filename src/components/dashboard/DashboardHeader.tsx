import type { User } from '@supabase/supabase-js'
import { Icon } from '../ui/Icon'

type DashboardHeaderProps = {
  title: string
  user: User | null
  onSignOut: () => void
}

export function DashboardHeader({ title, user, onSignOut }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-outline-variant bg-surface/95 px-4 py-4 backdrop-blur sm:px-8 lg:pl-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 lg:hidden">
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

        <button
          type="button"
          onClick={onSignOut}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          <span className="hidden max-w-44 truncate sm:block">
            Olá, {user?.user_metadata.full_name ?? user?.email ?? 'Corretor'}
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest">
            <Icon name="person" size={20} className="text-primary" />
          </div>
        </button>
      </div>
    </header>
  )
}
