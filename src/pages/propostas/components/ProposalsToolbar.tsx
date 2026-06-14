import { Icon } from '../../../components/ui/Icon'

type ProposalsToolbarProps = {
  query: string
  totalSent: number
  onQueryChange: (value: string) => void
}

export function ProposalsToolbar({
  query,
  totalSent,
  onQueryChange,
}: ProposalsToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
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

      <div className="w-fit whitespace-nowrap rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2">
        <span className="text-body-md font-semibold text-on-surface">
          Total enviado:{' '}
          <span className="text-primary">{totalSent}</span>
        </span>
      </div>
    </div>
  )
}
