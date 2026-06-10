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
  brokerName: string
  clientName: string
  formData: Record<string, unknown>
  documents: FormSubmissionDocument[]
}

export type SubmitFormResponse = {
  ok: boolean
  uploadedFiles?: number
  locations?: string[]
  error?: string
}
