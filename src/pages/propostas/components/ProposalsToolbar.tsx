import { Icon } from '../../../components/ui/Icon'
import type { ProposalsLayout } from '../../../contexts/preferences-context'

type ProposalsToolbarProps = {
  query: string
  totalSent: number
  proposalsLayout: ProposalsLayout
  isAdmin?: boolean
  brokerOptions?: string[]
  selectedBroker?: string
  onQueryChange: (value: string) => void
  onChangeLayout: (layout: ProposalsLayout) => void
  onBrokerChange?: (value: string) => void
}

export function ProposalsToolbar({
  query,
  totalSent,
  proposalsLayout,
  isAdmin = false,
  brokerOptions = [],
  selectedBroker = '',
  onQueryChange,
  onChangeLayout,
  onBrokerChange,
}: ProposalsToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-col gap-3 lg:flex-row">
          <div className="relative w-full">
            <Icon
              name="search"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              type="text"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Filtrar por cliente, corretor ou código da proposta..."
              className="w-full rounded-lg border border-outline-variant bg-surface py-2 pl-10 pr-4 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {isAdmin && onBrokerChange ? (
            <select
              value={selectedBroker}
              onChange={(event) => onBrokerChange(event.target.value)}
              className="min-w-[220px] rounded-lg border border-outline-variant bg-surface px-4 py-2 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Todos os corretores</option>
              {brokerOptions.map((brokerName) => (
                <option key={brokerName} value={brokerName}>
                  {brokerName}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        <div className="inline-flex rounded-xl border border-outline-variant bg-surface-container-low p-1">
          <button
            type="button"
            onClick={() => onChangeLayout('table')}
            className={`rounded-lg px-3 py-2 text-label-sm font-semibold transition-all ${
              proposalsLayout === 'table'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            Tabela
          </button>
          <button
            type="button"
            onClick={() => onChangeLayout('kanban')}
            className={`rounded-lg px-3 py-2 text-label-sm font-semibold transition-all ${
              proposalsLayout === 'kanban'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            Kanban
          </button>
        </div>
      </div>

      <div className="w-fit whitespace-nowrap rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2">
        <span className="text-body-md font-semibold text-on-surface">
          Total enviado:{' '}
          <span className="text-primary">{totalSent}</span>
        </span>
      </div>
    </div>
  )
}
