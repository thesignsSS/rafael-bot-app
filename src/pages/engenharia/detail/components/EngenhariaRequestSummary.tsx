import { Icon } from '../../../../components/ui/Icon'
import { formatCreatedAt, formatCurrencyBRL } from '../../lib/engenhariaUtils'
import type { EngenhariaRequestDetail } from '../../types/engenhariaRequest'
import type { EngenhariaRequestComment } from '../../types/engenhariaRequest'

function formatFileSize(sizeInBytes: number) {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`
  }

  const sizeInKb = sizeInBytes / 1024

  if (sizeInKb < 1024) {
    return `${sizeInKb.toFixed(1)} KB`
  }

  return `${(sizeInKb / 1024).toFixed(1)} MB`
}

type EngenhariaRequestSummaryProps = {
  request: EngenhariaRequestDetail
  isUpdatingDocuments: boolean
  onUploadDocuments: (files: File[]) => void
  onViewDocument: (documentId: string) => void
  onDownloadDocument: (documentId: string) => void
  onRenameDocument: (documentId: string) => void
  onDeleteDocument: (documentId: string) => void
  commentDraft: string
  comments: EngenhariaRequestComment[]
  isSavingComment: boolean
  onCommentDraftChange: (value: string) => void
  onAddComment: () => void
}

export function EngenhariaRequestSummary({
  request,
  isUpdatingDocuments,
  onUploadDocuments,
  onViewDocument,
  onDownloadDocument,
  onRenameDocument,
  onDeleteDocument,
  commentDraft,
  comments,
  isSavingComment,
  onCommentDraftChange,
  onAddComment,
}: EngenhariaRequestSummaryProps) {
  return (
    <div className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-sm sm:p-6">
      <h2 className="text-headline-md font-bold text-on-surface">
        Informações da Solicitação
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <p className="text-label-md font-semibold text-on-surface-variant">
            Tipo de Imóvel
          </p>
          <p className="mt-1 text-body-md text-on-surface">{request.propertyKind}</p>
        </div>
        <div>
          <p className="text-label-md font-semibold text-on-surface-variant">
            Valor do Imóvel
          </p>
          <p className="mt-1 text-body-md text-on-surface">
            {formatCurrencyBRL(request.propertyValue)}
          </p>
        </div>
        <div>
          <p className="text-label-md font-semibold text-on-surface-variant">Contato</p>
          <p className="mt-1 text-body-md text-on-surface">{request.contactPhone}</p>
        </div>
        <div>
          <p className="text-label-md font-semibold text-on-surface-variant">
            Nome de quem irá acompanhar a engenharia
          </p>
          <p className="mt-1 text-body-md text-on-surface">
            {request.accompanyingName}
          </p>
        </div>
        <div>
          <p className="text-label-md font-semibold text-on-surface-variant">
            Solicitado em
          </p>
          <p className="mt-1 text-body-md text-on-surface">
            {formatCreatedAt(request.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-8 border-t border-outline-variant pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-label-lg font-bold text-on-surface">Documentos Anexados</h3>
          <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-2 text-label-sm font-semibold text-on-primary ${isUpdatingDocuments || !request.canEdit ? 'cursor-not-allowed opacity-50' : ''}`}>
            <Icon name="upload_file" size={17} />
            {isUpdatingDocuments ? 'Anexando...' : 'Anexar documentos'}
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              disabled={isUpdatingDocuments || !request.canEdit}
              className="sr-only"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? [])
                event.target.value = ''
                if (files.length) onUploadDocuments(files)
              }}
            />
          </label>
        </div>

        {request.documents.length === 0 ? (
          <p className="mt-2 text-body-sm text-on-surface-variant">
            Nenhum documento anexado.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {request.documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant/70 bg-surface-container-lowest p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon name="draft" size={20} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-label-md font-semibold text-on-surface">
                    {document.originalFilename}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    {formatFileSize(document.sizeBytes)} · Adicionado por {document.uploadedByName ?? 'Corretor'} em{' '}
                    {new Date(document.uploadedAt).toLocaleString('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" title="Visualizar" onClick={() => onViewDocument(document.id)} className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container hover:text-primary"><Icon name="visibility" size={18} /></button>
                  <button type="button" title="Baixar" onClick={() => onDownloadDocument(document.id)} className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container hover:text-primary"><Icon name="download" size={18} /></button>
                  {request.canEdit ? <>
                    <button type="button" title="Renomear" disabled={isUpdatingDocuments} onClick={() => onRenameDocument(document.id)} className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container hover:text-primary disabled:opacity-50"><Icon name="edit" size={18} /></button>
                    <button type="button" title="Excluir" disabled={isUpdatingDocuments} onClick={() => onDeleteDocument(document.id)} className="rounded-full p-2 text-on-surface-variant hover:bg-error-container hover:text-error disabled:opacity-50"><Icon name="delete" size={18} /></button>
                  </> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-outline-variant pt-6">
        <h3 className="text-label-lg font-bold text-on-surface">Comentários</h3>
        <div className="mt-3 space-y-2">
          {comments.length === 0 ? <p className="text-body-sm text-on-surface-variant">Nenhum comentário registrado.</p> : comments.map((comment) => (
            <div key={comment.id} className="rounded-lg bg-surface-container p-3 text-body-sm text-on-surface"><span className="font-semibold">{comment.authorName}: </span>{comment.message}</div>
          ))}
        </div>
        <textarea value={commentDraft} onChange={(event) => onCommentDraftChange(event.target.value)} placeholder="Adicionar comentário..." rows={3} className="proposal-input mt-4 resize-none" />
        <div className="mt-3 flex justify-end"><button type="button" disabled={isSavingComment || !commentDraft.trim()} onClick={onAddComment} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-label-sm font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-50"><Icon name="send" size={16} />{isSavingComment ? 'Enviando...' : 'Comentar'}</button></div>
      </div>
    </div>
  )
}
