import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../../contexts/auth-context'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import {
  fetchInvitations,
  respondProposalInvitation,
} from '../lib/invitationsApi'
import type { ProposalInvitation } from '../types/proposal-detail'

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export default function ConvitesPage() {
  useDocumentTitle('Convites | Effectus')

  const navigate = useNavigate()
  const { currentUserProfile, isAdmin } = useAuth()
  const userId = currentUserProfile?.id ?? null
  const [items, setItems] = useState<ProposalInvitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actingInvitationId, setActingInvitationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) {
      setItems([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const nextItems = await fetchInvitations(userId)
      setItems(nextItems)
    } catch (requestError) {
      setItems([])
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível carregar os convites.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void load()
  }, [load])

  const pendingItems = useMemo(
    () => items.filter((item) => item.status === 'pending'),
    [items],
  )
  const acceptedItems = useMemo(
    () => items.filter((item) => item.status === 'accepted'),
    [items],
  )

  const respond = useCallback(
    async (invitationId: string, action: 'accept' | 'reject') => {
      if (!userId) {
        return
      }

      try {
        setActingInvitationId(invitationId)
        await respondProposalInvitation(invitationId, userId, action)
        await load()
        toast.success(
          action === 'accept'
            ? 'Convite aceito com sucesso.'
            : 'Convite recusado com sucesso.',
        )
      } catch (responseError) {
        toast.error(
          responseError instanceof Error
            ? responseError.message
            : 'Não foi possível responder ao convite.',
        )
      } finally {
        setActingInvitationId(null)
      }
    },
    [load, userId],
  )

  if (isAdmin) {
    return (
      <div className="mx-auto max-w-4xl rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
        Convites de proposta são exibidos apenas para usuários convidados.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
        <h2 className="text-headline-lg font-semibold text-on-surface">Convites</h2>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Revise convites pendentes e acompanhe as propostas às quais você já foi vinculado.
        </p>
      </section>

      {isLoading ? (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
          Carregando convites...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-error shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
          {error}
        </div>
      ) : (
        <>
          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
            <div className="border-b border-outline-variant p-6">
              <h3 className="text-headline-md font-semibold text-on-surface">
                Convites pendentes
              </h3>
            </div>

            {pendingItems.length === 0 ? (
              <div className="p-6 text-body-md text-on-surface-variant">
                Nenhum convite pendente no momento.
              </div>
            ) : (
              <div className="divide-y divide-outline-variant">
                {pendingItems.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div>
                      <p className="text-label-md font-semibold text-primary">
                        {item.proposalCode}
                      </p>
                      <p className="mt-1 text-body-md font-semibold text-on-surface">
                        {item.clientName}
                      </p>
                      <p className="mt-2 text-body-sm text-on-surface-variant">
                        Dono: {item.ownerName}
                      </p>
                      <p className="text-body-sm text-on-surface-variant">
                        Convite enviado por {item.inviterName} em {formatDate(item.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void respond(item.id, 'reject')}
                        disabled={actingInvitationId === item.id}
                        className="rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Recusar
                      </button>
                      <button
                        type="button"
                        onClick={() => void respond(item.id, 'accept')}
                        disabled={actingInvitationId === item.id}
                        className="rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actingInvitationId === item.id ? 'Processando...' : 'Aceitar'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
            <div className="border-b border-outline-variant p-6">
              <h3 className="text-headline-md font-semibold text-on-surface">
                Convites aceitos
              </h3>
            </div>

            {acceptedItems.length === 0 ? (
              <div className="p-6 text-body-md text-on-surface-variant">
                Você ainda não aceitou nenhum convite.
              </div>
            ) : (
              <div className="divide-y divide-outline-variant">
                {acceptedItems.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div>
                      <p className="text-label-md font-semibold text-primary">
                        {item.proposalCode}
                      </p>
                      <p className="mt-1 text-body-md font-semibold text-on-surface">
                        {item.clientName}
                      </p>
                      <p className="mt-2 text-body-sm text-on-surface-variant">
                        Dono: {item.ownerName}
                      </p>
                      <p className="text-body-sm text-on-surface-variant">
                        Aceito em {item.respondedAt ? formatDate(item.respondedAt) : '-'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/propostas/${item.proposalId}`)}
                      className="rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low"
                    >
                      Abrir proposta
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
