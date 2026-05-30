import { Icon } from '../../../components/ui/Icon'

type ProposalsPaginationProps = {
  visibleCount: number
  totalCount: number
  page: number
  pageNumbers: number[]
  hasPrev: boolean
  hasNext: boolean
  onPrevPage: () => void
  onNextPage: () => void
  onGoToPage: (page: number) => void
}

export function ProposalsPagination({
  visibleCount,
  totalCount,
  page,
  pageNumbers,
  hasPrev,
  hasNext,
  onPrevPage,
  onNextPage,
  onGoToPage,
}: ProposalsPaginationProps) {
  if (totalCount === 0) {
    return null
  }

  return (
    <div className="flex items-center justify-between border-t border-outline-variant bg-surface px-6 py-4">
      <span className="text-body-sm text-on-surface-variant">
        Mostrando {visibleCount} de {totalCount} propostas
      </span>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrevPage}
          disabled={!hasPrev}
          className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Página anterior"
        >
          <Icon name="chevron_left" size={18} />
        </button>

        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onGoToPage(pageNumber)}
            className={`flex h-8 w-8 items-center justify-center rounded text-body-sm font-medium transition-colors ${
              pageNumber === page
                ? 'bg-primary font-bold text-on-primary'
                : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {pageNumber}
          </button>
        ))}

        <button
          type="button"
          onClick={onNextPage}
          disabled={!hasNext}
          className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Próxima página"
        >
          <Icon name="chevron_right" size={18} />
        </button>
      </div>
    </div>
  )
}
