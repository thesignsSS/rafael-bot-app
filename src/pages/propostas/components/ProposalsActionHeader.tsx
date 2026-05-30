import { Icon } from '../../../components/ui/Icon'

type ProposalsActionHeaderProps = {
  onNewProposal: () => void
}

export function ProposalsActionHeader({ onNewProposal }: ProposalsActionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div className="flex flex-col gap-1">
        <h3 className="text-headline-md font-bold text-on-surface">
          Gerencie suas solicitações
        </h3>
        <p className="text-body-md text-on-surface-variant">
          Acompanhe em tempo real as propostas enviadas.
        </p>
      </div>

      <button
        type="button"
        onClick={onNewProposal}
        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-body-md font-semibold text-on-primary shadow-sm transition-all hover:bg-surface-tint active:scale-95"
      >
        <Icon name="add_circle" size={20} />
        Nova Proposta
      </button>
    </div>
  )
}
