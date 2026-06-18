import type { PropertyType } from '../../home/types/proposal'
import type { ProposalStatus } from './proposal-status'

export type ProposalDocumentKind = 'pdf' | 'image' | 'text'

export type ProposalCommentType =
  | 'comment'
  | 'pending_reason'
  | 'resubmission'
  | 'audit'

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

export type ProposalGuest = {
  userId: string
  name: string
  joinedAt: string
}

export type ProposalInvitationStatus = 'pending' | 'accepted' | 'rejected'

export type ProposalInvitation = {
  id: string
  proposalId: string
  proposalCode: string
  clientName: string
  inviterUserId: string
  inviterName: string
  ownerBrokerUserId: string
  ownerName: string
  inviteeUserId: string
  inviteeName: string
  status: ProposalInvitationStatus
  createdAt: string
  respondedAt: string | null
}

export type InviteSearchUser = {
  id: string
  fullName: string
  role: 'admin' | 'broker'
  isAdmin: boolean
}

export type ProposalSharePreview = {
  proposalId: string
  proposalCode: string
  clientName: string
  ownerBrokerUserId: string
  ownerName: string
  isOwnedByCurrentUser: boolean
  isAlreadyAttached: boolean
}

export type ProposalShareLinkResponse = {
  token: string
  createdAt: string
}

export type AcceptProposalShareResponse = {
  proposalId: string
  proposalCode: string
  ownerBrokerUserId: string
  ownerName: string
  alreadyAttached: boolean
}

export type ProposalDetail = {
  id: string
  proposalCode: string
  ownerBrokerUserId: string
  ownerName: string
  isOwnedByCurrentUser: boolean
  isSharedWithCurrentUser: boolean
  canDeleteProposal: boolean
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
  guests: ProposalGuest[]
  shareLinkToken: string | null
  pendingInvitations: ProposalInvitation[]
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
