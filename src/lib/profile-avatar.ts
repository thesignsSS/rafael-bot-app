import { supabase } from './supabase'

export const PROFILE_AVATARS_BUCKET = 'avatars'
export const PROFILE_AVATAR_SIZE = 256
export const PROFILE_AVATAR_MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export function buildProfileAvatarPath(userId: string) {
  return `${userId}/avatar.webp`
}

export function getProfileAvatarUrl(
  avatarPath: string | null | undefined,
  updatedAt?: string | null,
) {
  if (!avatarPath) {
    return null
  }

  const { data } = supabase.storage
    .from(PROFILE_AVATARS_BUCKET)
    .getPublicUrl(avatarPath)

  if (!data.publicUrl) {
    return null
  }

  if (!updatedAt) {
    return data.publicUrl
  }

  const separator = data.publicUrl.includes('?') ? '&' : '?'
  return `${data.publicUrl}${separator}v=${encodeURIComponent(updatedAt)}`
}

export async function loadImageFromUrl(url: string) {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.decoding = 'async'

  const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Não foi possível carregar a imagem selecionada.'))
  })

  image.src = url
  return loadPromise
}

export async function createCroppedAvatarBlob(input: {
  imageUrl: string
  crop: {
    x: number
    y: number
    width: number
    height: number
  }
}) {
  const image = await loadImageFromUrl(input.imageUrl)
  const canvas = document.createElement('canvas')
  canvas.width = PROFILE_AVATAR_SIZE
  canvas.height = PROFILE_AVATAR_SIZE

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Não foi possível preparar a foto para upload.')
  }

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(
    image,
    input.crop.x,
    input.crop.y,
    input.crop.width,
    input.crop.height,
    0,
    0,
    PROFILE_AVATAR_SIZE,
    PROFILE_AVATAR_SIZE,
  )

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/webp', 0.82)
  })

  if (!blob) {
    throw new Error('Não foi possível gerar a versão otimizada da foto.')
  }

  return blob
}
