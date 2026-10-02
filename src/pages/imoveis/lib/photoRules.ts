/** Espelha `src/app/modules/properties/domain/property-photo.ts` do bot ([PROVISÓRIO]). */
export const MAX_PHOTOS_PER_PROPERTY = 30
export const MAX_PHOTO_BYTES = 30 * 1024 * 1024
export const MIN_RECOMMENDED_WIDTH = 600
const RECOMMENDED_RATIOS = [1, 4 / 5]
const ACCEPTED_TYPES = ['image/jpeg', 'image/png']

export const PHOTO_ACCEPT = 'image/jpeg,image/png'

/** Motivo da recusa, ou nulo se o arquivo pode ser enviado (11.7: recusa só aquele). */
export function rejectReason(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Formato não aceito. Use foto JPG ou PNG'
  if (file.size > MAX_PHOTO_BYTES) return `A foto passa do tamanho máximo de ${MAX_PHOTO_BYTES / 1024 / 1024} MB`

  return null
}

export function warningsFor(width: number | null, height: number | null): string[] {
  if (!width || !height) return []

  const warnings: string[] = []

  if (width < MIN_RECOMMENDED_WIDTH) warnings.push(`Largura de ${width} px. Você pode usar mesmo assim.`)

  const ratio = width / height
  if (!RECOMMENDED_RATIOS.some((ideal) => Math.abs(ratio - ideal) / ideal <= 0.05)) {
    warnings.push('Pode sair cortada no anúncio. O ideal é 1080×1080 ou 1080×1350.')
  }

  return warnings
}

export async function readDimensions(file: File): Promise<{ width: number; height: number } | null> {
  try {
    const bitmap = await createImageBitmap(file)
    const dimensions = { width: bitmap.width, height: bitmap.height }
    bitmap.close()

    return dimensions
  } catch {
    return null
  }
}

export function formatFileSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB` : `${Math.ceil(bytes / 1024)} KB`
}
