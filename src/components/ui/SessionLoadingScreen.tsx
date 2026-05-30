import { Icon } from './Icon'

export function SessionLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <Icon
        name="sync"
        size={32}
        className="animate-spin text-primary"
        aria-hidden
      />
      <span className="sr-only">Carregando sessão...</span>
    </div>
  )
}
