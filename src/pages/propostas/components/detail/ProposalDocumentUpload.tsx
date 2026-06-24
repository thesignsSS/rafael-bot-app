import { useRef, type ChangeEvent, type DragEvent } from 'react'
import { Icon } from '../../../../components/ui/Icon'

type ProposalDocumentUploadProps = {
  isBusy?: boolean
  canUpload?: boolean
  onFilesSelected: (files: File[]) => void
}

export function ProposalDocumentUpload({
  isBusy = false,
  canUpload = true,
  onFilesSelected,
}: ProposalDocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const openFilePicker = () => {
    if (isBusy || !canUpload) {
      return
    }

    inputRef.current?.click()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles)
    }
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    if (isBusy || !canUpload) {
      return
    }

    const files = Array.from(event.dataTransfer.files)

    if (files.length > 0) {
      onFilesSelected(files)
    }
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  return (
    <div className="border-t border-dashed border-outline-variant bg-surface-container/30 p-6 sm:p-8">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple
        disabled={isBusy || !canUpload}
        className="sr-only"
        onChange={handleFileChange}
      />

      <div
        role="button"
        tabIndex={canUpload ? 0 : -1}
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (!canUpload) {
            return
          }
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openFilePicker()
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`group flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-outline bg-surface-container-lowest/70 py-6 transition-colors ${
          canUpload ? 'hover:bg-primary-container/5' : ''
        } ${
          isBusy ? 'cursor-wait opacity-60' : canUpload ? 'cursor-pointer' : 'cursor-default opacity-70'
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/10 text-primary transition-transform group-hover:scale-110">
          <Icon name="upload_file" size={28} />
        </div>

        <div className="text-center">
          <p className="text-label-md font-bold text-on-surface">
            {isBusy
              ? 'Enviando documentos...'
              : canUpload
              ? 'Clique para enviar novos documentos'
              : 'Envio bloqueado para corretor após aprovação'}
          </p>
          <p className="text-body-sm text-on-surface-variant">
            {canUpload
              ? 'Arraste e solte arquivos PDF, JPG ou PNG'
              : 'Somente administradores podem alterar documentos nesta etapa'}
          </p>
        </div>
      </div>
    </div>
  )
}
