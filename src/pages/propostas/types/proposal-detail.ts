import type { PropertyType } from '../../home/types/proposal'

export type ProposalStatus = 'Enviada' | 'Em análise' | 'Finalizada'

export type ProposalDocumentKind = 'pdf' | 'image'

export type ProposalDocument = {
  id: string
  name: string
  kind: ProposalDocumentKind
  sizeBytes: number
  uploadedAt: string
}

export type ProposalDetail = {
  id: string
  status: ProposalStatus
  ownerId: string
  ownerName: string
  createdAt: string
  client: {
    name: string
    cpf: string
    phone: string
  }
  property: {
    type: PropertyType
    location: string
    buildingName: string
  }
  documents: ProposalDocument[]
}
