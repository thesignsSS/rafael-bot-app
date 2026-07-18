import type { PropertyType } from '../../home/types/proposal'
import type { ProposalStatus } from './proposal-status'

export type ProposalDocumentFilter = 'with_documents' | 'without_documents'

export type AdvancedProposalFilters = {
  brokerName: string
  clientName: string
  statuses: ProposalStatus[]
  createdFrom: string
  createdTo: string
  propertyTypes: PropertyType[]
  documentFilters: ProposalDocumentFilter[]
}

export const EMPTY_ADVANCED_PROPOSAL_FILTERS: AdvancedProposalFilters = {
  brokerName: '',
  clientName: '',
  statuses: [],
  createdFrom: '',
  createdTo: '',
  propertyTypes: [],
  documentFilters: [],
}

export function countAdvancedProposalFilters(filters: AdvancedProposalFilters) {
  return (
    (filters.brokerName ? 1 : 0) +
    (filters.clientName ? 1 : 0) +
    filters.statuses.length +
    filters.propertyTypes.length +
    filters.documentFilters.length +
    (filters.createdFrom ? 1 : 0) +
    (filters.createdTo ? 1 : 0)
  )
}
