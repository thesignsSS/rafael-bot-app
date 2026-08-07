import { createPortal } from 'react-dom'

type DeleteEngenhariaRequestModalProps = {
  isOpen: boolean
  isDeleting: boolean
  requestCode: string
  onClose: () => void
  onConfirm: () => void
}

export function DeleteEngenhariaRequestModal({
  isOpen,
  isDeleting,
  requestCode,
  onClose,
  onConfirm,
}: DeleteEngenhariaRequestModalProps) {
  if (!isOpen) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#131b2e]/55 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-xl rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_20px_40px_rgba(0,0,0,0.18)]">
        <h3 className="text-headline-md font-semibold text-on-surface">
          Excluir solicitação permanentemente?
        </h3>
        <p className="mt-3 text-body-md text-on-surface-variant">
          A solicitação{' '}
          <span className="font-semibold text-on-surface">{requestCode}</span> e todos
          os documentos anexados a ela serão excluídos permanentemente.
        </p>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Essa ação não pode ser desfeita.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-error px-4 py-2 text-label-md font-semibold text-on-error transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? 'Excluindo...' : 'Excluir solicitação'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
