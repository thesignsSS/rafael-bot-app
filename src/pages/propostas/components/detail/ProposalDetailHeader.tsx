import { Icon } from '../../../../components/ui/Icon'
import { formatProposalId } from '../../lib/proposalListUtils'

type ProposalDetailHeaderProps = {
  proposalId: string
  ownerName: string
  onBack: () => void
  onDownloadAll: () => void
}

export function ProposalDetailHeader({
  proposalId,
  ownerName,
  onBack,
  onDownloadAll,
}: ProposalDetailHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex flex-col gap-1">
        <div className="mb-2 flex items-center gap-2 text-on-surface-variant">
          <button
            type="button"
            onClick={onBack}
            className="group flex items-center gap-1 text-label-md font-medium transition-colors hover:text-primary"
          >
            <Icon name="arrow_back" size={18} />
            Voltar para listagem
          </button>
        </div>

        <h2 className="text-headline-xl font-bold tracking-tight text-on-surface">
          Proposta {formatProposalId(proposalId)}
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Corretor: <span className="font-medium text-on-surface">{ownerName}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onDownloadAll}
          className="rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low active:scale-95"
        >
          Baixar Tudo (.zip)
        </button>
      </div>
    </div>
  )
}
