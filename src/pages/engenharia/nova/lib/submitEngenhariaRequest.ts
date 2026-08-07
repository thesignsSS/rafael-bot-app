import type { PropertyKind } from '../../types/engenharia'

const formSubmissionApiUrl = import.meta.env.VITE_FORM_SUBMISSION_API_URL
const formSubmissionApiKey = import.meta.env.VITE_FORM_SUBMISSION_API_KEY

export type EngenhariaSubmissionDocument = {
  documentKey: string
  filename: string
  contentBase64: string
}

export type SubmitEngenhariaRequestPayload = {
  brokerUserId: string
  brokerName: string
  propertyKind: PropertyKind
  propertyValue: number
  contactPhone: string
  accompanyingName: string
  documents: EngenhariaSubmissionDocument[]
}

export type SubmitEngenhariaRequestResponse = {
  ok: boolean
  requestId?: string
  requestCode?: string
  uploadedFiles?: number
  locations?: string[]
  error?: string
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = String(reader.result)
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve(base64)
    }

    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export async function documentsToSubmissionPayload(
  documents: Partial<Record<string, File>>,
): Promise<EngenhariaSubmissionDocument[]> {
  const entries = Object.entries(documents).filter(
    (entry): entry is [string, File] => Boolean(entry[1]),
  )

  return Promise.all(
    entries.map(async ([documentKey, file]) => ({
      documentKey,
      filename: file.name,
      contentBase64: await fileToBase64(file),
    })),
  )
}

function getEngenhariaRequestApiUrl() {
  if (!formSubmissionApiUrl) {
    throw new Error('URL de envio do formulário não configurada.')
  }

  return formSubmissionApiUrl.replace(
    /\/form-submissions\/?$/,
    '/engineering-requests',
  )
}

export async function submitEngenhariaRequest(
  payload: SubmitEngenhariaRequestPayload,
): Promise<SubmitEngenhariaRequestResponse> {
  if (!formSubmissionApiKey) {
    throw new Error('Chave de API de envio do formulário não configurada.')
  }

  const response = await fetch(getEngenhariaRequestApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${formSubmissionApiKey}`,
    },
    body: JSON.stringify(payload),
  })

  const data = (await response.json().catch(() => null)) as
    | SubmitEngenhariaRequestResponse
    | null

  if (response.status !== 201 || data?.ok !== true) {
    throw new Error(getSubmissionErrorMessage(response.status, data?.error))
  }

  return data
}

function getSubmissionErrorMessage(status: number, apiError?: string) {
  if (apiError) {
    return apiError
  }

  if (status === 400) {
    return 'Dados inválidos. Revise o formulário e os documentos anexados.'
  }

  if (status === 401) {
    return 'Não autorizado. Verifique a chave de API configurada.'
  }

  if (status === 404) {
    return 'Endpoint de envio não encontrado.'
  }

  if (status >= 500) {
    return 'Falha no servidor do bot. Tente novamente em instantes.'
  }

  return 'Falha ao enviar a solicitação de engenharia.'
}
