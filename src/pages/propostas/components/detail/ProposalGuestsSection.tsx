import { Icon } from '../../../../components/ui/Icon'
import { formatCreatedAt } from '../../lib/proposalListUtils'
import type {
  InviteSearchUser,
  ProposalGuest,
  ProposalInvitation,
} from '../../types/proposal-detail'

type ProposalGuestsSectionProps = {
  guests: ProposalGuest[]
  pendingInvitations: ProposalInvitation[]
  ownerName: string
  canManageGuests?: boolean
  shareLink?: string | null
  isBusy?: boolean
  inviteQuery: string
  inviteCandidates: InviteSearchUser[]
  selectedInviteeId: string | null
  isSearchingInviteCandidates?: boolean
  inviteHelperMessage?: string | null
  onInviteQueryChange: (value: string) => void
  onSelectInvitee: (userId: string) => void
  onSendInvite: () => void
  onCopyShareLink: () => void
  onRemoveGuest: (guestUserId: string) => void
}

export function ProposalGuestsSection({
  guests,
  pendingInvitations,
  ownerName,
  canManageGuests = false,
  shareLink = null,
  isBusy = false,
  inviteQuery,
  inviteCandidates,
  selectedInviteeId,
  isSearchingInviteCandidates = false,
  inviteHelperMessage = null,
  onInviteQueryChange,
  onSelectInvitee,
  onSendInvite,
  onCopyShareLink,
  onRemoveGuest,
}: ProposalGuestsSectionProps) {
  const selectedInvitee = inviteCandidates.find((item) => item.id === selectedInviteeId) ?? null

  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-4 border-b border-outline-variant p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Icon name="group" size={22} />
            <h3 className="text-headline-md font-semibold text-on-surface">
              Convidados da proposta
            </h3>
          </div>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Dono da proposta: <span className="font-medium text-on-surface">{ownerName}</span>
          </p>
        </div>

        {canManageGuests ? (
          <div className="flex flex-wrap items-center gap-3">
            {shareLink ? (
              <span className="max-w-full truncate rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-body-sm text-on-surface-variant">
                {shareLink}
              </span>
            ) : null}
            <button
              type="button"
              onClick={onCopyShareLink}
              disabled={isBusy}
              className="rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              {shareLink ? 'Copiar link' : 'Gerar link de compartilhamento'}
            </button>
          </div>
        ) : null}
      </div>

      {canManageGuests ? (
        <div className="border-b border-outline-variant p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div>
              <label className="text-label-md font-semibold text-on-surface">
                Convidar usuário
              </label>
              <input
                type="text"
                value={inviteQuery}
                onChange={(event) => onInviteQueryChange(event.target.value)}
                placeholder="Digite pelo menos 5 letras do nome"
                className="mt-2 w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-2 text-body-sm text-on-surface-variant">
                {inviteHelperMessage ?? 'Procure o usuário pelo nome para enviar o convite.'}
              </p>

              {inviteCandidates.length > 0 ? (
                <div className="mt-3 max-h-56 overflow-y-auto rounded-xl border border-outline-variant bg-white">
                  {inviteCandidates.map((candidate) => (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => onSelectInvitee(candidate.id)}
                      className={`flex w-full items-center justify-between gap-3 border-b border-outline-variant px-4 py-3 text-left last:border-b-0 hover:bg-surface-container-low ${
                        selectedInviteeId === candidate.id ? 'bg-primary-fixed/40' : ''
                      }`}
                    >
                      <span className="min-w-0 truncate text-body-md font-medium text-on-surface">
                        {candidate.fullName}
                      </span>
                      <span className="shrink-0 text-body-sm text-on-surface-variant">
                        {candidate.isAdmin ? 'Admin' : 'Corretor'}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}

              {isSearchingInviteCandidates ? (
                <p className="mt-2 text-body-sm text-on-surface-variant">
                  Buscando usuários...
                </p>
              ) : null}

              {selectedInvitee ? (
                <p className="mt-3 text-body-sm text-primary">
                  Selecionado: {selectedInvitee.fullName}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onSendInvite}
              disabled={isBusy || !selectedInviteeId}
              className="rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              Enviar convite
            </button>
          </div>
        </div>
      ) : null}

      <div className="border-b border-outline-variant p-6">
        <h4 className="text-label-md font-semibold text-on-surface">
          Convites pendentes
        </h4>
        {pendingInvitations.length === 0 ? (
          <p className="mt-3 text-body-md text-on-surface-variant">
            Nenhum convite pendente enviado.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="rounded-xl border border-outline-variant bg-white px-4 py-3"
              >
                <p className="text-body-md font-semibold text-on-surface">
                  {invitation.inviteeName}
                </p>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  Convite criado em {formatCreatedAt(invitation.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {guests.length === 0 ? (
        <div className="px-6 py-10 text-center text-body-md text-on-surface-variant">
          Nenhum convidado vinculado ainda.
        </div>
      ) : (
        <div className="divide-y divide-outline-variant">
          {guests.map((guest) => (
            <div
              key={guest.userId}
              className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <p className="text-body-md font-semibold text-on-surface">{guest.name}</p>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  Vinculado em {formatCreatedAt(guest.joinedAt)}
                </p>
              </div>

              {canManageGuests ? (
                <button
                  type="button"
                  onClick={() => onRemoveGuest(guest.userId)}
                  disabled={isBusy}
                  className="rounded-lg border border-error/40 px-4 py-2 text-label-md font-semibold text-error transition-all hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remover vínculo
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
