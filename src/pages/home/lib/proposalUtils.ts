export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type BrazilianState = {
  code: string
  name: string
  ibgeId: number
}

export const brazilianStates: BrazilianState[] = [
  { code: 'AC', name: 'Acre', ibgeId: 12 },
  { code: 'AL', name: 'Alagoas', ibgeId: 27 },
  { code: 'AP', name: 'Amapa', ibgeId: 16 },
  { code: 'AM', name: 'Amazonas', ibgeId: 13 },
  { code: 'BA', name: 'Bahia', ibgeId: 29 },
  { code: 'CE', name: 'Ceara', ibgeId: 23 },
  { code: 'DF', name: 'Distrito Federal', ibgeId: 53 },
  { code: 'ES', name: 'Espirito Santo', ibgeId: 32 },
  { code: 'GO', name: 'Goias', ibgeId: 52 },
  { code: 'MA', name: 'Maranhao', ibgeId: 21 },
  { code: 'MT', name: 'Mato Grosso', ibgeId: 51 },
  { code: 'MS', name: 'Mato Grosso do Sul', ibgeId: 50 },
  { code: 'MG', name: 'Minas Gerais', ibgeId: 31 },
  { code: 'PA', name: 'Para', ibgeId: 15 },
  { code: 'PB', name: 'Paraiba', ibgeId: 25 },
  { code: 'PR', name: 'Parana', ibgeId: 41 },
  { code: 'PE', name: 'Pernambuco', ibgeId: 26 },
  { code: 'PI', name: 'Piaui', ibgeId: 22 },
  { code: 'RJ', name: 'Rio de Janeiro', ibgeId: 33 },
  { code: 'RN', name: 'Rio Grande do Norte', ibgeId: 24 },
  { code: 'RS', name: 'Rio Grande do Sul', ibgeId: 43 },
  { code: 'RO', name: 'Rondonia', ibgeId: 11 },
  { code: 'RR', name: 'Roraima', ibgeId: 14 },
  { code: 'SC', name: 'Santa Catarina', ibgeId: 42 },
  { code: 'SP', name: 'Sao Paulo', ibgeId: 35 },
  { code: 'SE', name: 'Sergipe', ibgeId: 28 },
  { code: 'TO', name: 'Tocantins', ibgeId: 17 },
]

export function getIbgeCitiesUrlByState(stateCode: string) {
  const normalizedStateCode = stateCode.trim().toUpperCase()
  const selectedState = brazilianStates.find(
    (state) => state.code === normalizedStateCode,
  )

  if (!selectedState) {
    return null
  }

  return `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState.ibgeId}/municipios`
}

export const additionalInfoMaxLength = 10000
export const supportedFileExtensions = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'jpeg',
  'jpg',
  'png',
  'txt',
] as const
export const supportedFileExtensionsLabel = supportedFileExtensions
  .map((extension) => extension.toUpperCase())
  .join(', ')

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

export const getFileExtension = (filename: string) => {
  const extension = filename.split('.').pop()

  return extension?.toLowerCase() ?? ''
}
