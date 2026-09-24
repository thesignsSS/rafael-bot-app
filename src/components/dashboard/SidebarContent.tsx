import type { ReactNode } from 'react'
import { useAuth } from '../../contexts/auth-context'
import {
  isBrazilTheme,
  usePreferences,
} from '../../contexts/preferences-context'
import { usePendingInvitationsIndicator } from '../../hooks/usePendingInvitationsIndicator'
import { usePendingProposalIndicator } from '../../hooks/usePendingProposalIndicator'
import { useTenant } from '../../hooks/useTenant'
import { ThemeBrandMark } from '../brand/ThemeBrandMark'
import { Icon } from '../ui/Icon'
import { SidebarNavButton } from './SidebarNavButton'
import { SidebarNavItem } from './SidebarNavItem'

type SidebarContentProps = {
  onNavigate?: () => void
  trailingAction?: ReactNode
  isCollapsed?: boolean
}

export function SidebarContent({
  onNavigate,
  trailingAction,
  isCollapsed = false,
}: SidebarContentProps) {
  const { currentUserProfile, isAdmin } = useAuth()
  const { preferences } = usePreferences()
  const { hasPending } = usePendingProposalIndicator({
    brokerUserId: currentUserProfile?.id,
    enabled: !isAdmin,
  })
  const {
    hasPending: hasPendingInvitations,
    pendingCount: pendingInvitationsCount,
  } = usePendingInvitationsIndicator({
    brokerUserId: currentUserProfile?.id,
    enabled: !isAdmin,
  })
  const isBrazucaTheme = isBrazilTheme(preferences.theme)
  const tenant = useTenant()
  const companyName = tenant.status === 'encontrada' ? tenant.empresa.nome : null
  const companyLogoUrl = tenant.status === 'encontrada' ? tenant.empresa.logoUrl : null

  return (
    <>
      <div
        className={`dashboard-brand-shell relative mb-8 flex items-center gap-2 ${
          isCollapsed ? 'justify-center px-0 pt-1' : 'justify-between px-2'
        }`}
      >
        <div
          className={`flex min-w-0 items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}
        >
          {companyLogoUrl ? (
            <img
              src={companyLogoUrl}
              alt={`Logo de ${companyName}`}
              className="h-10 w-10 shrink-0 rounded-xl border border-outline-variant object-contain bg-surface-container-lowest"
            />
          ) : (
            <ThemeBrandMark size="sm" />
          )}
          {!isCollapsed ? (
            <div className="min-w-0">
              <h1 className="truncate text-headline-md font-bold text-on-surface">
                {companyName ?? 'Effectus'}
              </h1>
              <p className="text-body-sm text-on-surface-variant">
                {isBrazucaTheme ? 'Modo Brazuca' : 'Documentos'}
              </p>
            </div>
          ) : null}
        </div>
        {trailingAction}
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        <SidebarNavItem
          icon="note_add"
          label="Nova Proposta"
          to="/"
          end
          onNavigate={onNavigate}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          icon="description"
          label={isAdmin ? 'Todas as Propostas' : 'Minhas Propostas'}
          to="/propostas"
          showIndicator={!isAdmin && hasPending}
          onNavigate={onNavigate}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          icon="engineering"
          label="Solicitações de Engenharia"
          to="/engenharia"
          onNavigate={onNavigate}
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          icon="person"
          label="Meu Perfil"
          to="/perfil"
          onNavigate={onNavigate}
          isCollapsed={isCollapsed}
        />
        {!isAdmin ? (
          <SidebarNavItem
            icon="mail"
            label="Convites"
            to="/convites"
            showIndicator={hasPendingInvitations}
            indicatorCount={pendingInvitationsCount}
            onNavigate={onNavigate}
            isCollapsed={isCollapsed}
          />
        ) : null}
        {isAdmin ? (
          <>
            <SidebarNavItem
              icon="manage_accounts"
              label="Gerenciar Perfis"
              to="/admin"
              end
              onNavigate={onNavigate}
              isCollapsed={isCollapsed}
            />
            <SidebarNavItem
              icon="smartphone"
              label="Bot do WhatsApp"
              to="/admin/whatsapp"
              onNavigate={onNavigate}
              isCollapsed={isCollapsed}
            />
          </>
        ) : null}
        <SidebarNavButton icon="history" label="Histórico" isCollapsed={isCollapsed} />
        <SidebarNavButton icon="help" label="Ajuda" isCollapsed={isCollapsed} />
      </nav>

      <div className="mt-auto border-t border-outline-variant pt-4">
        <div
          className={`dashboard-support-card rounded-xl bg-surface-container-low ${isCollapsed ? 'p-3' : 'p-4'}`}
        >
          {isCollapsed ? (
            <a
              href="https://wa.me/5585988686633"
              target="_blank"
              rel="noreferrer"
              aria-label="Falar com o administrador"
              title="Falar com o administrador"
              className="flex items-center justify-center text-primary"
            >
              <Icon name="call" size={18} />
            </a>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </>
  )
}
