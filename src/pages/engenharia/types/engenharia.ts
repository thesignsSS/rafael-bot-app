export const PROPERTY_KIND_OPTIONS = ['Novo', 'Usado', 'Terreno'] as const

export type PropertyKind = (typeof PROPERTY_KIND_OPTIONS)[number]

export type EngenhariaDocumentSlot = {
  key: string
  label: string
}

export type EngenhariaDocumentGroup = {
  kind: PropertyKind
  title: string
  description: string
  slots: EngenhariaDocumentSlot[]
}

export const ENGENHARIA_DOCUMENT_GROUPS: EngenhariaDocumentGroup[] = [
  {
    kind: 'Usado',
    title: 'Imóvel Usado',
    description: 'Anexe a matrícula do imóvel.',
    slots: [{ key: 'usado-matricula', label: 'Anexar Matrícula' }],
  },
  {
    kind: 'Novo',
    title: 'Imóvel Novo',
    description: 'Anexe todos os documentos obrigatórios.',
    slots: [
      { key: 'novo-matricula', label: 'Anexar Matrícula' },
      { key: 'novo-art', label: 'Anexar ART' },
      { key: 'novo-habite-se', label: 'Anexar Habite-se' },
      {
        key: 'novo-memorial-descritivo',
        label: 'Anexar Memorial Descritivo Modelo Caixa',
      },
      { key: 'novo-alvara', label: 'Anexar Alvará' },
    ],
  },
  {
    kind: 'Terreno',
    title: 'Terreno',
    description: 'Anexe a matrícula do terreno.',
    slots: [{ key: 'terreno-matricula', label: 'Anexar Matrícula' }],
  },
]
