import { useEffect, useRef } from 'react'
import type { ProposalComment } from '../../types/proposal-detail'

type ProposalCommentsSectionProps = {
  pendingReason: string
  comments: ProposalComment[]
  emphasized?: boolean
  highlightedCommentId?: string | null
  scrollToCommentId?: string | null
  commentDraft: string
  isSavingComment: boolean
  canAddComment: boolean
  onCommentDraftChange: (value: string) => void
  onAddComment: () => void
}

function formatCommentDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function getCommentTypeLabel(type: ProposalComment['type']) {
  if (type === 'pending_reason') {
    return 'Pendência'
  }

  if (type === 'resubmission') {
    return 'Reenvio'
  }

  return 'Comentário'
}

export function ProposalCommentsSection({
  pendingReason,
  comments,
  emphasized = false,
  highlightedCommentId = null,
  scrollToCommentId = null,
  commentDraft,
  isSavingComment,
  canAddComment,
  onCommentDraftChange,
  onAddComment,
}: ProposalCommentsSectionProps) {
  const scrollTargetRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!scrollToCommentId || !scrollTargetRef.current) {
      return
    }

    scrollTargetRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [scrollToCommentId])

  return (
    <section
      className={`rounded-xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)] ${
        emphasized
          ? 'border-2 border-amber-300 bg-amber-50/60 shadow-[0px_12px_24px_rgba(180,120,0,0.08)]'
          : 'border border-outline-variant bg-surface-container-lowest'
      }`}
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-headline-md font-semibold text-on-surface">
          Comentários
        </h3>
        <p className="text-body-sm text-on-surface-variant">
          Acompanhe o que foi solicitado e registre o retorno antes do reenvio.
        </p>
      </div>

      {pendingReason ? (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-label-sm font-semibold uppercase text-amber-900">
            Motivo atual da pendência
          </p>
          <p className="mt-2 whitespace-pre-wrap text-body-md text-amber-950">
            {pendingReason}
          </p>
        </div>
      ) : null}

      <div
        className={`mt-5 space-y-3 ${
          comments.length > 5 ? 'max-h-[460px] overflow-y-auto pr-2' : ''
        }`}
      >
        {comments.length > 0 ? (
          comments.map((comment) => (
            <article
              key={comment.id}
              ref={comment.id === scrollToCommentId ? scrollTargetRef : null}
              className={`rounded-xl border bg-white p-4 ${
                comment.id === highlightedCommentId
                  ? 'border-amber-300 bg-amber-50/70 shadow-[0px_10px_26px_rgba(245,158,11,0.12)] animate-pending-comment-glow'
                  : 'border-outline-variant'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-label-md font-semibold text-on-surface">
                  {comment.authorName}
                </span>
                <span className="rounded-full bg-surface-container px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
                  {getCommentTypeLabel(comment.type)}
                </span>
                <span className="text-body-sm text-on-surface-variant">
                  {formatCommentDate(comment.createdAt)}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-body-md text-on-surface">
                {comment.message}
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-outline-variant px-4 py-8 text-center text-body-md text-on-surface-variant">
            Nenhum comentário registrado ainda.
          </div>
        )}
      </div>

      {canAddComment ? (
        <div className="mt-5 rounded-xl border border-outline-variant bg-surface p-4">
          <textarea
            value={commentDraft}
            onChange={(event) => onCommentDraftChange(event.target.value)}
            rows={4}
            disabled={isSavingComment}
            className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="Escreva um comentário sobre a pendência ou o material enviado..."
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-body-sm text-on-surface-variant">
              Use este espaço para registrar contexto da tratativa sem misturar com o envio final.
            </p>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onAddComment}
                disabled={isSavingComment}
                className="rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingComment ? 'Salvando...' : 'Adicionar comentário'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
