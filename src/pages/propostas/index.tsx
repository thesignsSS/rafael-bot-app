import { ProposalsActionHeader } from './components/ProposalsActionHeader'
import { ProposalsPagination } from './components/ProposalsPagination'
import { ProposalsTable } from './components/ProposalsTable'
import { ProposalsToolbar } from './components/ProposalsToolbar'
import { useProposalsList } from './hooks/useProposalsList'
import { useProposalsListPage } from './hooks/useProposalsListPage'

export default function PropostasPage() {
  const { goToNewProposal, goToProposalDetail } = useProposalsListPage()
  const list = useProposalsList()

  return (
    <div className="mx-auto max-w-6xl">
      <ProposalsActionHeader onNewProposal={goToNewProposal} />

      <ProposalsToolbar
        query={list.query}
        totalSent={list.totalSent}
        onQueryChange={list.setQuery}
      />

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
        <ProposalsTable
          items={list.items}
          isEmpty={!list.isLoading && list.totalCount === 0}
          isLoading={list.isLoading}
          error={list.error}
          onSelectProposal={goToProposalDetail}
        />
        <ProposalsPagination
          visibleCount={list.visibleCount}
          totalCount={list.totalCount}
          page={list.page}
          pageNumbers={list.pageNumbers}
          hasPrev={list.hasPrev}
          hasNext={list.hasNext}
          onPrevPage={list.prevPage}
          onNextPage={list.nextPage}
          onGoToPage={list.goToPage}
        />
      </div>
    </div>
  )
}
