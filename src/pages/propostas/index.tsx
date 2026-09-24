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
import { AdvancedProposalFiltersModal } from './components/AdvancedProposalFiltersModal'
import { PROPERTY_TYPE_OPTIONS } from '../home/types/proposal'
import {
  countAdvancedProposalFilters,
  EMPTY_ADVANCED_PROPOSAL_FILTERS,
  type AdvancedProposalFilters,
} from './types/advanced-proposal-filters'
import {
  normalizeProposalStatus,
  type ProposalStatus,
} from './types/proposal-status'

export default function PropostasPage() {
  const { isAdmin } = useAuth()
  const { preferences, updatePreferences } = usePreferences()
  const { goToNewProposal, goToProposalDetail } = useProposalsListPage()
  const list = useProposalsList()
  const [selectedBroker, setSelectedBroker] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ProposalStatus | ''>('')
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedProposalFilters>({
    ...EMPTY_ADVANCED_PROPOSAL_FILTERS,
  })

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

  const clientsByBroker = useMemo(() => {
    const groupedClients = new Map<string, Set<string>>()

    list.items.forEach((item) => {
      const brokerName = item.brokerName.trim()
      const clientName = item.clientName.trim()

      if (!brokerName || !clientName) {
        return
      }

      const clients = groupedClients.get(brokerName) ?? new Set<string>()
      clients.add(clientName)
      groupedClients.set(brokerName, clients)
    })

    return Object.fromEntries(
      Array.from(groupedClients.entries()).map(([brokerName, clients]) => [
        brokerName,
        Array.from(clients).sort((first, second) =>
          first.localeCompare(second, 'pt-BR'),
        ),
      ]),
    )
  }, [list.items])

  const filteredItems = useMemo(() => {
    const createdFrom = advancedFilters.createdFrom
      ? new Date(`${advancedFilters.createdFrom}T00:00:00`).getTime()
      : null
    const createdTo = advancedFilters.createdTo
      ? new Date(`${advancedFilters.createdTo}T23:59:59.999`).getTime()
      : null

    return list.items.filter((item) => {
      const normalizedStatus = normalizeProposalStatus(item.status)
      const createdAt = new Date(item.createdAt).getTime()
      const documentFilter =
        item.documentsCount > 0 ? 'with_documents' : 'without_documents'
      const matchesBroker =
        !isAdmin || !selectedBroker || item.brokerName === selectedBroker
      const matchesStatus =
        !selectedStatus || normalizedStatus === selectedStatus
      const matchesAdvancedBroker =
        !advancedFilters.brokerName ||
        advancedFilters.brokerName === item.brokerName
      const matchesClient =
        !advancedFilters.clientName ||
        advancedFilters.clientName === item.clientName
      const matchesAdvancedStatus =
        advancedFilters.statuses.length === 0 ||
        advancedFilters.statuses.includes(normalizedStatus)
      const matchesPropertyType =
        advancedFilters.propertyTypes.length === 0 ||
        advancedFilters.propertyTypes.includes(item.propertyType)
      const matchesDocuments =
        advancedFilters.documentFilters.length === 0 ||
        advancedFilters.documentFilters.includes(documentFilter)
      const matchesCreatedFrom =
        createdFrom === null || (!Number.isNaN(createdAt) && createdAt >= createdFrom)
      const matchesCreatedTo =
        createdTo === null || (!Number.isNaN(createdAt) && createdAt <= createdTo)

      return (
        matchesBroker &&
        matchesStatus &&
        matchesAdvancedBroker &&
        matchesClient &&
        matchesAdvancedStatus &&
        matchesPropertyType &&
        matchesDocuments &&
        matchesCreatedFrom &&
        matchesCreatedTo
      )
    })
  }, [advancedFilters, isAdmin, list.items, selectedBroker, selectedStatus])

  const visibleKanbanStatusOptions = useMemo(
    () => {
      const visibleStatuses = selectedStatus
        ? [selectedStatus]
        : advancedFilters.statuses

      return visibleStatuses.length > 0
        ? list.statusOptions.filter((option) => visibleStatuses.includes(option.value))
        : list.statusOptions
    },
    [advancedFilters.statuses, list.statusOptions, selectedStatus],
  )

  const advancedFiltersCount = countAdvancedProposalFilters(advancedFilters)

  const handleStatusChange = (status: ProposalStatus | '') => {
    setSelectedStatus(status)
    setAdvancedFilters((currentFilters) => ({
      ...currentFilters,
      statuses: [],
    }))
  }

  const handleBrokerChange = (brokerName: string) => {
    setSelectedBroker(brokerName)
    setAdvancedFilters((currentFilters) => ({
      ...currentFilters,
      brokerName: '',
      clientName: '',
    }))
  }

  const applyAdvancedFilters = (filters: AdvancedProposalFilters) => {
    setAdvancedFilters(filters)
    setSelectedStatus('')
    setSelectedBroker('')
    setIsAdvancedFiltersOpen(false)
  }

  const isFilteredEmpty = !list.isLoading && filteredItems.length === 0

  return (
    <div className="mx-auto max-w-[1600px]">
      <PendingReasonModal
        isOpen={list.isPendingReasonModalOpen}
        isSaving={Boolean(list.movingProposalId)}
        value={list.pendingReasonDraft}
        onChange={list.setPendingReasonDraft}
        onClose={list.closePendingReasonModal}
        onConfirm={list.confirmPendingReasonMove}
      />

      <AdvancedProposalFiltersModal
        isOpen={isAdvancedFiltersOpen}
        value={advancedFilters}
        brokerOptions={brokerOptions}
        clientsByBroker={clientsByBroker}
        statusOptions={list.statusOptions}
        propertyTypeOptions={[...PROPERTY_TYPE_OPTIONS]}
        onClose={() => setIsAdvancedFiltersOpen(false)}
        onApply={applyAdvancedFilters}
      />

      <ProposalsActionHeader onNewProposal={goToNewProposal} />

      <ProposalsToolbar
        query={list.query}
        totalSent={list.totalSent}
        proposalsLayout={preferences.proposalsLayout}
        isAdmin={isAdmin}
        brokerOptions={brokerOptions}
        selectedBroker={selectedBroker}
        statusOptions={list.statusOptions}
        selectedStatus={selectedStatus}
        advancedFiltersCount={advancedFiltersCount}
        onQueryChange={list.setQuery}
        onChangeLayout={(layout) =>
          updatePreferences({ proposalsLayout: layout })
        }
        onBrokerChange={handleBrokerChange}
        onStatusChange={handleStatusChange}
        onOpenAdvancedFilters={() => setIsAdvancedFiltersOpen(true)}
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
          statusOptions={visibleKanbanStatusOptions}
          movingProposalId={list.movingProposalId}
          onSelectProposal={goToProposalDetail}
          onMoveProposal={list.moveProposal}
        />
      )}
    </div>
  )
}
