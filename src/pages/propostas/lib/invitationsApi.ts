import type {
  InviteSearchUser,
  ProposalInvitation,
} from '../types/proposal-detail'

const formSubmissionApiUrl = import.meta.env.VITE_FORM_SUBMISSION_API_URL
const formSubmissionApiKey = import.meta.env.VITE_FORM_SUBMISSION_API_KEY

type InvitationsResponse = {
  items: ProposalInvitation[]
}

type InvitationResponse = {
  item: ProposalInvitation
}

type PendingInvitationsSummaryResponse = {
  pendingCount: number
  hasPending: boolean
}

type SearchProfilesResponse = {
  items: InviteSearchUser[]
}

function getApiBaseUrl() {
  if (!formSubmissionApiUrl) {
    throw new Error('URL de envio do formulário não configurada.')
  }

  return formSubmissionApiUrl.replace(/\/form-submissions\/?$/, '')
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

async function parseJsonResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const data = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | { error?: string }
    | null

  if (!response.ok || !data) {
    throw new Error(
      data && typeof data === 'object' && 'error' in data && data.error
        ? data.error
        : fallbackMessage,
    )
  }

  if ('error' in data && typeof data.error === 'string' && data.error.trim()) {
    throw new Error(data.error)
  }

  return data as T
}

export async function searchInviteCandidates(userId: string, query: string) {
  const url = new URL(`${getApiBaseUrl()}/profiles/search`)
  url.searchParams.set('userId', userId)
  url.searchParams.set('query', query)

  const response = await fetch(url.toString(), {
    headers: getRequestHeaders(),
  })

  const data = await parseJsonResponse<SearchProfilesResponse>(
    response,
    'Não foi possível buscar usuários.',
  )

  return data.items
}

export async function createProposalInvitation(
  proposalId: string,
  brokerUserId: string,
  inviteeUserId: string,
) {
  const response = await fetch(`${getApiBaseUrl()}/proposals/${proposalId}/invitations`, {
    method: 'POST',
    headers: getJsonRequestHeaders(),
    body: JSON.stringify({ brokerUserId, inviteeUserId }),
  })

  const data = await parseJsonResponse<InvitationResponse>(
    response,
    'Não foi possível enviar o convite.',
  )

  return data.item
}

export async function fetchInvitations(userId: string) {
  const url = new URL(`${getApiBaseUrl()}/invitations`)
  url.searchParams.set('userId', userId)

  const response = await fetch(url.toString(), {
    headers: getRequestHeaders(),
  })

  const data = await parseJsonResponse<InvitationsResponse>(
    response,
    'Não foi possível carregar os convites.',
  )

  return data.items
}

export async function respondProposalInvitation(
  invitationId: string,
  userId: string,
  action: 'accept' | 'reject',
) {
  const response = await fetch(`${getApiBaseUrl()}/invitations/${invitationId}`, {
    method: 'PATCH',
    headers: getJsonRequestHeaders(),
    body: JSON.stringify({ userId, action }),
  })

  const data = await parseJsonResponse<InvitationResponse>(
    response,
    'Não foi possível responder ao convite.',
  )

  return data.item
}

export async function fetchPendingInvitationsSummary(userId: string) {
  const url = new URL(`${getApiBaseUrl()}/invitations/pending-summary`)
  url.searchParams.set('userId', userId)

  const response = await fetch(url.toString(), {
    headers: getRequestHeaders(),
  })

  return parseJsonResponse<PendingInvitationsSummaryResponse>(
    response,
    'Não foi possível carregar o resumo dos convites.',
  )
}
