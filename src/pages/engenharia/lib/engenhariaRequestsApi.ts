import type {
  EngenhariaRequestDetail,
  EngenhariaRequestListItem,
} from '../types/engenhariaRequest'

const formSubmissionApiUrl = import.meta.env.VITE_FORM_SUBMISSION_API_URL
const formSubmissionApiKey = import.meta.env.VITE_FORM_SUBMISSION_API_KEY

export type EngenhariaRequestsListResponse = {
  items: EngenhariaRequestListItem[]
  total: number
  page: number
  pageSize: number
}

export type UpdateEngenhariaRequestPayload = {
  brokerUserId: string
  propertyKind?: string
  propertyValue?: number
  contactPhone?: string
  accompanyingName?: string
  status?: string
  commentMessage?: string
}

function getEngenhariaRequestsApiUrl() {
  if (!formSubmissionApiUrl) {
    throw new Error('URL de envio do formulário não configurada.')
  }

  return formSubmissionApiUrl.replace(
    /\/form-submissions\/?$/,
    '/engineering-requests',
  )
}

function getRequestHeaders() {
  if (!formSubmissionApiKey) {
    throw new Error('Chave de API de envio do formulário não configurada.')
  }

  return {
    Authorization: `Bearer ${formSubmissionApiKey}`,
  }
}

function getJsonRequestHeaders() {
  return {
    ...getRequestHeaders(),
    'Content-Type': 'application/json',
  }
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | { error?: string }
    | null

  if (!response.ok || data === null) {
    throw new Error(getEngenhariaRequestsErrorMessage(response.status, data))
  }

  if ('error' in data && typeof data.error === 'string' && data.error.trim()) {
    throw new Error(data.error)
  }

  return data as T
}

export async function fetchEngenhariaRequests({
  brokerUserId,
  page,
  pageSize,
  search = '',
}: {
  brokerUserId: string
  page: number
  pageSize: number
  search?: string
}): Promise<EngenhariaRequestsListResponse> {
  const url = new URL(getEngenhariaRequestsApiUrl())
  url.searchParams.set('brokerUserId', brokerUserId)
  url.searchParams.set('page', String(page))
  url.searchParams.set('pageSize', String(pageSize))

  if (search.trim()) {
    url.searchParams.set('search', search.trim())
  }

  const response = await fetch(url.toString(), {
    headers: getRequestHeaders(),
  })

  return parseApiResponse<EngenhariaRequestsListResponse>(response)
}

export async function fetchEngenhariaRequestDetail(
  requestId: string,
  brokerUserId: string,
): Promise<EngenhariaRequestDetail> {
  const url = new URL(`${getEngenhariaRequestsApiUrl()}/${requestId}`)
  url.searchParams.set('brokerUserId', brokerUserId)

  const response = await fetch(url.toString(), {
    headers: getRequestHeaders(),
  })

  return parseApiResponse<EngenhariaRequestDetail>(response)
}

export async function updateEngenhariaRequest(
  requestId: string,
  payload: UpdateEngenhariaRequestPayload,
): Promise<void> {
  const response = await fetch(`${getEngenhariaRequestsApiUrl()}/${requestId}`, {
    method: 'PATCH',
    headers: getJsonRequestHeaders(),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as
      | { error?: string }
      | null
    throw new Error(getEngenhariaRequestsErrorMessage(response.status, data))
  }
}

export async function deleteEngenhariaRequest(
  requestId: string,
  brokerUserId: string,
): Promise<void> {
  const url = new URL(`${getEngenhariaRequestsApiUrl()}/${requestId}`)
  url.searchParams.set('brokerUserId', brokerUserId)

  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: getRequestHeaders(),
  })

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as
      | { error?: string }
      | null
    throw new Error(getEngenhariaRequestsErrorMessage(response.status, data))
  }
}

function getEngenhariaRequestsErrorMessage(
  status: number,
  data?: { error?: string } | null,
) {
  if (data?.error?.trim()) {
    return data.error
  }

  if (status === 400) {
    return 'Dados inválidos para buscar solicitações de engenharia.'
  }

  if (status === 401) {
    return 'Não autorizado. Verifique a chave de API configurada.'
  }

  if (status === 403) {
    return 'Sem permissão para acessar ou alterar esta solicitação.'
  }

  if (status === 404) {
    return 'Solicitação de engenharia não encontrada.'
  }

  if (status >= 500) {
    return 'Falha no servidor. Tente novamente em instantes.'
  }

  return 'Não foi possível carregar as solicitações de engenharia.'
}
