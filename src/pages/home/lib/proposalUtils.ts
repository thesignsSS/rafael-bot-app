export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const ibgeCearaCitiesUrl =
  'https://servicodados.ibge.gov.br/api/v1/localidades/estados/23/municipios'

export const additionalInfoMaxLength = 10000

export const fileKey = (file: File) =>
  `${file.name}-${file.size}-${file.lastModified}`

export const formatFileSize = (sizeInBytes: number) => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`
  }

  const sizeInKb = sizeInBytes / 1024

  if (sizeInKb < 1024) {
    return `${sizeInKb.toFixed(1)} KB`
  }

  return `${(sizeInKb / 1024).toFixed(1)} MB`
}

export const normalizeSearchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
