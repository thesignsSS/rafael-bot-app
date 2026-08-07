import { Icon } from '../../../components/ui/Icon'

type EngenhariaRequestsActionHeaderProps = {
  isAdmin: boolean
  onNewRequest: () => void
}

export function EngenhariaRequestsActionHeader({
  isAdmin,
  onNewRequest,
}: EngenhariaRequestsActionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div className="flex flex-col gap-1">
        <h3 className="text-headline-md font-bold text-on-surface">
          {isAdmin
            ? 'Todas as solicitações de engenharia'
            : 'Suas solicitações de engenharia'}
        </h3>
        <p className="text-body-md text-on-surface-variant">
          Acompanhe o andamento das análises de engenharia solicitadas.
        </p>
      </div>

      <button
        type="button"
        onClick={onNewRequest}
        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-body-md font-semibold text-on-primary shadow-sm transition-all hover:bg-surface-tint active:scale-95"
      >
        <Icon name="add_circle" size={20} />
        Nova Solicitação
      </button>
    </div>
  )
}
