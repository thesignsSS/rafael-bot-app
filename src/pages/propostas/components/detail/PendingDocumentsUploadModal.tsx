import { useMemo, useState, type DragEvent } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../../../../components/ui/Icon'

type PendingDocumentsUploadModalProps = {
  isOpen: boolean
  isSaving: boolean
  onClose: () => void
  onSave: (files: File[]) => void | Promise<void>
}

const supportedExtensions = ['PDF', 'JPG', 'JPEG', 'PNG']

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`
}

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

export function PendingDocumentsUploadModal({
  isOpen,
  isSaving,
  onClose,
  onSave,
}: PendingDocumentsUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const fileCountLabel = useMemo(() => {
    if (selectedFiles.length === 1) {
      return '1 arquivo selecionado'
    }

    return `${selectedFiles.length} arquivos selecionados`
  }, [selectedFiles.length])

  if (!isOpen) {
    return null
  }

  const addFiles = (files: File[]) => {
    setSelectedFiles((currentFiles) => {
      const currentKeys = new Set(currentFiles.map(fileKey))
      const nextFiles = files.filter((file) => !currentKeys.has(fileKey(file)))
      return [...currentFiles, ...nextFiles]
    })
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    addFiles(Array.from(event.dataTransfer.files ?? []))
  }

  const removeFile = (targetFile: File) => {
    setSelectedFiles((currentFiles) =>
      currentFiles.filter((file) => fileKey(file) !== fileKey(targetFile)),
    )
  }

  const handleClose = () => {
    if (isSaving) {
      return
    }

    setSelectedFiles([])
    setIsDragging(false)
    onClose()
  }

  const handleSave = async () => {
    if (selectedFiles.length === 0) {
      return
    }

    await onSave(selectedFiles)
    setSelectedFiles([])
    setIsDragging(false)
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#131b2e]/55 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-2xl rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_20px_40px_rgba(0,0,0,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-headline-md font-semibold text-on-surface">
              Enviar documentação pendente
            </h3>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Adicione os arquivos que faltavam e confirme para deixá-los
              prontos na aba de comentários antes do reenvio.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="rounded-lg border border-outline px-3 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
          >
            Fechar
          </button>
        </div>

        <label
          className={`mt-5 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-blue-50'
              : 'border-outline-variant bg-white hover:border-primary/60 hover:bg-primary-container/5'
          }`}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={isSaving}
            className="sr-only"
            onChange={(event) => {
              addFiles(Array.from(event.target.files ?? []))
              event.target.value = ''
            }}
          />

          <div
            onDragEnter={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={(event) => {
              event.preventDefault()
              if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
                return
              }
              setIsDragging(false)
            }}
            onDrop={handleDrop}
            className="flex w-full flex-col items-center justify-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-primary">
              <Icon name="upload_file" size={30} />
            </div>
            <p className="mt-4 text-label-md font-semibold text-on-surface">
              Arraste e solte os documentos aqui
            </p>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              ou clique para selecionar varios arquivos
            </p>
            <p className="mt-3 text-body-sm text-outline">
              {supportedExtensions.join(', ')}
            </p>
          </div>
        </label>

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-body-sm text-on-surface-variant">
            {selectedFiles.length > 0
              ? fileCountLabel
              : 'Nenhum arquivo selecionado ainda.'}
          </p>
        </div>

        {selectedFiles.length > 0 ? (
          <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
            {selectedFiles.map((file) => (
              <div
                key={fileKey(file)}
                className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant bg-white px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-label-md font-semibold text-on-surface">
                    {file.name}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeFile(file)}
                  disabled={isSaving}
                  className="rounded-lg border border-outline px-3 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || selectedFiles.length === 0}
            className="rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Adicionar à pendência'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
