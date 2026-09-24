import { Icon } from '../ui/Icon'
import { SidebarContent } from './SidebarContent'

type DashboardSidebarProps = {
  isMobileOpen: boolean
  onMobileClose: () => void
}

export function DashboardSidebar({ isMobileOpen, onMobileClose }: DashboardSidebarProps) {
  return (
    <>
      <aside className="dashboard-sidebar-shell fixed inset-y-0 left-0 z-20 hidden w-20 border-r border-outline-variant bg-surface px-2 py-4 lg:flex lg:flex-col">
        <SidebarContent isCollapsed />
      </aside>

      <div
        className={`fixed inset-0 z-40 lg:hidden ${isMobileOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!isMobileOpen}
      >
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onMobileClose}
          className={`absolute inset-0 bg-inverse-surface/40 transition-opacity duration-300 ${
            isMobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          role="dialog"
          aria-modal={isMobileOpen}
          aria-label="Menu de navegação"
          className={`dashboard-sidebar-shell absolute inset-y-0 left-0 flex w-60 flex-col border-r border-outline-variant bg-surface px-4 py-4 shadow-xl transition-transform duration-300 ease-out ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent
            onNavigate={onMobileClose}
            trailingAction={
              <button
                type="button"
                onClick={onMobileClose}
                aria-label="Fechar menu"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high"
              >
                <Icon name="close" size={24} />
              </button>
            }
          />
        </aside>
      </div>
    </>
  )
}
