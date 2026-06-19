import { parseUserRole, type UserRole } from './auth/roles'

const formSubmissionApiUrl = import.meta.env.VITE_FORM_SUBMISSION_API_URL
const formSubmissionApiKey = import.meta.env.VITE_FORM_SUBMISSION_API_KEY

export type CurrentUserProfile = {
  id: string
  fullName: string
  role: UserRole
  isAdmin: boolean
  isActive: boolean
  avatarPath: string | null
  updatedAt: string | null
}

type CurrentUserProfileApiResponse =
  | {
      id: string
      fullName: string
      role: string
      isAdmin: boolean
      isActive: boolean
      avatarPath: string | null
      updatedAt: string | null
    }
  | {
      ok: false
      error: string
    }

export class CurrentUserProfileNotFoundError extends Error {}

function isCurrentUserProfileErrorResponse(
  data: CurrentUserProfileApiResponse,
): data is { ok: false; error: string } {
  return 'ok' in data && data.ok === false
}

function getCurrentUserProfileApiUrl() {
  if (!formSubmissionApiUrl) {
    throw new Error('URL de envio do formulário não configurada.')
  }

  return formSubmissionApiUrl.replace(/\/form-submissions\/?$/, '/me')
}

export async function fetchCurrentUserProfile(
  userId: string,
): Promise<CurrentUserProfile> {
  if (!formSubmissionApiKey) {
    throw new Error('Chave de API de envio do formulário não configurada.')
  }

  const url = new URL(getCurrentUserProfileApiUrl())
  url.searchParams.set('userId', userId)

  const response = await fetch(url.toString(), {
    headers: {
      'x-api-key': formSubmissionApiKey,
    },
  })

  const data = (await response.json().catch(() => null)) as
    | CurrentUserProfileApiResponse
    | null

  if (!response.ok || !data) {
    throw new Error(getCurrentUserProfileErrorMessage(response.status, data))
  }

  if (isCurrentUserProfileErrorResponse(data)) {
    const message = data.error

    if (message === 'Perfil não encontrado') {
      throw new CurrentUserProfileNotFoundError(message)
    }

    throw new Error(message)
  }

  return {
    id: data.id,
    fullName: data.fullName,
    role: parseUserRole(data.role),
    isAdmin: data.isAdmin,
    isActive: data.isActive !== false,
    avatarPath: typeof data.avatarPath === 'string' ? data.avatarPath : null,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : null,
  }
}

function getCurrentUserProfileErrorMessage(
  status: number,
  data: CurrentUserProfileApiResponse | null,
) {
  if (data && isCurrentUserProfileErrorResponse(data) && data.error) {
    return data.error
  }

  if (status === 400) {
    return 'Não foi possível identificar o usuário atual.'
  }

  if (status === 401) {
    return 'Não autorizado. Verifique a chave de API configurada.'
  }

  if (status === 404) {
    return 'Perfil não encontrado'
  }

  if (status >= 500) {
    return 'Falha ao carregar o perfil atual. Tente novamente em instantes.'
  }

  return 'Não foi possível carregar o perfil atual.'
}
