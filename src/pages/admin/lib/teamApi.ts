export type TeamRole = 'admin' | 'broker'

export type TeamMember = {
  id: string
  fullName: string
  email: string
  role: TeamRole
  isActive: boolean
  isOwner: boolean
  canViewPreferencesInsights: boolean
  createdAt: string
}

type TeamResponse = {
  members: TeamMember[]
  seatsUsed: number
  seatsIncluded: number
}

type InviteResponse = {
  userId: string
  temporaryPassword: string
}

type ResetPasswordResponse = {
  temporaryPassword: string
}

const formSubmissionApiUrl = import.meta.env.VITE_FORM_SUBMISSION_API_URL
const formSubmissionApiKey = import.meta.env.VITE_FORM_SUBMISSION_API_KEY

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

export async function fetchTeam(userId: string) {
  const url = new URL(`${getApiBaseUrl()}/team`)
  url.searchParams.set('userId', userId)

  const response = await fetch(url.toString(), {
    headers: getRequestHeaders(),
  })

  return parseJsonResponse<TeamResponse>(
    response,
    'Não foi possível carregar os usuários da empresa.',
  )
}

export async function inviteTeamMember(input: {
  requesterId: string
  email: string
  fullName: string
  role: TeamRole
}) {
  const response = await fetch(`${getApiBaseUrl()}/team/invite`, {
    method: 'POST',
    headers: getJsonRequestHeaders(),
    body: JSON.stringify({
      userId: input.requesterId,
      email: input.email,
      fullName: input.fullName,
      role: input.role,
    }),
  })

  return parseJsonResponse<InviteResponse>(
    response,
    'Não foi possível convidar o usuário.',
  )
}

export async function resetTeamMemberPassword(
  requesterId: string,
  targetUserId: string,
) {
  const response = await fetch(
    `${getApiBaseUrl()}/team/${targetUserId}/reset-password`,
    {
      method: 'POST',
      headers: getJsonRequestHeaders(),
      body: JSON.stringify({ userId: requesterId }),
    },
  )

  return parseJsonResponse<ResetPasswordResponse>(
    response,
    'Não foi possível redefinir a senha.',
  )
}

export async function deleteTeamMember(
  requesterId: string,
  targetUserId: string,
) {
  const url = new URL(`${getApiBaseUrl()}/team/${targetUserId}`)
  url.searchParams.set('userId', requesterId)

  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: getRequestHeaders(),
  })

  await parseJsonResponse<{ ok: boolean }>(
    response,
    'Não foi possível excluir o usuário.',
  )
}
