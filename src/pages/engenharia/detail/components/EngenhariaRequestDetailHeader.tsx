import { Icon } from '../../../../components/ui/Icon'
import { EngenhariaStatusBadge } from '../../components/EngenhariaStatusBadge'
import type { EngenhariaRequestDetail } from '../../types/engenhariaRequest'

type EngenhariaRequestDetailHeaderProps = {
  request: EngenhariaRequestDetail
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}

export function EngenhariaRequestDetailHeader({
  request,
  onBack,
  onEdit,
  onDelete,
}: EngenhariaRequestDetailHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onBack}
          className="group flex items-center gap-1 text-label-md font-medium text-on-surface-variant transition-colors hover:text-primary"
        >
          <Icon name="arrow_back" size={18} />
          Voltar para listagem
        </button>

        <div className="flex items-center gap-3">
          <h2 className="text-headline-xl font-bold tracking-tight text-on-surface">
            Solicitação {request.requestCode}
          </h2>
          <EngenhariaStatusBadge
            status={request.status}
            statusLabel={request.statusLabel}
          />
        </div>

        <p className="text-body-md text-on-surface-variant">
          Corretor: <span className="text-on-surface">{request.ownerName}</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        {request.canEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-2 rounded-lg border border-outline px-4 py-2.5 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low"
          >
            <Icon name="edit" size={18} />
            Editar solicitação
          </button>
        ) : null}

        {request.canDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-2 rounded-lg border border-error/40 px-4 py-2.5 text-label-md font-semibold text-error transition-all hover:bg-error/10"
          >
            <Icon name="delete" size={18} />
            Excluir solicitação
          </button>
        ) : null}
      </div>
    </div>
  )
}
