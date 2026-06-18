import { Icon } from '../../../../components/ui/Icon'
import { formatCreatedAt } from '../../lib/proposalListUtils'
import type { ProposalGuest } from '../../types/proposal-detail'

type ProposalGuestsSectionProps = {
  guests: ProposalGuest[]
  ownerName: string
  shareLink?: string | null
  isBusy?: boolean
  onCopyShareLink: () => void
  onRemoveGuest: (guestUserId: string) => void
}

export function ProposalGuestsSection({
  guests,
  ownerName,
  shareLink = null,
  isBusy = false,
  onCopyShareLink,
  onRemoveGuest,
}: ProposalGuestsSectionProps) {
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

              <button
                type="button"
                onClick={() => onRemoveGuest(guest.userId)}
                disabled={isBusy}
                className="rounded-lg border border-error/40 px-4 py-2 text-label-md font-semibold text-error transition-all hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remover vínculo
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
