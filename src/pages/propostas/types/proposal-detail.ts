import type { PropertyType } from '../../home/types/proposal'
import type { ProposalStatus } from './proposal-status'

export type ProposalDocumentKind = 'pdf' | 'image' | 'text'

export type ProposalCommentType = 'comment' | 'pending_reason' | 'resubmission'

export type ProposalComment = {
  id: string
  authorName: string
  authorRole: 'admin' | 'broker'
  createdAt: string
  message: string
  type: ProposalCommentType
}

export type ProposalDocument = {
  id: string
  filename: string
  originalFilename: string
  displayName?: string
  contentType: string
  sizeBytes: number
  uploadedAt: string
  uploadedByUserId?: string | null
  uploadedByName?: string
  isUploadedByProposalOwner?: boolean
  storageLocation: string
}

export type ProposalDetail = {
  id: string
  proposalCode: string
  brokerName: string
  brokerPhone: string
  createdAt: string
  status?: ProposalStatus
  pendingReason: string
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
  comments: ProposalComment[]
  documents: ProposalDocument[]
}

export type UpdateProposalPayload = {
  brokerUserId: string
  brokerPhone: string
  clientName: string
  clientCpf: string
  clientEmail: string
  clientPhone: string
  propertyType: PropertyType
  propertyCity: string
  propertyState: string
  additionalInfo: string
  commentMessage?: string
  formData: Record<string, unknown>
}

export type UpdateProposalStatusPayload = {
  brokerUserId: string
  status: ProposalStatus
  pendingReason?: string
  commentMessage?: string
}

export type ViewProposalDocumentResponse = {
  ok: boolean
  url: string
  filename: string
}
