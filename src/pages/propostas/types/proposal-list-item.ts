import type { PropertyType } from '../../home/types/proposal'
import type { ProposalStatus } from './proposal-status'

export type ProposalListItem = {
  id: string
  proposalCode: string
  ownerBrokerUserId: string
  ownerName: string
  isOwnedByCurrentUser: boolean
  isSharedWithCurrentUser: boolean
  clientName: string
  brokerName: string
  propertyType: PropertyType
  createdAt: string
  documentsCount: number
  status?: ProposalStatus
}

export type ProposalsListResponse = {
  items: ProposalListItem[]
  total: number
  page: number
  pageSize: number
}
