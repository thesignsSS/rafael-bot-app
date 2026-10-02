/** Espelha `src/app/modules/properties/domain/property.ts` do bot. */

export const PROPERTY_TYPE_OPTIONS = [
  { value: 'novo', label: 'Novo' },
  { value: 'usado', label: 'Usado' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'na_planta', label: 'Na Planta' },
  { value: 'adjudicado', label: 'Adjudicado' },
] as const

export type PropertyType = (typeof PROPERTY_TYPE_OPTIONS)[number]['value']

export type PropertyStatus =
  | 'disponivel'
  | 'em_negociacao'
  | 'reservado'
  | 'em_proposta'
  | 'vendido'
  | 'inativo'

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA',
  'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
] as const

export type PropertyAddress = {
  state: string
  municipality: string
  municipalityIbgeCode: string | null
  neighborhood: string
  street: string
  number: string | null
  complement: string | null
  postalCode: string | null
}

export type Property = {
  id: string
  referenceCode: string
  type: PropertyType
  typeLabel: string
  salePrice: number
  developmentName: string | null
  address: PropertyAddress
  privateAreaM2: number | null
  totalAreaM2: number | null
  registrationNumber: string | null
  appraisal: { value: number; validUntil: string } | null
  internalNotes: string | null
  responsibleBrokerId: string
  responsibleBroker: { id: string; name: string | null }
  status: PropertyStatus
  statusLabel: string
  statusChangedAt: string
  createdAt: string
  updatedAt: string
  permissions: {
    canEdit: boolean
    canChangeStatus: boolean
    canCorrectType: boolean
    canViewSellers: boolean
    canDeleteOrInactivate: boolean
    canTransfer: boolean
    canUseInProposal: boolean
  }
}

/** Corpo de POST/PUT /api/properties. */
export type PropertyPayload = {
  referenceCode: string | null
  type: PropertyType | null
  salePrice: number | null
  developmentName: string | null
  address: Omit<PropertyAddress, 'municipalityIbgeCode'> & { municipalityIbgeCode: string | null }
  privateAreaM2: number | null
  totalAreaM2: number | null
  registrationNumber: string | null
  hasAppraisal: boolean
  appraisalValue: number | null
  appraisalValidUntil: string | null
  internalNotes: string | null
  responsibleBrokerId: string | null
}

export type Municipality = { ibgeCode: string; name: string }

export type Broker = { id: string; fullName: string | null; isActive: boolean }

/** Erros por campo devolvidos pelo bot (422). Chaves como `address.neighborhood`. */
export type FieldErrors = Partial<Record<string, string>>
