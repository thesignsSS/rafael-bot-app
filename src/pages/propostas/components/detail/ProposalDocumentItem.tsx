import { Icon } from '../../../../components/ui/Icon'
import {
  formatDocumentDate,
  formatFileSize,
  getDocumentIconStyles,
} from '../../lib/proposalDetailUtils'
import type { ProposalDocument } from '../../types/proposal-detail'

type ProposalDocumentItemProps = {
  document: ProposalDocument
  onRename: (documentId: string) => void
  onDelete: (documentId: string) => void
  onView: (documentId: string) => void
}

export function ProposalDocumentItem({
  document,
  onRename,
  onDelete,
  onView,
}: ProposalDocumentItemProps) {
  const iconStyles = getDocumentIconStyles(document.kind)

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
            {document.name}
          </h4>
          <p className="text-body-sm text-on-surface-variant">
            {formatFileSize(document.sizeBytes)} • Enviado em{' '}
            {formatDocumentDate(document.uploadedAt)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 gap-1 sm:gap-2">
        <button
          type="button"
          title="Renomear"
          onClick={() => onRename(document.id)}
          className="rounded-full p-2 text-on-surface-variant transition-all hover:bg-primary-container/20 hover:text-primary"
        >
          <Icon name="edit" size={20} />
        </button>
        <button
          type="button"
          title="Excluir"
          onClick={() => onDelete(document.id)}
          className="rounded-full p-2 text-on-surface-variant transition-all hover:bg-error-container/40 hover:text-error"
        >
          <Icon name="delete" size={20} />
        </button>
        <button
          type="button"
          title="Visualizar"
          onClick={() => onView(document.id)}
          className="rounded-full p-2 text-on-surface-variant transition-all hover:text-primary"
        >
          <Icon name="visibility" size={20} />
        </button>
      </div>
    </div>
  )
}
