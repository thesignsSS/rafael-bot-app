import { useRef, type ChangeEvent } from 'react'
import { Icon } from '../../../../components/ui/Icon'

type AttachmentButtonProps = {
  label: string
  file?: File
  onSelect: (file: File) => void
  onRemove: () => void
}

export function AttachmentButton({
  label,
  file,
  onSelect,
  onRemove,
}: AttachmentButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    event.target.value = ''

    if (selectedFile) {
      onSelect(selectedFile)
    }
  }

  if (file) {
    return (
      <div className="inline-flex max-w-full items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2.5 text-label-md font-semibold text-primary">
        <Icon name="task" size={18} />
        <span className="max-w-56 truncate" title={file.name}>
          {file.name}
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remover ${label}`}
          className="text-primary/70 transition-colors hover:text-error"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    )
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="sr-only"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-label-md font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/5"
      >
        <Icon name="upload" size={18} />
        {label}
      </button>
    </>
  )
}
