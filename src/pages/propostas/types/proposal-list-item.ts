import type { PropertyType } from '../../home/types/proposal'

export type ProposalListItem = {
  id: string
  clientName: string
  propertyType: PropertyType
  createdAt: string
  ownerId: string
}
