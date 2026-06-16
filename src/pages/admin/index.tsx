import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Icon } from '../../components/ui/Icon'
import { useAuth } from '../../contexts/auth-context'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import type { UserRole } from '../../lib/auth/roles'
import { supabase } from '../../lib/supabase'
import { ProposalsPagination } from '../propostas/components/ProposalsPagination'

type ManagedProfile = {
  id: string
  full_name: string | null
  role: UserRole
  is_active: boolean
  created_at: string
}

type ProfileDraft = {
  role: UserRole
  isActive: boolean
}

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
  const [profiles, setProfiles] = useState<ManagedProfile[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [savingProfileId, setSavingProfileId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, ProfileDraft>>({})
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<SortOrder>('default')

  useDocumentTitle('Gerenciar Perfis | Effectus')

  useEffect(() => {
    let isMounted = true

    async function loadProfiles() {
      try {
        setIsLoading(true)

        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, role, is_active, created_at')
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        if (!isMounted) {
          return
        }

        const nextProfiles = (data ?? []).map((item) => ({
          id: item.id,
          full_name: item.full_name,
          role: item.role === 'admin' ? 'admin' : 'broker',
          is_active: item.is_active !== false,
          created_at: item.created_at,
        })) satisfies ManagedProfile[]

        setProfiles(nextProfiles)
        setExpandedProfileId((currentExpandedProfileId) => {
          if (
            currentExpandedProfileId &&
            nextProfiles.some((profile) => profile.id === currentExpandedProfileId)
          ) {
            return currentExpandedProfileId
          }

          return nextProfiles[0]?.id ?? null
        })
        setDrafts(
          Object.fromEntries(
            nextProfiles.map((profile) => [
              profile.id,
              {
                role: profile.role,
                isActive: profile.is_active,
              },
            ]),
          ),
        )
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os perfis.',
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadProfiles()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredProfiles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return profiles
    }

    return profiles.filter((profile) => {
      const displayName = (profile.full_name ?? '').toLowerCase()
      return (
        displayName.includes(normalizedSearch) ||
        profile.id.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [profiles, search])
  const sortedProfiles = useMemo(() => {
    const nextProfiles = [...filteredProfiles]

    if (sortOrder === 'alphabetical') {
      nextProfiles.sort((leftProfile, rightProfile) =>
        (leftProfile.full_name?.trim() || 'Usuário sem nome').localeCompare(
          rightProfile.full_name?.trim() || 'Usuário sem nome',
          'pt-BR',
        ),
      )

      return nextProfiles
    }

    if (sortOrder === 'oldest') {
      nextProfiles.sort(
        (leftProfile, rightProfile) =>
          new Date(leftProfile.created_at).getTime() -
          new Date(rightProfile.created_at).getTime(),
      )

      return nextProfiles
    }

    if (sortOrder === 'newest') {
      nextProfiles.sort(
        (leftProfile, rightProfile) =>
          new Date(rightProfile.created_at).getTime() -
          new Date(leftProfile.created_at).getTime(),
      )
    }

    return nextProfiles
  }, [filteredProfiles, sortOrder])

  const totalPages = Math.max(1, Math.ceil(sortedProfiles.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedProfiles = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE

    return sortedProfiles.slice(start, start + PAGE_SIZE)
  }, [currentPage, sortedProfiles])
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
        ...nextDraft,
      },
    }))
  }

  async function handleSaveProfile(profile: ManagedProfile) {
    const draft = drafts[profile.id]

    if (!draft) {
      return
    }

    try {
      setSavingProfileId(profile.id)

      const { error } = await supabase
        .from('profiles')
        .update({
          role: draft.role,
          is_active: draft.isActive,
        })
        .eq('id', profile.id)

      if (error) {
        throw error
      }

      setProfiles((currentProfiles) =>
        currentProfiles.map((currentProfile) =>
          currentProfile.id === profile.id
            ? {
                ...currentProfile,
                role: draft.role,
                is_active: draft.isActive,
              }
            : currentProfile,
        ),
      )

      if (currentUserProfile?.id === profile.id) {
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

  return (
    <div className="mx-auto max-w-6xl animate-fade-up space-y-6">
      <section className="rounded-[28px] border border-outline-variant bg-[linear-gradient(135deg,#ffffff_0%,#f5f8ff_100%)] p-6 shadow-[0px_10px_32px_rgba(19,27,46,0.08)] sm:p-8">
        <p className="text-label-sm font-semibold uppercase tracking-[0.16em] text-primary/80">
          Administração
        </p>
        <h1 className="mt-2 text-headline-xl font-semibold text-on-surface">
          Gerenciar perfis
        </h1>
        <p className="mt-3 max-w-3xl text-body-md text-on-surface-variant">
          Ative ou inative acessos e defina quais usuários terão perfil de
          administrador no Effectus.
        </p>
      </section>

      <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.05)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-headline-md font-semibold text-on-surface">
              Perfis cadastrados
            </h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              {filteredProfiles.length} usuário
              {filteredProfiles.length === 1 ? '' : 's'} encontrado
              {filteredProfiles.length === 1 ? '' : 's'}.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <select
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(event.target.value as SortOrder)
              }
              className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-[220px]"
            >
              <option value="default">Sem filtro</option>
              <option value="alphabetical">Ordem alfabética</option>
              <option value="newest">Mais recentes</option>
              <option value="oldest">Mais antigos</option>
            </select>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou ID"
              className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-body-md text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-[320px]"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low px-4 py-10 text-center text-body-md text-on-surface-variant">
              Carregando perfis...
            </div>
          ) : sortedProfiles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low px-4 py-10 text-center text-body-md text-on-surface-variant">
              Nenhum perfil encontrado com esse filtro.
            </div>
          ) : (
            paginatedProfiles.map((profile) => {
              const draft = drafts[profile.id] ?? {
                role: profile.role,
                isActive: profile.is_active,
              }
              const hasChanges =
                draft.role !== profile.role || draft.isActive !== profile.is_active
              const isCurrentUser = currentUserProfile?.id === profile.id
              const isExpanded = expandedProfileId === profile.id

              return (
                <article
                  key={profile.id}
                  className="rounded-2xl border border-outline-variant bg-white p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedProfileId((currentProfileId) =>
                        currentProfileId === profile.id ? null : profile.id,
                      )
                    }
                    aria-expanded={isExpanded}
                    className="flex w-full items-start justify-between gap-4 text-left"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-headline-md font-semibold text-on-surface">
                          {profile.full_name?.trim() || 'Usuário sem nome'}
                        </h3>
                        {isCurrentUser ? (
                          <span className="rounded-full bg-primary-container px-2.5 py-1 text-label-sm font-semibold text-on-primary-container">
                            Você
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
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {draft.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                        {hasChanges ? (
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-label-sm font-semibold text-amber-700">
                            Alterações pendentes
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-2 break-all text-body-sm text-on-surface-variant">
                        ID: {profile.id}
                      </p>
                      <p className="mt-1 text-body-sm text-on-surface-variant">
                        Criado em {formatCreatedAt(profile.created_at)}
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
                      <div className="grid gap-4 sm:grid-cols-2 lg:max-w-[420px]">
                        <label className="block">
                          <span className="mb-2 block text-label-md font-semibold text-on-surface">
                            Papel
                          </span>
                          <select
                            value={draft.role}
                            onChange={(event) =>
                              updateDraft(profile.id, {
                                role:
                                  event.target.value === 'admin' ? 'admin' : 'broker',
                              })
                            }
                            className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                              updateDraft(profile.id, {
                                isActive: event.target.value === 'active',
                              })
                            }
                            className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="active">Ativo</option>
                            <option value="inactive">Inativo</option>
                          </select>
                        </label>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => void handleSaveProfile(profile)}
                          disabled={!hasChanges || savingProfileId === profile.id}
                          className="rounded-xl bg-primary px-5 py-3 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingProfileId === profile.id
                            ? 'Salvando...'
                            : 'Salvar alterações'}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              )
            })
          )}
        </div>

        {!isLoading && filteredProfiles.length > 0 ? (
          <ProposalsPagination
            visibleCount={paginatedProfiles.length}
            totalCount={sortedProfiles.length}
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
    </div>
  )
}
