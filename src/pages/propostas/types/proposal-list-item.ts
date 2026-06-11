import type { PropertyType } from '../../home/types/proposal'

export type ProposalListItem = {
  id: string
  proposalCode: string
  clientName: string
  brokerName: string
  propertyType: PropertyType
  createdAt: string
  documentsCount: number
}

export type ProposalsListResponse = {
  items: ProposalListItem[]
  total: number
  page: number
  pageSize: number
}
