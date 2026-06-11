export type PropertyType = 'Novo' | 'Usado'

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
