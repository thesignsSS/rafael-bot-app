import { Icon } from '../../../../components/ui/Icon'
import { formatProposalId } from '../../lib/proposalListUtils'
import type { ProposalStatus } from '../../types/proposal-detail'
import { ProposalStatusBadge } from './ProposalStatusBadge'

type ProposalDetailHeaderProps = {
  proposalId: string
  status: ProposalStatus
  onBack: () => void
  onDownloadAll: () => void
  onFinalizeAnalysis: () => void
}

export function ProposalDetailHeader({
  proposalId,
  status,
  onBack,
  onDownloadAll,
  onFinalizeAnalysis,
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

        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-headline-xl font-bold tracking-tight text-on-surface">
            Proposta {formatProposalId(proposalId)}
          </h2>
          <ProposalStatusBadge status={status} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onDownloadAll}
          className="rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low active:scale-95"
        >
          Baixar Tudo (.zip)
        </button>
        <button
          type="button"
          onClick={onFinalizeAnalysis}
          className="rounded-lg bg-primary px-6 py-2 text-label-md font-semibold text-on-primary transition-all hover:shadow-lg active:scale-95"
        >
          Finalizar Análise
        </button>
      </div>
    </div>
  )
}
