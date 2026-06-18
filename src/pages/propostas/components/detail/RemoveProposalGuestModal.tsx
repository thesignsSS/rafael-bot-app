import { createPortal } from 'react-dom'

type RemoveProposalGuestModalProps = {
  isOpen: boolean
  guestName: string
  isRemoving: boolean
  onClose: () => void
  onConfirm: () => void
}

export function RemoveProposalGuestModal({
  isOpen,
  guestName,
  isRemoving,
  onClose,
  onConfirm,
}: RemoveProposalGuestModalProps) {
  if (!isOpen) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#131b2e]/55 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-xl rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_20px_40px_rgba(0,0,0,0.18)]">
        <h3 className="text-headline-md font-semibold text-on-surface">
          Remover vínculo do convidado?
        </h3>
        <p className="mt-3 text-body-md text-on-surface-variant">
          <span className="font-semibold text-on-surface">{guestName}</span> perderá o
          acesso a esta proposta e ela deixará de aparecer no kanban desse usuário.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isRemoving}
            className="rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isRemoving}
            className="rounded-lg bg-error px-4 py-2 text-label-md font-semibold text-on-error transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRemoving ? 'Removendo...' : 'Remover vínculo'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
