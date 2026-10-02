import { botFetch } from '../../../lib/botApi'
import { supabase } from '../../../lib/supabase'
import type { Broker, FieldErrors, Municipality, Property, PropertyPayload } from '../types'

const formSubmissionApiUrl = import.meta.env.VITE_FORM_SUBMISSION_API_URL
const PROPERTY_PHOTOS_BUCKET = 'property-photos'

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

export type PhotoWarning = 'low_resolution' | 'may_be_cropped'

export type PropertyPhoto = {
  id: string
  originalName: string
  mimeType: 'image/jpeg' | 'image/png'
  sizeBytes: number
  width: number | null
  height: number | null
  isCover: boolean
  position: number
  url: string
  thumbnailUrl: string
  warnings: PhotoWarning[]
}

export async function fetchPhotos(propertyId: string): Promise<{ items: PropertyPhoto[]; canManage: boolean }> {
  return request(`/properties/${encodeURIComponent(propertyId)}/photos`)
}

/**
 * Envia uma foto em três passos: o bot libera o envio, o arquivo vai direto
 * ao Storage pela URL assinada e o bot confere e registra. Dimensões vão
 * junto só para os avisos de resolução e corte.
 */
export async function uploadPhoto(
  propertyId: string,
  file: File,
  dimensions: { width: number; height: number } | null,
): Promise<PropertyPhoto> {
  const base = `/properties/${encodeURIComponent(propertyId)}/photos`
  const { upload } = await request<{ upload: { path: string; token: string } }>(`${base}/uploads`, {
    method: 'POST',
    body: JSON.stringify({ fileName: file.name, contentType: file.type, sizeBytes: file.size }),
  })

  const sent = await supabase.storage
    .from(PROPERTY_PHOTOS_BUCKET)
    .uploadToSignedUrl(upload.path, upload.token, file, { contentType: file.type })

  if (sent.error) {
    throw new PropertyApiError('A foto não foi enviada. Confira sua conexão e tente de novo.', 0)
  }

  const { photo } = await request<{ photo: PropertyPhoto }>(base, {
    method: 'POST',
    body: JSON.stringify({
      path: upload.path,
      originalName: file.name,
      width: dimensions?.width ?? null,
      height: dimensions?.height ?? null,
    }),
  })

  return photo
}

export async function setCoverPhoto(propertyId: string, photoId: string): Promise<void> {
  await request(`/properties/${encodeURIComponent(propertyId)}/photos/${encodeURIComponent(photoId)}/cover`, {
    method: 'POST',
    body: '{}',
  })
}

export async function removePhoto(propertyId: string, photoId: string): Promise<void> {
  await request(`/properties/${encodeURIComponent(propertyId)}/photos/${encodeURIComponent(photoId)}`, {
    method: 'DELETE',
  })
}

export type AdReadiness =
  | { kind: 'ready' }
  | { kind: 'missing'; missing: string[] }
  | { kind: 'not_advertisable' }

export type PropertyListItem = {
  id: string
  referenceCode: string
  street: string
  number: string | null
  neighborhood: string
  municipality: string
  state: string
  type: Property['type']
  typeLabel: string
  salePrice: number
  status: Property['status']
  statusLabel: string
  responsibleBroker: { id: string; name: string | null }
  coverThumbnailUrl: string | null
  adReadiness: AdReadiness
  adReadinessLabel: string
  updatedAt: string
}

export type PropertyListParams = {
  q?: string
  status?: string
  type?: string
  responsibleBrokerId?: string
  page?: number
  pageSize?: number
}

export async function fetchProperties(
  params: PropertyListParams,
): Promise<{ items: PropertyListItem[]; total: number; page: number; pageSize: number }> {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query.set(key, String(value))
  }

  return request(`/properties?${query.toString()}`)
}
