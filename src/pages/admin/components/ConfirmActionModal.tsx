import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'

type ConfirmActionModalProps = {
  title: string
  description: string
  confirmLabel: string
  isDanger?: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function ConfirmActionModal({
  title,
  description,
  confirmLabel,
  isDanger = false,
  onClose,
  onConfirm,
}: ConfirmActionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleConfirm() {
    if (isSubmitting) {
      return
    }

    try {
      setIsSubmitting(true)
      await onConfirm()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal titleId="confirm-action-title" title={title} onClose={onClose}>
      <p className="text-body-sm text-on-surface-variant">{description}</p>

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-outline px-5 py-2.5 text-label-md font-semibold text-primary transition-colors hover:bg-surface-container"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={isSubmitting}
          className={`rounded-lg px-5 py-2.5 text-label-md font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            isDanger
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-primary text-on-primary hover:bg-primary-container'
          }`}
        >
          {isSubmitting ? 'Aguarde...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
