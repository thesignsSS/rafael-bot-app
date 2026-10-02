import { botFetch } from '../../../lib/botApi'
import type { Broker, FieldErrors, Municipality, Property, PropertyPayload } from '../types'

const formSubmissionApiUrl = import.meta.env.VITE_FORM_SUBMISSION_API_URL

/** Erro da API com mensagens por campo, para o formulário mostrar junto de cada campo. */
export class PropertyApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fields: FieldErrors = {},
  ) {
    super(message)
    this.name = 'PropertyApiError'
  }
}

function apiUrl(path: string) {
  if (!formSubmissionApiUrl) {
    throw new Error('URL do servidor não configurada.')
  }

  return formSubmissionApiUrl.replace(/\/form-submissions\/?$/, path)
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await botFetch(apiUrl(path), {
    ...init,
    headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
  })
  const data = (await response.json().catch(() => null)) as
    | (T & { ok?: boolean; error?: string; fields?: FieldErrors })
    | null

  if (!response.ok || !data) {
    throw new PropertyApiError(
      data?.error ?? fallbackMessage(response.status),
      response.status,
      data?.fields ?? {},
    )
  }

  return data
}

function fallbackMessage(status: number) {
  if (status === 401) return 'Sua sessão expirou. Entre de novo.'
  if (status === 403) return 'Você não tem permissão para esta ação.'
  if (status === 404) return 'Imóvel não encontrado.'

  return 'Não foi possível falar com o servidor. Tente de novo.'
}

export async function fetchProperty(id: string): Promise<Property> {
  return (await request<{ property: Property }>(`/properties/${encodeURIComponent(id)}`)).property
}

export async function createProperty(payload: PropertyPayload): Promise<Property> {
  return (
    await request<{ property: Property }>('/properties', { method: 'POST', body: JSON.stringify(payload) })
  ).property
}

export async function updateProperty(id: string, payload: PropertyPayload): Promise<Property> {
  return (
    await request<{ property: Property }>(`/properties/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  ).property
}

export async function fetchMunicipalities(state: string): Promise<Municipality[]> {
  return (await request<{ items: Municipality[] }>(`/properties/municipalities?state=${encodeURIComponent(state)}`))
    .items
}

export async function fetchBrokers(): Promise<Broker[]> {
  return (await request<{ items: Broker[] }>('/brokers')).items
}
