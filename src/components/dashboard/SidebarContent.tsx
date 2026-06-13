import type { ReactNode } from 'react'
import { useAuth } from '../../contexts/auth-context'
import { usePendingProposalIndicator } from '../../hooks/usePendingProposalIndicator'
import { Icon } from '../ui/Icon'
import { SidebarNavButton } from './SidebarNavButton'
import { SidebarNavItem } from './SidebarNavItem'

type SidebarContentProps = {
  onNavigate?: () => void
  trailingAction?: ReactNode
}

export function SidebarContent({ onNavigate, trailingAction }: SidebarContentProps) {
  const { currentUserProfile, isAdmin } = useAuth()
  const { hasPending } = usePendingProposalIndicator({
    brokerUserId: currentUserProfile?.id,
    enabled: !isAdmin,
  })

  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-2 px-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary">
            <Icon name="robot_2" size={24} />
          </div>
          <div className="min-w-0">
            <h1 className="text-headline-md font-bold text-on-surface">Effectus</h1>
            <p className="text-body-sm text-on-surface-variant">Documentos</p>
          </div>
        </div>
        {trailingAction}
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        <SidebarNavItem icon="note_add" label="Nova Proposta" to="/" end onNavigate={onNavigate} />
        <SidebarNavItem
          icon="description"
          label={isAdmin ? 'Todas as Propostas' : 'Minhas Propostas'}
          to="/propostas"
          showIndicator={!isAdmin && hasPending}
          onNavigate={onNavigate}
        />
        <SidebarNavItem
          icon="person"
          label="Meu Perfil"
          to="/perfil"
          onNavigate={onNavigate}
        />
        {isAdmin ? (
          <>
            <SidebarNavItem
              icon="manage_accounts"
              label="Gerenciar Perfis"
              to="/admin"
              onNavigate={onNavigate}
            />
            <SidebarNavItem
              icon="smartphone"
              label="Bot do WhatsApp"
              to="/admin/whatsapp"
              onNavigate={onNavigate}
            />
          </>
        ) : null}
        <SidebarNavButton icon="history" label="Histórico" />
        <SidebarNavButton icon="help" label="Ajuda" />
      </nav>

      <div className="mt-auto border-t border-outline-variant pt-4">
        <div className="rounded-xl bg-surface-container-low p-4">
          <p className="mb-2 text-body-sm text-on-surface-variant">
            Dúvidas? Fale com o administrador
          </p>
          <a
            href="https://wa.me/5585988686633"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-body-sm font-semibold text-primary"
          >
            <Icon name="call" size={18} />
            (85) 9 8868-6633
          </a>
        </div>
      </div>
    </>
  )
}
