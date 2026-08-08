import type { PropertyKind } from './engenharia'

export type EngenhariaRequestStatus =
  | 'solicitar_engenharia'
  | 'pendencia'
  | 'boleto_enviado'
  | 'ordem_servico'
  | 'engenharia_concluida'

export const ENGENHARIA_REQUEST_STATUS_OPTIONS: {
  value: EngenhariaRequestStatus
  label: string
}[] = [
  { value: 'solicitar_engenharia', label: 'Solicitar Engenharia' },
  { value: 'pendencia', label: 'Pendência' },
  { value: 'boleto_enviado', label: 'Boleto Enviado' },
  { value: 'ordem_servico', label: 'OS (Ordem de Serviço)' },
  { value: 'engenharia_concluida', label: 'Engenharia Concluída' },
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
