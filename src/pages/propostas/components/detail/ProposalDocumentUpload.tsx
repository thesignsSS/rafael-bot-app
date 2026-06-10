import { useRef, type ChangeEvent, type DragEvent } from 'react'
import { Icon } from '../../../../components/ui/Icon'

type ProposalDocumentUploadProps = {
  onFilesSelected: (files: File[]) => void
}

export function ProposalDocumentUpload({
  onFilesSelected,
}: ProposalDocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const openFilePicker = () => {
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
        className="sr-only"
        onChange={handleFileChange}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openFilePicker()
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-outline bg-white/50 py-6 transition-colors hover:bg-primary-container/5"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/10 text-primary transition-transform group-hover:scale-110">
          <Icon name="upload_file" size={28} />
        </div>

        <div className="text-center">
          <p className="text-label-md font-bold text-on-surface">
            Clique para enviar novos documentos
          </p>
          <p className="text-body-sm text-on-surface-variant">
            Arraste e solte arquivos PDF, JPG ou PNG
          </p>
        </div>
      </div>
    </div>
  )
}
