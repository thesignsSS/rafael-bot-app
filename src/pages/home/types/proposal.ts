export const PROPERTY_TYPE_OPTIONS = [
  'Novo',
  'Usado',
  'Novo e Usado',
  'Adjudicado Caixa',
] as const

export type PropertyType = (typeof PROPERTY_TYPE_OPTIONS)[number]
export type ProposalBank = 'Caixa' | 'Bradesco' | 'Itaú' | 'Santander' | 'Inter' | 'Todos'

export type IbgeCity = {
  id: number
  nome: string
}

export type FormSubmissionDocument = {
  filename: string
  contentBase64: string
}

export type SubmitFormPayload = {
  brokerUserId: string
  brokerName: string
  brokerPhone?: string
  clientName: string
  formData: Record<string, unknown>
  documents: FormSubmissionDocument[]
}

export type SubmitFormResponse = {
  ok: boolean
  proposalId?: string
  proposalCode?: string
  savedClient?: boolean
  uploadedFiles?: number
  locations?: string[]
  error?: string
}
