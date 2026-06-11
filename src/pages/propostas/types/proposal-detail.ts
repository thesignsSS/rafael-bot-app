import type { PropertyType } from '../../home/types/proposal'

export type ProposalDocumentKind = 'pdf' | 'image'

export type ProposalDocument = {
  id: string
  filename: string
  originalFilename: string
  displayName?: string
  contentType: string
  sizeBytes: number
  uploadedAt: string
  storageLocation: string
}

export type ProposalDetail = {
  id: string
  proposalCode: string
  brokerName: string
  createdAt: string
  client: {
    name: string
    cpf: string
    phone: string
    email: string
  }
  property: {
    type: PropertyType
    city: string
    state: string
  }
  additionalInfo: string
  formData: Record<string, unknown>
  documents: ProposalDocument[]
}

export type UpdateProposalPayload = {
  brokerUserId: string
  clientName: string
  clientCpf: string
  clientEmail: string
  clientPhone: string
  propertyType: PropertyType
  propertyCity: string
  propertyState: string
  additionalInfo: string
  formData: Record<string, unknown>
}

export type ViewProposalDocumentResponse = {
  ok: boolean
  url: string
  filename: string
}
