import { botFetch } from '../../../lib/botApi'

const formSubmissionApiUrl = import.meta.env.VITE_FORM_SUBMISSION_API_URL

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'discarded'
export type CampaignStatus = 'creating' | 'active' | 'paused' | 'completed' | 'failed'

export type MetaConnectionStatus = {
  provider: 'graph' | 'fake'
  connected: boolean
  pageName: string | null
  instagramUsername: string | null
  connectedAt: string | null
}

export type InstagramPost = {
  id: string
  caption: string | null
  mediaType: string
  mediaUrl: string | null
  thumbnailUrl: string | null
  permalink: string | null
  timestamp: string | null
}

export type MetaCity = {
  key: string
  name: string
  region: string | null
  countryCode: string | null
}

export type CampaignAudience = {
  city?: { key: string; name: string; radiusKm: number }
  ageMin: number
  ageMax: number
}

export type Campaign = {
  id: string
  name: string
  instagramMediaId: string
  instagramMediaPermalink: string | null
  instagramMediaThumbnailUrl: string | null
  instagramMediaCaption: string | null
  budgetCents: number
  budgetCurrency: string
  durationDays: number
  audience: CampaignAudience & { countries?: string[] }
  status: CampaignStatus
  failureReason: string | null
  startsAt: string | null
  endsAt: string | null
  createdAt: string
  leadCount: number
}

export type Lead = {
  id: string
  campaignId: string | null
  fullName: string | null
  email: string | null
  phone: string | null
  fields: Array<{ name: string; values: string[] }>
  status: LeadStatus
  receivedAt: string
}

export type CreateCampaignPayload = {
  userId: string
  name: string
  instagramMediaId: string
  budgetCents: number
  durationDays: number
  audience: CampaignAudience
}

function getBaseUrl() {
  if (!formSubmissionApiUrl) {
    throw new Error('URL de envio do formulário não configurada.')
  }

  return formSubmissionApiUrl.replace(/\/form-submissions\/?$/, '/lead-ads')
}

function getHeaders(json = false): HeadersInit {
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  }
}

async function request<T>(
  path: string,
  params: Record<string, string | undefined>,
  init: RequestInit = {},
): Promise<T> {
  const url = new URL(`${getBaseUrl()}${path}`)
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value)
  }

  const response = await botFetch(url.toString(), {
    ...init,
    headers: getHeaders(Boolean(init.body)),
  })
  const data = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | null

  if (!response.ok || data === null) {
    throw new Error(getErrorMessage(response.status, data?.error))
  }

  return data as T
}

function getErrorMessage(status: number, error?: string) {
  if (error) return error
  if (status === 401) return 'Não autorizado. Verifique a chave de API configurada.'
  if (status === 403) return 'Apenas o dono da empresa acessa a captação de leads.'
  if (status === 502) return 'A Meta recusou a operação. Tente novamente em instantes.'
  if (status === 503) return 'Captação de leads não está disponível neste ambiente.'
  if (status >= 500) return 'Falha no servidor. Tente novamente em instantes.'
  return 'Não foi possível concluir a operação.'
}

export function fetchConnectionStatus(userId: string) {
  return request<MetaConnectionStatus>('/connection', { userId })
}

export async function fetchConnectUrl(userId: string) {
  return (await request<{ url: string }>('/connect-url', { userId })).url
}

export function disconnectMeta(userId: string) {
  return request<{ ok: true }>('/connection', { userId }, { method: 'DELETE' })
}

export async function fetchInstagramPosts(userId: string) {
  return (await request<{ items: InstagramPost[] }>('/instagram-media', { userId })).items
}

export async function searchCities(userId: string, query: string) {
  return (await request<{ items: MetaCity[] }>('/cities', { userId, q: query })).items
}

export async function fetchCampaigns(userId: string) {
  return (await request<{ items: Campaign[] }>('/campaigns', { userId })).items
}

export function fetchCampaign(userId: string, campaignId: string) {
  return request<{ campaign: Campaign; leads: Lead[] }>(
    `/campaigns/${encodeURIComponent(campaignId)}`,
    { userId },
  )
}

export function createCampaign(payload: CreateCampaignPayload) {
  return request<Campaign>('/campaigns', {}, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateLeadStatus(userId: string, leadId: string, status: LeadStatus) {
  return request<{ ok: true }>(`/leads/${encodeURIComponent(leadId)}`, {}, {
    method: 'PATCH',
    body: JSON.stringify({ userId, status }),
  })
}
