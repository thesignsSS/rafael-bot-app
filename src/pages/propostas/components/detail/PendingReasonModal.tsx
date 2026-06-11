type PendingReasonModalProps = {
  isOpen: boolean
  isSaving: boolean
  value: string
  onChange: (value: string) => void
  onClose: () => void
  onConfirm: () => void
}

export function PendingReasonModal({
  isOpen,
  isSaving,
  value,
  onChange,
  onClose,
  onConfirm,
}: PendingReasonModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#131b2e]/55 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-xl rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_20px_40px_rgba(0,0,0,0.18)]">
        <h3 className="text-headline-md font-semibold text-on-surface">
          Motivo da pendência
        </h3>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Explique o que está faltando ou o que precisa ser ajustado para o
          corretor reenviar a proposta.
        </p>

        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={6}
          disabled={isSaving}
          className="mt-5 w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Descreva o motivo da pendência..."
        />

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSaving}
            className="rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Enviar para pendente'}
          </button>
        </div>
      </div>
    </div>
  )
}
