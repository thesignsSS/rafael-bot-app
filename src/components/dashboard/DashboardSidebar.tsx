import { Icon } from '../ui/Icon'
import { SidebarNavButton } from './SidebarNavButton'
import { SidebarNavItem } from './SidebarNavItem'

export function DashboardSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 border-r border-outline-variant bg-surface px-4 py-4 lg:flex lg:flex-col">
      <div className="mb-8 px-2">
        <h1 className="text-headline-md font-bold text-on-surface">Rafael Bot</h1>
        <p className="text-body-sm text-on-surface-variant">Documentos</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        <SidebarNavItem icon="note_add" label="Nova Proposta" to="/" end />
        <SidebarNavItem icon="description" label="Minhas Propostas" to="/propostas" />
        <SidebarNavButton icon="history" label="Histórico" />
        <SidebarNavButton icon="help" label="Ajuda" />
      </nav>

      <div className="mt-auto border-t border-outline-variant pt-4">
        <div className="rounded-xl bg-surface-container-low p-4">
          <p className="mb-2 text-body-sm text-on-surface-variant">
            Dúvidas? Fale com o administrador
          </p>
          <a
            href="https://wa.me/5585999999999"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-body-sm font-semibold text-primary"
          >
            <Icon name="call" size={18} />
            (85) 99999-9999
          </a>
        </div>
      </div>
    </aside>
  )
}
