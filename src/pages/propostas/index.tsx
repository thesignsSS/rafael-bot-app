import { useMemo, useState } from 'react'
import { PendingReasonModal } from './components/detail/PendingReasonModal'
import { ProposalsActionHeader } from './components/ProposalsActionHeader'
import { ProposalsKanbanBoard } from './components/ProposalsKanbanBoard'
import { ProposalsToolbar } from './components/ProposalsToolbar'
import { useProposalsList } from './hooks/useProposalsList'
import { useProposalsListPage } from './hooks/useProposalsListPage'
import { useAuth } from '../../contexts/auth-context'
import { usePreferences } from '../../contexts/preferences-context'
import { ProposalsTable } from './components/ProposalsTable'

export default function PropostasPage() {
  const { isAdmin } = useAuth()
  const { preferences, updatePreferences } = usePreferences()
  const { goToNewProposal, goToProposalDetail } = useProposalsListPage()
  const list = useProposalsList()
  const [selectedBroker, setSelectedBroker] = useState('')

  const brokerOptions = useMemo(
    () =>
      Array.from(
        new Set(
          list.items
            .map((item) => item.brokerName.trim())
            .filter(Boolean),
        ),
      ).sort((first, second) => first.localeCompare(second, 'pt-BR')),
    [list.items],
  )

  const filteredItems = useMemo(() => {
    if (!isAdmin || !selectedBroker) {
      return list.items
    }

    return list.items.filter((item) => item.brokerName === selectedBroker)
  }, [isAdmin, list.items, selectedBroker])

  const isFilteredEmpty = !list.isLoading && filteredItems.length === 0

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
        proposalsLayout={preferences.proposalsLayout}
        isAdmin={isAdmin}
        brokerOptions={brokerOptions}
        selectedBroker={selectedBroker}
        onQueryChange={list.setQuery}
        onChangeLayout={(layout) =>
          updatePreferences({ proposalsLayout: layout })
        }
        onBrokerChange={setSelectedBroker}
      />

      {preferences.proposalsLayout === 'table' ? (
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
          <ProposalsTable
            items={filteredItems}
            isEmpty={isFilteredEmpty}
            isLoading={list.isLoading}
            error={list.error}
            onSelectProposal={goToProposalDetail}
          />
        </div>
      ) : (
        <ProposalsKanbanBoard
          items={filteredItems}
          isEmpty={isFilteredEmpty}
          isLoading={list.isLoading}
          error={list.error}
          canMoveCards={isAdmin}
          highlightOwnedPendingCards={!isAdmin}
          statusOptions={list.statusOptions}
          movingProposalId={list.movingProposalId}
          onSelectProposal={goToProposalDetail}
          onMoveProposal={list.moveProposal}
        />
      )}
    </div>
  )
}
