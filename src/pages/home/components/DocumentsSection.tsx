import { useState, type ChangeEvent, type DragEvent } from 'react'
import { Icon } from '../../../components/ui/Icon'
import {
  fileKey,
  formatFileSize,
  supportedFileExtensions,
  supportedFileExtensionsLabel,
} from '../lib/proposalUtils'
import { FormSection } from './FormSection'

type DocumentsSectionProps = {
  extraFiles: File[]
  onExtraFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onExtraFilesDrop: (files: File[]) => void
  onRemoveExtraFile: (file: File) => void
}

export function DocumentsSection({
  extraFiles,
  onExtraFileChange,
  onExtraFilesDrop,
  onRemoveExtraFile,
}: DocumentsSectionProps) {
  const [isDraggingFiles, setIsDraggingFiles] = useState(false)

  const handleDragEnter = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDraggingFiles(true)
  }

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    setIsDraggingFiles(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()

    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return
    }

    setIsDraggingFiles(false)
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDraggingFiles(false)
    onExtraFilesDrop(Array.from(event.dataTransfer.files ?? []))
  }

  return (
    <FormSection
      icon="drive_folder_upload"
      title="Documentos da Proposta"
      description="Anexe pelo menos um documento para enviar a proposta"
    >
      <label
        htmlFor="extra-documents"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-8 text-center transition-colors ${
          isDraggingFiles
            ? 'border-primary bg-blue-50'
            : 'border-primary/30 bg-[#fbfcff] hover:border-primary hover:bg-blue-50/50'
        }`}
      >
        <Icon
          name={isDraggingFiles ? 'file_download_done' : 'cloud_upload'}
          size={42}
          className="text-primary"
        />
        <span className="mt-3 text-label-md font-bold">
          {isDraggingFiles
            ? 'Solte os arquivos para adicionar'
            : 'Arraste e solte os arquivos aqui'}
        </span>
        <span className="mt-1 text-body-md text-on-surface-variant">
          ou clique para selecionar
        </span>
        <span className="mt-3 text-body-sm text-outline">
          {supportedFileExtensionsLabel}
        </span>
        {extraFiles.length > 0 ? (
          <span className="mt-3 text-label-sm font-semibold text-primary">
            {extraFiles.length} arquivo(s) selecionado(s)
          </span>
        ) : null}
      </label>
      <input
        id="extra-documents"
        type="file"
        multiple
        accept={supportedFileExtensions
          .map((extension) => `.${extension}`)
          .join(',')}
        className="sr-only"
        onChange={onExtraFileChange}
      />
      {extraFiles.length > 0 ? (
        <div className="mt-5 space-y-3">
          {extraFiles.map((file) => (
            <div
              key={fileKey(file)}
              className="flex flex-col gap-3 rounded-lg border border-outline-variant/70 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary">
                  <Icon name="draft" size={22} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-label-md font-semibold text-on-surface">
                    {file.name}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveExtraFile(file)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-error/25 px-3 text-label-md font-semibold text-error transition-colors hover:bg-error-container"
                aria-label={`Remover ${file.name}`}
              >
                <Icon name="delete" size={18} />
                Remover
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </FormSection>
  )
}
