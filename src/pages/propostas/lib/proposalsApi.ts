import type {
  AcceptProposalShareResponse,
  ProposalDetail,
  ProposalShareLinkResponse,
  ProposalSharePreview,
  UpdateProposalStatusPayload,
  UpdateProposalPayload,
  ViewProposalDocumentResponse,
} from '../types/proposal-detail'
import type { ProposalsListResponse } from '../types/proposal-list-item'
import type { FormSubmissionDocument } from '../../home/types/proposal'
import {
  DEFAULT_PROPOSAL_STATUS_OPTIONS,
  normalizeProposalStatusOptions,
  type ProposalStatusOption,
} from '../types/proposal-status'

const formSubmissionApiUrl = import.meta.env.VITE_FORM_SUBMISSION_API_URL
const formSubmissionApiKey = import.meta.env.VITE_FORM_SUBMISSION_API_KEY

function getProposalsApiUrl() {
  if (!formSubmissionApiUrl) {
    throw new Error('URL de envio do formulário não configurada.')
  }

  return formSubmissionApiUrl.replace(/\/form-submissions\/?$/, '/proposals')
}

function getProposalShareLinksApiUrl() {
  if (!formSubmissionApiUrl) {
    throw new Error('URL de envio do formulário não configurada.')
  }

  return formSubmissionApiUrl.replace(
    /\/form-submissions\/?$/,
    '/proposal-share-links',
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
    throw new Error(getProposalsErrorMessage(response.status, data))
  }

  if ('error' in data && typeof data.error === 'string' && data.error.trim()) {
    throw new Error(data.error)
  }

  return data as T
}

export type FetchProposalsParams = {
  brokerUserId: string
  page: number
  pageSize: number
  search: string
  clientName?: string
  brokerName?: string
  proposalCode?: string
}

export async function fetchProposals({
  brokerUserId,
  page,
  pageSize,
  search,
  clientName = '',
  brokerName = '',
  proposalCode = '',
}: FetchProposalsParams): Promise<ProposalsListResponse> {
  const url = new URL(getProposalsApiUrl())
  url.searchParams.set('brokerUserId', brokerUserId)
  url.searchParams.set('page', String(page))
  url.searchParams.set('pageSize', String(pageSize))

  if (search.trim()) {
    url.searchParams.set('search', search.trim())
  }

  if (clientName.trim()) {
    url.searchParams.set('clientName', clientName.trim())
  }

  if (brokerName.trim()) {
    url.searchParams.set('brokerName', brokerName.trim())
  }

  if (proposalCode.trim()) {
    url.searchParams.set('proposalCode', proposalCode.trim())
  }

  const response = await fetch(url.toString(), {
    headers: getRequestHeaders(),
  })

  return parseApiResponse<ProposalsListResponse>(response)
}

export async function fetchProposalDetail(
  proposalId: string,
  brokerUserId: string,
): Promise<ProposalDetail> {
  const url = new URL(`${getProposalsApiUrl()}/${proposalId}`)
  url.searchParams.set('brokerUserId', brokerUserId)

  const response = await fetch(url.toString(), {
    headers: getRequestHeaders(),
  })

  return parseApiResponse<ProposalDetail>(response)
}

export async function fetchProposalStatuses(): Promise<ProposalStatusOption[]> {
  const response = await fetch(`${getProposalsApiUrl()}/statuses`, {
    headers: getRequestHeaders(),
  })

  if (!response.ok) {
    return DEFAULT_PROPOSAL_STATUS_OPTIONS
  }

  const data = (await response.json().catch(() => null)) as unknown

  return normalizeProposalStatusOptions(data)
}

export async function updateProposal(
  proposalId: string,
  payload: UpdateProposalPayload,
): Promise<void> {
  const response = await fetch(`${getProposalsApiUrl()}/${proposalId}`, {
    method: 'PATCH',
    headers: getJsonRequestHeaders(),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(getProposalsErrorMessage(response.status))
  }
}

export async function updateProposalStatus(
  proposalId: string,
  payload: UpdateProposalStatusPayload,
): Promise<void> {
  const response = await fetch(`${getProposalsApiUrl()}/${proposalId}`, {
    method: 'PATCH',
    headers: getJsonRequestHeaders(),
    body: JSON.stringify({
      ...payload,
      situacao: payload.status,
    }),
  })

  if (!response.ok) {
    throw new Error(getProposalsErrorMessage(response.status))
  }
}

export async function createProposalShareLink(
  proposalId: string,
  brokerUserId: string,
): Promise<ProposalShareLinkResponse> {
  const response = await fetch(`${getProposalsApiUrl()}/${proposalId}/share-link`, {
    method: 'POST',
    headers: getJsonRequestHeaders(),
    body: JSON.stringify({ brokerUserId }),
  })

  return parseApiResponse<ProposalShareLinkResponse>(response)
}

export async function fetchProposalSharePreview(
  token: string,
  brokerUserId: string,
): Promise<ProposalSharePreview> {
  const url = new URL(`${getProposalShareLinksApiUrl()}/${token}`)
  url.searchParams.set('brokerUserId', brokerUserId)

  const response = await fetch(url.toString(), {
    headers: getRequestHeaders(),
  })

  return parseApiResponse<ProposalSharePreview>(response)
}

export async function acceptProposalShareLink(
  token: string,
  brokerUserId: string,
): Promise<AcceptProposalShareResponse> {
  const response = await fetch(`${getProposalShareLinksApiUrl()}/${token}/accept`, {
    method: 'POST',
    headers: getJsonRequestHeaders(),
    body: JSON.stringify({ brokerUserId }),
  })

  return parseApiResponse<AcceptProposalShareResponse>(response)
}

export async function removeProposalGuest(
  proposalId: string,
  guestUserId: string,
  brokerUserId: string,
): Promise<void> {
  const url = new URL(`${getProposalsApiUrl()}/${proposalId}/guests/${guestUserId}`)
  url.searchParams.set('brokerUserId', brokerUserId)

  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: getRequestHeaders(),
  })

  if (!response.ok) {
    throw new Error(getProposalsErrorMessage(response.status))
  }
}

export async function uploadProposalDocuments(
  proposalId: string,
  brokerUserId: string,
  documents: FormSubmissionDocument[],
): Promise<void> {
  const response = await fetch(`${getProposalsApiUrl()}/${proposalId}/documents`, {
    method: 'POST',
    headers: getJsonRequestHeaders(),
    body: JSON.stringify({ brokerUserId, documents }),
  })

  if (!response.ok) {
    throw new Error(getProposalsErrorMessage(response.status))
  }
}

export async function renameProposalDocument(
  proposalId: string,
  documentId: string,
  brokerUserId: string,
  displayName: string,
): Promise<void> {
  const response = await fetch(
    `${getProposalsApiUrl()}/${proposalId}/documents/${documentId}`,
    {
      method: 'PATCH',
      headers: getJsonRequestHeaders(),
      body: JSON.stringify({ brokerUserId, displayName }),
    },
  )

  if (!response.ok) {
    throw new Error(getProposalsErrorMessage(response.status))
  }
}

export async function deleteProposalDocument(
  proposalId: string,
  documentId: string,
  brokerUserId: string,
): Promise<void> {
  const url = new URL(`${getProposalsApiUrl()}/${proposalId}/documents/${documentId}`)
  url.searchParams.set('brokerUserId', brokerUserId)

  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: getRequestHeaders(),
  })

  if (!response.ok) {
    throw new Error(getProposalsErrorMessage(response.status))
  }
}

export async function deleteProposal(
  proposalId: string,
  brokerUserId: string,
): Promise<void> {
  const url = new URL(`${getProposalsApiUrl()}/${proposalId}`)
  url.searchParams.set('brokerUserId', brokerUserId)

  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: getRequestHeaders(),
  })

  if (!response.ok) {
    throw new Error(getProposalsErrorMessage(response.status))
  }
}

export async function sendIncomeValidationTestEmail(
  proposalId: string,
  payload: {
    brokerUserId: string
    to: string[]
    subject: string
    text: string
    html?: string
    attachments?: Array<
      | {
          type: 'proposal_document'
          documentId: string
          filename?: string
        }
      | {
          type: 'uploaded_file'
          filename: string
          contentType?: string
          base64Content: string
        }
    >
  },
): Promise<void> {
  const response = await fetch(
    `${getProposalsApiUrl()}/${proposalId}/income-validation-test-email`,
    {
      method: 'POST',
      headers: getJsonRequestHeaders(),
      body: JSON.stringify(payload),
    },
  )

  if (!response.ok) {
    throw new Error(getProposalsErrorMessage(response.status))
  }
}

export async function viewProposalDocument(
  proposalId: string,
  documentId: string,
  brokerUserId: string,
): Promise<ViewProposalDocumentResponse> {
  const url = new URL(
    `${getProposalsApiUrl()}/${proposalId}/documents/${documentId}/view`,
  )
  url.searchParams.set('brokerUserId', brokerUserId)

  const response = await fetch(url.toString(), {
    headers: getRequestHeaders(),
  })

  return parseApiResponse<ViewProposalDocumentResponse>(response)
}

export type DownloadProposalZipResponse = {
  blob: Blob
  filename: string
}

function extractFilenameFromDisposition(disposition: string | null) {
  if (!disposition) {
    return null
  }

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }

  const filenameMatch = disposition.match(/filename="?([^"]+)"?/i)
  return filenameMatch?.[1] ?? null
}

export async function downloadProposalZip(
  proposalId: string,
  brokerUserId: string,
): Promise<DownloadProposalZipResponse> {
  const url = new URL(`${getProposalsApiUrl()}/${proposalId}/download`)
  url.searchParams.set('brokerUserId', brokerUserId)

  const response = await fetch(url.toString(), {
    headers: getRequestHeaders(),
  })

  if (!response.ok) {
    throw new Error(getProposalsErrorMessage(response.status))
  }

  return {
    blob: await response.blob(),
    filename:
      extractFilenameFromDisposition(response.headers.get('Content-Disposition')) ??
      `proposta-${proposalId}.zip`,
  }
}

export async function downloadProposalDocument(
  proposalId: string,
  documentId: string,
  brokerUserId: string,
): Promise<DownloadProposalZipResponse> {
  const url = new URL(
    `${getProposalsApiUrl()}/${proposalId}/documents/${documentId}/download`,
  )
  url.searchParams.set('brokerUserId', brokerUserId)

  const response = await fetch(url.toString(), {
    headers: getRequestHeaders(),
  })

  if (!response.ok) {
    throw new Error(getProposalsErrorMessage(response.status))
  }

  return {
    blob: await response.blob(),
    filename:
      extractFilenameFromDisposition(response.headers.get('Content-Disposition')) ??
      `documento-${documentId}`,
  }
}

function getProposalsErrorMessage(
  status: number,
  data?: { error?: string } | null,
) {
  if (data?.error?.trim()) {
    return data.error
  }

  if (status === 400) {
    return 'Dados inválidos para buscar propostas.'
  }

  if (status === 401) {
    return 'Não autorizado. Verifique a chave de API configurada.'
  }

  if (status === 403) {
    return 'Sem permissão para acessar ou alterar esta proposta.'
  }

  if (status === 404) {
    return 'Proposta não encontrada.'
  }

  if (status >= 500) {
    return 'Falha no servidor de propostas. Tente novamente em instantes.'
  }

  return 'Não foi possível carregar as propostas.'
}
