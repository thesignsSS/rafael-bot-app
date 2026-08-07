import {
  ENGENHARIA_DOCUMENT_GROUPS,
  type PropertyKind,
} from '../types/engenharia'

export function validatePropertyKindValue(value: string): string | null {
  if (!value) {
    return 'Selecione o tipo de imóvel.'
  }

  return null
}

export function validatePropertyValueValue(value: string): string | null {
  if (!value.trim()) {
    return 'Informe o valor do imóvel.'
  }

  return null
}

export function validateContactValue(value: string): string | null {
  const digits = value.replace(/\D/g, '')

  if (!digits) {
    return 'Informe o contato.'
  }

  if (digits.length < 10) {
    return 'Informe um telefone válido.'
  }

  return null
}

export function validateAccompanyingNameValue(value: string): string | null {
  if (!value.trim()) {
    return 'Informe o nome de quem irá acompanhar a engenharia.'
  }

  return null
}

export function getMissingDocumentLabels(
  propertyKind: PropertyKind | '',
  documents: Partial<Record<string, File>>,
): string[] {
  if (!propertyKind) {
    return []
  }

  const group = ENGENHARIA_DOCUMENT_GROUPS.find(
    (candidate) => candidate.kind === propertyKind,
  )

  if (!group) {
    return []
  }

  return group.slots
    .filter((slot) => !documents[slot.key])
    .map((slot) => slot.label)
}
