import { Icon } from '../../../../components/ui/Icon'
import type { ProposalDocument } from '../../types/proposal-detail'
import { ProposalDocumentItem } from './ProposalDocumentItem'
import { ProposalDocumentUpload } from './ProposalDocumentUpload'

type ProposalDocumentsSectionProps = {
  documents: ProposalDocument[]
  isBusy?: boolean
  onRename: (documentId: string) => void
  onDownload: (documentId: string) => void
  onDelete: (documentId: string) => void
  onView: (documentId: string) => void
  onViewAll: () => void
  onFilesSelected: (files: File[]) => void
}

export function ProposalDocumentsSection({
  documents,
  isBusy = false,
  onRename,
  onDownload,
  onDelete,
  onView,
  onViewAll,
  onFilesSelected,
}: ProposalDocumentsSectionProps) {
  const fileLabel = documents.length === 1 ? '1 Arquivo' : `${documents.length} Arquivos`

  return (
    <section className="h-fit rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between border-b border-outline-variant p-6">
        <div className="flex items-center gap-2 text-primary">
          <Icon name="folder_shared" size={22} />
          <h3 className="text-headline-md font-semibold text-on-surface">
            Documentos Enviados
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {documents.length > 0 ? (
            <button
              type="button"
              onClick={onViewAll}
              disabled={isBusy}
              className="rounded-lg border border-outline px-3 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
            >
              Ver todos
            </button>
          ) : null}
          <span className="rounded bg-surface-container-high px-2 py-1 text-label-sm font-medium text-on-surface-variant">
            {fileLabel}
          </span>
        </div>
      </div>

      {documents.length > 0 ? (
        <div className="divide-y divide-outline-variant">
          {documents.map((document) => (
            <ProposalDocumentItem
              key={document.id}
              document={document}
              isBusy={isBusy}
              onRename={onRename}
              onDownload={onDownload}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      ) : (
        <div className="px-6 py-10 text-center text-body-md text-on-surface-variant">
          Nenhum documento enviado ainda.
        </div>
      )}

      <ProposalDocumentUpload isBusy={isBusy} onFilesSelected={onFilesSelected} />
    </section>
  )
}
