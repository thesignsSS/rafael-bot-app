import { Icon } from '../../../../components/ui/Icon'
import type { EngenhariaRequestComment } from '../../types/engenhariaRequest'

type EngenhariaCommentsSectionProps = {
  comments: EngenhariaRequestComment[]
  commentDraft: string
  isSavingComment: boolean
  onCommentDraftChange: (value: string) => void
  onAddComment: () => void
}

export function EngenhariaCommentsSection({
  comments,
  commentDraft,
  isSavingComment,
  onCommentDraftChange,
  onAddComment,
}: EngenhariaCommentsSectionProps) {
  return (
    <div className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-sm sm:p-6">
      <h2 className="text-headline-md font-bold text-on-surface">Comentários</h2>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Histórico de comentários trocados sobre esta solicitação.
      </p>

      <div className="mt-5 space-y-4">
        {comments.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">
            Nenhum comentário registrado ainda.
          </p>
        ) : (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-lg border border-outline-variant/70 bg-surface-container-lowest p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-label-md font-semibold text-on-surface">
                    {comment.authorName}
                  </span>
                  <span className="rounded-full border border-outline-variant/60 px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">
                    {comment.authorRole === 'admin' ? 'Administrador' : 'Corretor'}
                  </span>
                </div>
                <span className="text-body-sm text-on-surface-variant">
                  {new Date(comment.createdAt).toLocaleString('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <p className="mt-2 text-body-md text-on-surface">{comment.message}</p>
            </article>
          ))
        )}
      </div>

      <div className="mt-6 border-t border-outline-variant pt-5">
        <textarea
          value={commentDraft}
          onChange={(event) => onCommentDraftChange(event.target.value)}
          placeholder="Escreva um comentário..."
          rows={3}
          className="proposal-input resize-none"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onAddComment}
            disabled={isSavingComment || !commentDraft.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-label-md font-semibold text-on-primary transition-all hover:bg-surface-tint disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="send" size={18} />
            {isSavingComment ? 'Enviando...' : 'Adicionar comentário'}
          </button>
        </div>
      </div>
    </div>
  )
}
