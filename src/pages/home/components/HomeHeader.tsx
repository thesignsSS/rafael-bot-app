import type { User } from '@supabase/supabase-js'
import { Icon } from '../../../components/ui/Icon'

type HomeHeaderProps = {
  user: User | null
  onSignOut: () => void
}

export function HomeHeader({ user, onSignOut }: HomeHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-outline-variant/60 bg-white/95 px-4 py-4 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <Icon name="description" size={24} />
          </div>
          <div>
            <p className="text-label-md font-bold">Rafael Bot</p>
            <p className="text-body-sm text-on-surface-variant">Documentos</p>
          </div>
        </div>

        <div className="hidden lg:block" />

        <button
          type="button"
          onClick={onSignOut}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-label-md font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low"
        >
          <Icon name="person" size={20} />
          <span className="hidden max-w-44 truncate sm:block">
            Olá, {user?.user_metadata.full_name ?? user?.email ?? 'Corretor'}
          </span>
          <Icon name="keyboard_arrow_down" size={20} />
        </button>
      </div>
    </header>
  )
}
