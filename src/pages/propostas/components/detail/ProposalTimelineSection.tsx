import type { ProposalComment } from '../../types/proposal-detail'
import type { ProposalStatus } from '../../types/proposal-status'
import { getProfileAvatarUrl } from '../../../../lib/profile-avatar'
import { Icon } from '../../../../components/ui/Icon'

type ProposalTimelineSectionProps = {
  proposalCode: string
  createdAt: string
  brokerName: string
  ownerAvatarPath: string | null
  status: ProposalStatus
  comments: ProposalComment[]
}

type TimelineEventTone = 'default' | 'pending' | 'resubmission' | 'audit'

type TimelineEvent = {
  id: string
  title: string
  description: string
  authorName: string
  authorAvatarPath: string | null
  createdAt: string
  tone: TimelineEventTone
  icon: string
}

const toneClassName: Record<TimelineEventTone, string> = {
  default: 'border-outline-variant bg-surface-container-lowest text-on-surface',
  pending: 'border-amber-400/30 bg-amber-500/10 text-on-surface',
  resubmission: 'border-sky-400/30 bg-sky-500/10 text-on-surface',
  audit: 'border-violet-400/30 bg-violet-500/10 text-on-surface',
}

const markerClassName: Record<TimelineEventTone, string> = {
  default: 'border-primary/25 bg-surface-container-lowest text-primary',
  pending: 'border-amber-400/40 bg-surface-container-lowest text-amber-400',
  resubmission: 'border-sky-400/40 bg-surface-container-lowest text-sky-400',
  audit: 'border-violet-400/40 bg-surface-container-lowest text-violet-400',
}

function formatEventDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function resolveCommentEvent(
  proposalCode: string,
  comment: ProposalComment,
): Omit<TimelineEvent, 'id' | 'authorName' | 'authorAvatarPath' | 'createdAt'> {
  if (comment.type === 'pending_reason') {
    return {
      title: 'Proposta movida para pendente',
      description: comment.message,
      tone: 'pending',
      icon: 'error',
    }
  }

  if (comment.type === 'resubmission') {
    return {
      title: 'Proposta reenviada para análise',
      description: comment.message || `A proposta ${proposalCode} foi reenviada para análise.`,
      tone: 'resubmission',
      icon: 'refresh',
    }
  }

  if (comment.type === 'audit') {
    return {
      title: 'Auditoria registrada',
      description: comment.message,
      tone: 'audit',
      icon: 'history',
    }
  }

  return {
    title: 'Comentário registrado',
    description: comment.message,
    tone: 'default',
    icon: 'chat',
  }
}

function buildTimelineEvents(input: {
  proposalCode: string
  createdAt: string
  brokerName: string
  ownerAvatarPath: string | null
  comments: ProposalComment[]
}): TimelineEvent[] {
  const createdEvent: TimelineEvent = {
    id: 'proposal-created',
    title: 'Proposta criada',
    description: `A proposta ${input.proposalCode} entrou no fluxo do Effectus.`,
    authorName: input.brokerName || 'Corretor',
    authorAvatarPath: input.ownerAvatarPath,
    createdAt: input.createdAt,
    tone: 'default',
    icon: 'note_add',
  }

  const commentEvents = input.comments.map((comment) => {
    const resolved = resolveCommentEvent(input.proposalCode, comment)

    return {
      id: comment.id,
      title: resolved.title,
      description: resolved.description,
      authorName: comment.authorName,
      authorAvatarPath: comment.authorAvatarPath ?? null,
      createdAt: comment.createdAt,
      tone: resolved.tone,
      icon: resolved.icon,
    }
  })

  return [createdEvent, ...commentEvents].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  )
}

export function ProposalTimelineSection({
  proposalCode,
  createdAt,
  brokerName,
  ownerAvatarPath,
  status,
  comments,
}: ProposalTimelineSectionProps) {
  const events = buildTimelineEvents({
    proposalCode,
    createdAt,
    brokerName,
    ownerAvatarPath,
    comments,
  })

  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-2">
        <h3 className="text-headline-md font-semibold text-on-surface">
          Linha do tempo
        </h3>
        <p className="text-body-sm text-on-surface-variant">
          Histórico das movimentações da proposta no fluxo.
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-outline-variant bg-surface p-4">
        <p className="text-label-sm font-semibold uppercase text-on-surface-variant">
          Status atual
        </p>
        <p className="mt-2 text-body-md font-semibold text-on-surface">
          {status === 'em_analise'
            ? 'Em análise'
            : status === 'pendente'
              ? 'Pendente'
              : status === 'condicionado'
                ? 'Condicionado'
                : status === 'reprovado'
                  ? 'Reprovado'
                  : 'Aprovado'}
        </p>
      </div>

      <div className="mt-6">
        <div className="rounded-[24px] bg-[linear-gradient(180deg,var(--color-surface-container-low)_0%,var(--color-surface)_100%)] px-4 py-6 sm:px-6">
          <div className="space-y-5">
            {events.map((event, index) => (
              <div key={event.id} className="relative pl-16">
                {index < events.length - 1 ? (
                  <span className="absolute top-12 left-[23px] h-[calc(100%+20px)] w-[3px] rounded-full bg-outline-variant" />
                ) : null}

                <span
                  className={`absolute top-1 left-0 flex h-12 w-12 items-center justify-center rounded-full border-[4px] shadow-sm ${markerClassName[event.tone]}`}
                >
                  <Icon name={event.icon} size={22} />
                </span>

                <article
                  className={`rounded-2xl border p-5 shadow-[0px_10px_30px_rgba(19,27,46,0.08)] ${
                    toneClassName[event.tone]
                  }`}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container-high text-sm font-semibold text-primary">
                      {getProfileAvatarUrl(event.authorAvatarPath) ? (
                        <img
                          src={getProfileAvatarUrl(event.authorAvatarPath) ?? undefined}
                          alt={`Foto de ${event.authorName}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        event.authorName.trim().charAt(0).toUpperCase() || 'U'
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-body-md font-semibold text-on-surface">
                        {event.authorName}
                      </p>
                      <p className="text-body-sm text-on-surface-variant">
                        Movimentou esta etapa
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="text-label-md font-semibold">{event.title}</h4>
                    <span className="text-body-sm text-on-surface-variant">
                      {formatEventDate(event.createdAt)}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-body-md">
                    {event.description}
                  </p>
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
