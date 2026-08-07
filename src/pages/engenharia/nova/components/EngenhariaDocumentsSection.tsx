import { AttachmentButton } from './AttachmentButton'
import { ENGENHARIA_DOCUMENT_GROUPS } from '../../types/engenharia'

type EngenhariaDocumentsSectionProps = {
  documents: Partial<Record<string, File>>
  documentsError: string
  onSelectDocument: (key: string, file: File) => void
  onRemoveDocument: (key: string) => void
}

export function EngenhariaDocumentsSection({
  documents,
  documentsError,
  onSelectDocument,
  onRemoveDocument,
}: EngenhariaDocumentsSectionProps) {
  return (
    <div className="mt-8 border-t border-outline-variant pt-6">
      <h3 className="text-label-lg font-bold text-on-surface">
        Documentos para Anexo <span className="text-error">*</span>
      </h3>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Anexe os documentos conforme o tipo de imóvel selecionado.
      </p>

      <div className="mt-4 divide-y divide-outline-variant/60 rounded-lg border border-dashed border-outline-variant p-5">
        {ENGENHARIA_DOCUMENT_GROUPS.map((group, index) => (
          <div key={group.kind} className={index > 0 ? 'pt-5' : ''}>
            <p className="text-label-md font-bold text-on-surface">
              {group.title}
            </p>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              {group.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {group.slots.map((slot) => (
                <AttachmentButton
                  key={slot.key}
                  label={slot.label}
                  file={documents[slot.key]}
                  onSelect={(file) => onSelectDocument(slot.key, file)}
                  onRemove={() => onRemoveDocument(slot.key)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {documentsError ? (
        <p className="mt-2 text-body-sm text-error" role="alert">
          {documentsError}
        </p>
      ) : null}
    </div>
  )
}
