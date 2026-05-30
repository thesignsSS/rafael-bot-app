import { Icon } from '../../../components/ui/Icon'
import { SidebarItem } from './SidebarItem'

export function HomeSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 border-r border-outline-variant/60 bg-white px-5 py-7 lg:block">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
          <Icon name="description" size={26} />
        </div>
        <div>
          <p className="text-headline-md font-bold">Rafael Bot</p>
          <p className="text-body-sm text-on-surface-variant">Documentos</p>
        </div>
      </div>

      <nav className="mt-16 space-y-2">
        <SidebarItem icon="note_add" label="Nova Proposta" active />
        <SidebarItem icon="inventory_2" label="Minhas Propostas" />
        <SidebarItem icon="history" label="Histórico" />
        <SidebarItem icon="help" label="Ajuda" />
      </nav>

      <div className="absolute bottom-6 left-5 right-5 rounded-lg border border-outline-variant/70 bg-surface-container-lowest p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Icon name="chat" size={18} />
          </div>
          <div>
            <p className="text-label-md font-semibold">Dúvidas?</p>
            <p className="text-body-sm text-on-surface-variant">
              Fale com o administrador
            </p>
            <a
              href="https://wa.me/5585999999999"
              target="_blank"
              rel="noreferrer"
              className="mt-1 block text-label-sm font-semibold text-primary"
            >
              (85) 99999-9999
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
