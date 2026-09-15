import { ENGENHARIA_DOCUMENT_GROUPS } from '../../types/engenharia'
import type { EngenhariaRequestDocument } from '../../types/engenhariaRequest'
import type { EngenhariaRequestComment } from '../../types/engenhariaRequest'
import { Icon } from '../../../../components/ui/Icon'
import { ProposalDocumentsSection } from '../../../propostas/components/detail/ProposalDocumentsSection'
import type { ProposalDocument } from '../../../propostas/types/proposal-detail'

type EngenhariaDocumentsManagerProps = {
  documents: EngenhariaRequestDocument[]
  comments: EngenhariaRequestComment[]
  isBusy: boolean
  canManage: boolean
  onUpload: (documentKey: string, files: File[]) => void
  onRename: (documentId: string) => void
  onDownload: (documentId: string) => void
  onDelete: (documentId: string) => void
  onView: (documentId: string) => void
  commentDrafts: Record<string, string>
  onCommentDraftChange: (scope: string, value: string) => void
  onAddComment: (scope: string) => void
}

function toProposalDocument(document: EngenhariaRequestDocument): ProposalDocument {
  return {
    id: document.id,
    filename: document.originalFilename,
    originalFilename: document.originalFilename,
    contentType: document.contentType,
    sizeBytes: document.sizeBytes,
    uploadedAt: document.uploadedAt,
    storageLocation: '',
    documentScope: 'proposal',
  }
}

export function EngenhariaDocumentsManager({
  documents,
  comments,
  isBusy,
  canManage,
  onUpload,
  onRename,
  onDownload,
  onDelete,
  onView,
  commentDrafts,
  onCommentDraftChange,
  onAddComment,
}: EngenhariaDocumentsManagerProps) {
  return (
    <div className="space-y-8">
      {ENGENHARIA_DOCUMENT_GROUPS.map((group) => (
        <section key={group.kind}>
          <h2 className="text-headline-md font-bold text-on-surface">{group.title}</h2>
          <p className="mt-1 text-body-md text-on-surface-variant">{group.description}</p>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            {group.slots.map((slot) => (
              <div key={slot.key} className="space-y-3">
                <ProposalDocumentsSection
                title={slot.label.replace(/^Anexar\s+/i, '')}
                documents={documents
                  .filter((document) => document.documentKey === slot.key)
                  .map(toProposalDocument)}
                isBusy={isBusy}
                canManageDocuments={canManage}
                onRename={onRename}
                onDownload={onDownload}
                onDelete={onDelete}
                onView={onView}
                onViewAll={() => undefined}
                onFilesSelected={(files) => onUpload(slot.key, files)}
                />
                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
                <p className="text-label-md font-semibold text-on-surface">Comentários</p>
                <div className="mt-3 space-y-2">
                  {comments.filter((comment) => comment.scope === slot.key).map((comment) => (
                    <div key={comment.id} className="rounded-lg bg-surface-container p-3 text-body-sm text-on-surface">
                      <span className="font-semibold">{comment.authorName}: </span>{comment.message}
                    </div>
                  ))}
                </div>
                <textarea
                  value={commentDrafts[slot.key] ?? ''}
                  onChange={(event) => onCommentDraftChange(slot.key, event.target.value)}
                  placeholder="Adicionar comentário..."
                  rows={2}
                  className="proposal-input mt-3 resize-none"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={isBusy || !(commentDrafts[slot.key] ?? '').trim()}
                    onClick={() => onAddComment(slot.key)}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-label-sm font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Icon name="send" size={16} /> Comentar
                  </button>
                </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
