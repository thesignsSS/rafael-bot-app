import type { PropertyKind } from './engenharia'

export type EngenhariaRequestStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export const ENGENHARIA_REQUEST_STATUS_OPTIONS: {
  value: EngenhariaRequestStatus
  label: string
}[] = [
  { value: 'pending', label: 'Pendente' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' },
]

export type EngenhariaRequestListItem = {
  id: string
  requestCode: string
  status: EngenhariaRequestStatus
  statusLabel: string
  ownerBrokerUserId: string
  ownerName: string
  isOwnedByCurrentUser: boolean
  accompanyingName: string
  propertyKind: PropertyKind
  propertyValue: number
  createdAt: string
  documentsCount: number
}

export type EngenhariaRequestComment = {
  id: string
  authorName: string
  authorUserId: string | null
  authorRole: 'admin' | 'broker'
  createdAt: string
  message: string
}

export type EngenhariaRequestDocument = {
  id: string
  documentKey: string
  originalFilename: string
  contentType: string
  sizeBytes: number
  uploadedAt: string
}

export type EngenhariaRequestDetail = {
  id: string
  requestCode: string
  status: EngenhariaRequestStatus
  statusLabel: string
  ownerBrokerUserId: string
  ownerName: string
  isOwnedByCurrentUser: boolean
  canEdit: boolean
  canDelete: boolean
  propertyKind: PropertyKind
  propertyValue: number
  contactPhone: string
  accompanyingName: string
  createdAt: string
  documents: EngenhariaRequestDocument[]
  comments: EngenhariaRequestComment[]
}
