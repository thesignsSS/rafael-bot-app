import { PendingReasonModal } from './components/detail/PendingReasonModal'
import { ProposalsActionHeader } from './components/ProposalsActionHeader'
import { ProposalsKanbanBoard } from './components/ProposalsKanbanBoard'
import { ProposalsToolbar } from './components/ProposalsToolbar'
import { useProposalsList } from './hooks/useProposalsList'
import { useProposalsListPage } from './hooks/useProposalsListPage'
import { useAuth } from '../../contexts/auth-context'

export default function PropostasPage() {
  const { isAdmin } = useAuth()
  const { goToNewProposal, goToProposalDetail } = useProposalsListPage()
  const list = useProposalsList()

  return (
    <div className="mx-auto max-w-6xl">
      <PendingReasonModal
        isOpen={list.isPendingReasonModalOpen}
        isSaving={Boolean(list.movingProposalId)}
        value={list.pendingReasonDraft}
        onChange={list.setPendingReasonDraft}
        onClose={list.closePendingReasonModal}
        onConfirm={list.confirmPendingReasonMove}
      />

      <ProposalsActionHeader onNewProposal={goToNewProposal} />

      <ProposalsToolbar
        query={list.query}
        totalSent={list.totalSent}
        onQueryChange={list.setQuery}
      />

      <ProposalsKanbanBoard
        items={list.items}
        isEmpty={!list.isLoading && list.totalCount === 0}
        isLoading={list.isLoading}
        error={list.error}
        canMoveCards={isAdmin}
        highlightOwnedPendingCards={!isAdmin}
        statusOptions={list.statusOptions}
        movingProposalId={list.movingProposalId}
        onSelectProposal={goToProposalDetail}
        onMoveProposal={list.moveProposal}
      />
    </div>
  )
}
