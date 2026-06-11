import type {
  ProposalDetail,
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
  const data = (await response.json().catch(() => null)) as T | null

  if (!response.ok || data === null) {
    throw new Error(getProposalsErrorMessage(response.status))
  }

  return data
}

export type FetchProposalsParams = {
  brokerUserId: string
  page: number
  pageSize: number
  search: string
}

export async function fetchProposals({
  brokerUserId,
  page,
  pageSize,
  search,
}: FetchProposalsParams): Promise<ProposalsListResponse> {
  const url = new URL(getProposalsApiUrl())
  url.searchParams.set('brokerUserId', brokerUserId)
  url.searchParams.set('page', String(page))
  url.searchParams.set('pageSize', String(pageSize))

  if (search.trim()) {
    url.searchParams.set('search', search.trim())
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
    body: JSON.stringify(payload),
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

  const disposition = response.headers.get('Content-Disposition') ?? ''
  const filenameMatch = disposition.match(/filename="?([^"]+)"?/i)

  return {
    blob: await response.blob(),
    filename: filenameMatch?.[1] ?? `proposta-${proposalId}.zip`,
  }
}

function getProposalsErrorMessage(status: number) {
  if (status === 400) {
    return 'Dados inválidos para buscar propostas.'
  }

  if (status === 401) {
    return 'Não autorizado. Verifique a chave de API configurada.'
  }

  if (status === 403) {
    return 'Sem permissão para acessar esta proposta.'
  }

  if (status === 404) {
    return 'Proposta não encontrada.'
  }

  if (status >= 500) {
    return 'Falha no servidor de propostas. Tente novamente em instantes.'
  }

  return 'Não foi possível carregar as propostas.'
}
