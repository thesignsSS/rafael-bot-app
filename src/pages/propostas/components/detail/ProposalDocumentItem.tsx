import { Icon } from '../../../../components/ui/Icon'
import {
  formatDocumentDate,
  formatFileSize,
  getDocumentIconStyles,
  inferDocumentKindFromContent,
} from '../../lib/proposalDetailUtils'
import type { ProposalDocument } from '../../types/proposal-detail'

type ProposalDocumentItemProps = {
  document: ProposalDocument
  isBusy?: boolean
  onRename: (documentId: string) => void
  onDownload: (documentId: string) => void
  onDelete: (documentId: string) => void
  onView: (documentId: string) => void
}

export function ProposalDocumentItem({
  document,
  isBusy = false,
  onRename,
  onDownload,
  onDelete,
  onView,
}: ProposalDocumentItemProps) {
  const iconStyles = getDocumentIconStyles(
    inferDocumentKindFromContent(document.contentType, document.filename),
  )
  const displayName = document.displayName || document.originalFilename || document.filename
  const uploadedByName = document.uploadedByName?.trim() || 'Usuário'
  const shouldHighlightUploader = document.isUploadedByProposalOwner === false

  return (
    <div className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-container-low">
      <div className="flex min-w-0 items-center gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconStyles.container}`}
        >
          <Icon name={iconStyles.icon} size={22} />
        </div>

        <div className="min-w-0">
          <h4 className="truncate text-body-md font-semibold text-on-surface">
            {displayName}
          </h4>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-body-sm text-on-surface-variant">
            <span>
              {formatFileSize(document.sizeBytes)} • Enviado em{' '}
              {formatDocumentDate(document.uploadedAt)}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="inline-flex min-w-0 items-center gap-1">
              <span>Enviado por:</span>
              <span
                className={
                  shouldHighlightUploader
                    ? 'max-w-[12rem] truncate rounded-md border border-primary-fixed-dim bg-primary-fixed px-1.5 py-0.5 text-label-sm font-semibold text-on-primary-fixed'
                    : 'max-w-[12rem] truncate font-medium text-on-surface'
                }
                title={uploadedByName}
              >
                {uploadedByName}
              </span>
            </span>
          </p>
        </div>
      </div>

      <div className="flex shrink-0 gap-1 sm:gap-2">
        <button
          type="button"
          title="Renomear"
          onClick={() => onRename(document.id)}
          disabled={isBusy}
          className="rounded-full p-2 text-on-surface-variant transition-all hover:bg-primary-container/20 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="edit" size={20} />
        </button>
        <button
          type="button"
          title="Baixar"
          onClick={() => onDownload(document.id)}
          disabled={isBusy}
          className="rounded-full p-2 text-on-surface-variant transition-all hover:bg-primary-container/20 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="download" size={20} />
        </button>
        <button
          type="button"
          title="Excluir"
          onClick={() => onDelete(document.id)}
          disabled={isBusy}
          className="rounded-full p-2 text-on-surface-variant transition-all hover:bg-error-container/40 hover:text-error disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="delete" size={20} />
        </button>
        <button
          type="button"
          title="Visualizar"
          onClick={() => onView(document.id)}
          disabled={isBusy}
          className="rounded-full p-2 text-on-surface-variant transition-all hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="visibility" size={20} />
        </button>
      </div>
    </div>
  )
}
