import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Icon } from '../../components/ui/Icon'
import { useAuth } from '../../contexts/auth-context'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import type { UserRole } from '../../lib/auth/roles'
import { supabase } from '../../lib/supabase'
import { ProposalsPagination } from '../propostas/components/ProposalsPagination'
import { ConfirmActionModal } from './components/ConfirmActionModal'
import { InviteMemberModal } from './components/InviteMemberModal'
import { RevealPasswordModal } from './components/RevealPasswordModal'
import {
  deleteTeamMember,
  fetchTeam,
  inviteTeamMember,
  resetTeamMemberPassword,
  type TeamMember,
  type TeamRole,
} from './lib/teamApi'

type ProfileDraft = {
  role: UserRole
  isActive: boolean
  canViewPreferencesInsights: boolean
}

type RevealPasswordState = {
  title: string
  description: string
  password: string
}

type PendingAction =
  | { type: 'reset-password'; member: TeamMember }
  | { type: 'delete'; member: TeamMember }

const PAGE_SIZE = 10
type SortOrder = 'default' | 'alphabetical' | 'newest' | 'oldest'

function formatCreatedAt(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function AdminPage() {
  const { currentUserProfile, refreshProfile } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [seatsUsed, setSeatsUsed] = useState(0)
  const [seatsIncluded, setSeatsIncluded] = useState(0)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [savingProfileId, setSavingProfileId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, ProfileDraft>>({})
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<SortOrder>('default')
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [revealPassword, setRevealPassword] = useState<RevealPasswordState | null>(
    null,
  )

  useDocumentTitle('Gerenciar Perfis | Effectus')

  const loadTeam = useCallback(async () => {
    if (!currentUserProfile?.id) {
      return
    }

    try {
      setIsLoading(true)

      const result = await fetchTeam(currentUserProfile.id)

      setMembers(result.members)
      setSeatsUsed(result.seatsUsed)
      setSeatsIncluded(result.seatsIncluded)
      setExpandedProfileId((currentProfileId) => {
        if (
          currentProfileId &&
          result.members.some((member) => member.id === currentProfileId)
        ) {
          return currentProfileId
        }

        return result.members[0]?.id ?? null
      })
      setDrafts(
        Object.fromEntries(
          result.members.map((member) => [
            member.id,
            {
              role: member.role,
              isActive: member.isActive,
              canViewPreferencesInsights: member.canViewPreferencesInsights,
            },
          ]),
        ),
      )
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os usuários da empresa.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [currentUserProfile?.id])

  useEffect(() => {
    void loadTeam()
  }, [loadTeam])

  const filteredMembers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return members
    }

    return members.filter((member) => {
      const displayName = member.fullName.toLowerCase()
      return (
        displayName.includes(normalizedSearch) ||
        member.email.toLowerCase().includes(normalizedSearch) ||
        member.id.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [members, search])

  const sortedMembers = useMemo(() => {
    const nextMembers = [...filteredMembers]

    if (sortOrder === 'alphabetical') {
      nextMembers.sort((left, right) =>
        (left.fullName.trim() || 'Usuário sem nome').localeCompare(
          right.fullName.trim() || 'Usuário sem nome',
          'pt-BR',
        ),
      )

      return nextMembers
    }

    if (sortOrder === 'oldest') {
      nextMembers.sort(
        (left, right) =>
          new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
      )

      return nextMembers
    }

    if (sortOrder === 'newest') {
      nextMembers.sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      )
    }

    return nextMembers
  }, [filteredMembers, sortOrder])

  const totalPages = Math.max(1, Math.ceil(sortedMembers.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE

    return sortedMembers.slice(start, start + PAGE_SIZE)
  }, [currentPage, sortedMembers])
  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) {
      return [1]
    }

    const startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, startPage + 4)
    const adjustedStartPage = Math.max(1, endPage - 4)

    return Array.from(
      { length: endPage - adjustedStartPage + 1 },
      (_, index) => adjustedStartPage + index,
    )
  }, [currentPage, totalPages])

  useEffect(() => {
    setPage(1)
  }, [search])

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage)
    }
  }, [currentPage, page])

  function updateDraft(profileId: string, nextDraft: Partial<ProfileDraft>) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [profileId]: {
        role: currentDrafts[profileId]?.role ?? 'broker',
        isActive: currentDrafts[profileId]?.isActive ?? true,
        canViewPreferencesInsights:
          currentDrafts[profileId]?.canViewPreferencesInsights ?? false,
        ...nextDraft,
      },
    }))
  }

  async function handleSaveProfile(member: TeamMember) {
    const draft = drafts[member.id]

    if (!draft) {
      return
    }

    try {
      setSavingProfileId(member.id)

      const { error } = await supabase
        .from('profiles')
        .update({
          role: draft.role,
          is_active: draft.isActive,
          can_view_preferences_insights: draft.canViewPreferencesInsights,
        })
        .eq('id', member.id)

      if (error) {
        throw error
      }

      setMembers((currentMembers) =>
        currentMembers.map((currentMember) =>
          currentMember.id === member.id
            ? {
                ...currentMember,
                role: draft.role,
                isActive: draft.isActive,
                canViewPreferencesInsights: draft.canViewPreferencesInsights,
              }
            : currentMember,
        ),
      )

      if (currentUserProfile?.id === member.id) {
        await refreshProfile()
      }

      toast.success('Perfil atualizado com sucesso.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar o perfil.',
      )
    } finally {
      setSavingProfileId(null)
    }
  }

  async function handleInvite(input: {
    email: string
    fullName: string
    role: TeamRole
  }) {
    if (!currentUserProfile?.id) {
      return
    }

    try {
      const result = await inviteTeamMember({
        requesterId: currentUserProfile.id,
        ...input,
      })

      setIsInviteOpen(false)
      setRevealPassword({
        title: 'Usuário convidado',
        description: `Envie essa senha para ${input.fullName} — ela vai precisar trocá-la no primeiro acesso.`,
        password: result.temporaryPassword,
      })
      await loadTeam()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Não foi possível convidar o usuário.',
      )
    }
  }

  async function handleConfirmPendingAction() {
    if (!pendingAction || !currentUserProfile?.id) {
      return
    }

    try {
      if (pendingAction.type === 'reset-password') {
        const result = await resetTeamMemberPassword(
          currentUserProfile.id,
          pendingAction.member.id,
        )

        setPendingAction(null)
        setRevealPassword({
          title: 'Senha redefinida',
          description: `Envie essa nova senha para ${pendingAction.member.fullName}.`,
          password: result.temporaryPassword,
        })
        return
      }

      await deleteTeamMember(currentUserProfile.id, pendingAction.member.id)
      toast.success('Usuário excluído.')
      setPendingAction(null)
      await loadTeam()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Não foi possível concluir a ação.',
      )
    }
  }

  const seatsAvailable = seatsIncluded > 0 && seatsUsed >= seatsIncluded

  return (
    <div className="mx-auto max-w-6xl animate-fade-up space-y-6">
      <section className="rounded-[28px] border border-outline-variant bg-[linear-gradient(135deg,var(--color-surface-container-lowest)_0%,var(--color-surface-container-low)_100%)] p-6 shadow-[0px_10px_32px_rgba(19,27,46,0.08)] sm:p-8">
        <p className="text-label-sm font-semibold uppercase tracking-[0.16em] text-primary/80">
          Administração
        </p>
        <h1 className="mt-2 text-headline-xl font-semibold text-on-surface">
          Gerenciar usuários
        </h1>
        <p className="mt-3 max-w-3xl text-body-md text-on-surface-variant">
          Convide pessoas para a sua empresa, ajuste permissões e controle
          quem tem acesso ao Effectus.
        </p>
      </section>

      <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.05)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-headline-md font-semibold text-on-surface">
              Usuários da empresa
            </h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              {filteredMembers.length} usuário
              {filteredMembers.length === 1 ? '' : 's'} encontrado
              {filteredMembers.length === 1 ? '' : 's'}
              {seatsIncluded > 0 ? ` · ${seatsUsed} de ${seatsIncluded} vagas usadas` : ''}
              .
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsInviteOpen(true)}
            disabled={seatsAvailable}
            title={
              seatsAvailable
                ? 'Limite de usuários do plano atingido'
                : undefined
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="person_add" size={20} />
            Convidar usuário
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-[220px]"
          >
            <option value="default">Sem filtro</option>
            <option value="alphabetical">Ordem alfabética</option>
            <option value="newest">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
          </select>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, e-mail ou ID"
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-[320px]"
          />
        </div>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low px-4 py-10 text-center text-body-md text-on-surface-variant">
              Carregando usuários...
            </div>
          ) : sortedMembers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low px-4 py-10 text-center text-body-md text-on-surface-variant">
              Nenhum usuário encontrado com esse filtro.
            </div>
          ) : (
            paginatedMembers.map((member) => {
              const draft = drafts[member.id] ?? {
                role: member.role,
                isActive: member.isActive,
                canViewPreferencesInsights: member.canViewPreferencesInsights,
              }
              const hasChanges =
                draft.role !== member.role ||
                draft.isActive !== member.isActive ||
                draft.canViewPreferencesInsights !== member.canViewPreferencesInsights
              const isCurrentUser = currentUserProfile?.id === member.id
              const isExpanded = expandedProfileId === member.id

              return (
                <article
                  key={member.id}
                  className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedProfileId((currentProfileId) =>
                        currentProfileId === member.id ? null : member.id,
                      )
                    }
                    aria-expanded={isExpanded}
                    className="flex w-full items-start justify-between gap-4 text-left"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-headline-md font-semibold text-on-surface">
                          {member.fullName.trim() || 'Usuário sem nome'}
                        </h3>
                        {isCurrentUser ? (
                          <span className="rounded-full bg-primary-container px-2.5 py-1 text-label-sm font-semibold text-on-primary-container">
                            Você
                          </span>
                        ) : null}
                        {member.isOwner ? (
                          <span className="rounded-full bg-amber-500/14 px-2.5 py-1 text-label-sm font-semibold text-amber-500">
                            Dono da empresa
                          </span>
                        ) : null}
                        <span
                          className={`rounded-full px-2.5 py-1 text-label-sm font-semibold ${
                            draft.role === 'admin'
                              ? 'bg-secondary-container text-on-secondary-fixed'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {draft.role === 'admin' ? 'Administrador' : 'Corretor'}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-label-sm font-semibold ${
                            draft.isActive
                              ? 'bg-emerald-500/14 text-emerald-400'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {draft.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                        {draft.canViewPreferencesInsights ? (
                          <span className="rounded-full bg-primary-container px-2.5 py-1 text-label-sm font-semibold text-on-primary-container">
                            Insights UX
                          </span>
                        ) : null}
                        {hasChanges ? (
                          <span className="rounded-full bg-amber-500/14 px-2.5 py-1 text-label-sm font-semibold text-amber-300">
                            Alterações pendentes
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-2 text-body-sm text-on-surface-variant">
                        {member.email}
                      </p>
                      <p className="mt-1 text-body-sm text-on-surface-variant">
                        Criado em {formatCreatedAt(member.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface-container-low text-on-surface-variant transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    >
                      <Icon name="expand_more" size={22} />
                    </span>
                  </button>

                  {isExpanded ? (
                    <div className="mt-5 border-t border-outline-variant pt-5">
                      <div className="grid gap-4 sm:grid-cols-2 lg:max-w-[640px]">
                        <label className="block">
                          <span className="mb-2 block text-label-md font-semibold text-on-surface">
                            Papel
                          </span>
                          <select
                            value={draft.role}
                            onChange={(event) =>
                              updateDraft(member.id, {
                                role: event.target.value === 'admin' ? 'admin' : 'broker',
                              })
                            }
                            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="broker">Corretor</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-label-md font-semibold text-on-surface">
                            Status
                          </span>
                          <select
                            value={draft.isActive ? 'active' : 'inactive'}
                            onChange={(event) =>
                              updateDraft(member.id, {
                                isActive: event.target.value === 'active',
                              })
                            }
                            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="active">Ativo</option>
                            <option value="inactive">Inativo</option>
                          </select>
                        </label>

                        <label className="block sm:col-span-2">
                          <span className="mb-2 block text-label-md font-semibold text-on-surface">
                            Permissão extra
                          </span>
                          <select
                            value={draft.canViewPreferencesInsights ? 'enabled' : 'disabled'}
                            onChange={(event) =>
                              updateDraft(member.id, {
                                canViewPreferencesInsights: event.target.value === 'enabled',
                              })
                            }
                            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="disabled">
                              Sem acesso aos insights de preferências
                            </option>
                            <option value="enabled">
                              Pode visualizar preferências dos usuários
                            </option>
                          </select>
                        </label>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setPendingAction({ type: 'reset-password', member })
                            }
                            className="rounded-xl border border-outline-variant px-4 py-2.5 text-label-md font-semibold text-on-surface transition-colors hover:bg-surface-container"
                          >
                            Redefinir senha
                          </button>

                          {!member.isOwner ? (
                            <button
                              type="button"
                              onClick={() => setPendingAction({ type: 'delete', member })}
                              className="rounded-xl border border-red-500/40 px-4 py-2.5 text-label-md font-semibold text-red-500 transition-colors hover:bg-red-500/10"
                            >
                              Excluir usuário
                            </button>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          onClick={() => void handleSaveProfile(member)}
                          disabled={!hasChanges || savingProfileId === member.id}
                          className="rounded-xl bg-primary px-5 py-3 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingProfileId === member.id ? 'Salvando...' : 'Salvar alterações'}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              )
            })
          )}
        </div>

        {!isLoading && filteredMembers.length > 0 ? (
          <ProposalsPagination
            visibleCount={paginatedMembers.length}
            totalCount={sortedMembers.length}
            page={currentPage}
            pageNumbers={pageNumbers}
            hasPrev={currentPage > 1}
            hasNext={currentPage < totalPages}
            onPrevPage={() => setPage((currentValue) => Math.max(1, currentValue - 1))}
            onNextPage={() =>
              setPage((currentValue) => Math.min(totalPages, currentValue + 1))
            }
            onGoToPage={setPage}
          />
        ) : null}
      </section>

      {isInviteOpen ? (
        <InviteMemberModal
          onClose={() => setIsInviteOpen(false)}
          onSubmit={handleInvite}
        />
      ) : null}

      {pendingAction?.type === 'reset-password' ? (
        <ConfirmActionModal
          title="Redefinir senha"
          description={`A senha atual de ${pendingAction.member.fullName} vai parar de funcionar, e uma nova senha aleatória será gerada para você enviar a ela.`}
          confirmLabel="Redefinir senha"
          onClose={() => setPendingAction(null)}
          onConfirm={handleConfirmPendingAction}
        />
      ) : null}

      {pendingAction?.type === 'delete' ? (
        <ConfirmActionModal
          title="Excluir usuário"
          description={`${pendingAction.member.fullName} será excluído permanentemente e não poderá mais acessar o Effectus. Propostas, documentos e comentários já enviados por essa pessoa continuam no sistema.`}
          confirmLabel="Excluir permanentemente"
          isDanger
          onClose={() => setPendingAction(null)}
          onConfirm={handleConfirmPendingAction}
        />
      ) : null}

      {revealPassword ? (
        <RevealPasswordModal
          title={revealPassword.title}
          description={revealPassword.description}
          password={revealPassword.password}
          onClose={() => setRevealPassword(null)}
        />
      ) : null}
    </div>
  )
}
