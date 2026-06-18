import { Icon } from '../../../../components/ui/Icon'
type ProposalDetailHeaderProps = {
  proposalCode: string
  brokerName: string
  ownerName: string
  isOwnedByCurrentUser: boolean
  isSharedWithCurrentUser: boolean
  canDeleteProposal: boolean
  canShareProposal: boolean
  onBack: () => void
  onEdit: () => void
  onDownloadAll: () => void
  onShare: () => void
  onDelete: () => void
  isSharing: boolean
  isDeleting: boolean
}

export function ProposalDetailHeader({
  proposalCode,
  brokerName,
  ownerName,
  isOwnedByCurrentUser,
  isSharedWithCurrentUser,
  canDeleteProposal,
  canShareProposal,
  onBack,
  onEdit,
  onDownloadAll,
  onShare,
  onDelete,
  isSharing,
  isDeleting,
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
          Proposta {proposalCode}
        </h2>
        <p className="text-body-md text-on-surface-variant">
          {isSharedWithCurrentUser ? 'Dono da proposta' : 'Corretor responsável'}:{' '}
          <span className="font-medium text-on-surface">{ownerName}</span>
        </p>
        {isSharedWithCurrentUser ? (
          <p className="text-body-sm text-on-surface-variant">
            Você está atuando como convidado nesta proposta.
          </p>
        ) : null}
        {!isOwnedByCurrentUser && !isSharedWithCurrentUser ? (
          <p className="text-body-sm text-on-surface-variant">
            Visualização administrativa de {brokerName}.
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low active:scale-95"
        >
          Editar proposta
        </button>
        <button
          type="button"
          onClick={onDownloadAll}
          className="rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low active:scale-95"
        >
          Baixar Tudo (.zip)
        </button>
        {canShareProposal ? (
          <button
            type="button"
            onClick={onShare}
            disabled={isSharing}
            className="rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSharing ? 'Gerando link...' : 'Compartilhar proposta'}
          </button>
        ) : null}
        {canDeleteProposal ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="rounded-lg border border-error/40 px-4 py-2 text-label-md font-semibold text-error transition-all hover:bg-error/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? 'Excluindo...' : 'Excluir proposta'}
          </button>
        ) : null}
      </div>
    </div>
  )
}
