import { createPortal } from 'react-dom'
import type { ProposalSharePreview } from '../../types/proposal-detail'

type ProposalShareAcceptModalProps = {
  isOpen: boolean
  preview: ProposalSharePreview
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ProposalShareAcceptModal({
  isOpen,
  preview,
  isSubmitting,
  onClose,
  onConfirm,
}: ProposalShareAcceptModalProps) {
  if (!isOpen) {
    return null
  }

  const isAlreadyLinked = preview.isOwnedByCurrentUser || preview.isAlreadyAttached

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#131b2e]/55 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-xl rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_20px_40px_rgba(0,0,0,0.18)]">
        <h3 className="text-headline-md font-semibold text-on-surface">
          {isAlreadyLinked
            ? 'Acesso à proposta identificado'
            : 'Vincular proposta à sua conta?'}
        </h3>

        <div className="mt-4 rounded-xl border border-outline-variant bg-surface-container-low p-4">
          <p className="text-label-md font-semibold text-primary">
            Proposta {preview.proposalCode}
          </p>
          <p className="mt-2 text-body-md text-on-surface">
            Cliente: <span className="font-medium">{preview.clientName}</span>
          </p>
          <p className="mt-1 text-body-md text-on-surface">
            Dono da proposta: <span className="font-medium">{preview.ownerName}</span>
          </p>
        </div>

        <p className="mt-4 text-body-md text-on-surface-variant">
          {preview.isOwnedByCurrentUser
            ? 'Essa proposta já pertence a você.'
            : preview.isAlreadyAttached
              ? 'Essa proposta já está vinculada à sua conta e aparece no seu kanban.'
              : 'Ao confirmar, ela vai aparecer no seu kanban e você poderá editar, enviar documentos e acompanhar a tratativa. A exclusão continua restrita ao dono.'}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAlreadyLinked ? 'Voltar' : 'Agora não'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? 'Confirmando...'
              : isAlreadyLinked
                ? 'Abrir proposta'
                : 'Vincular proposta'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
