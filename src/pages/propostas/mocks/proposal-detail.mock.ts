import type { ProposalListItem } from '../types/proposal-list-item'
import type { ProposalDetail, ProposalDocument } from '../types/proposal-detail'
import {
  getProposalsForUser,
  MOCK_PROPOSALS,
} from './proposals.mock'

const PROPERTY_IMAGE_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD5M-2WDRygMwO9PNdaJmT7L3YnxxyibGTVLj23rZWA9V3uVPsK7-MehKZmemXjPKfyqbuG2_Pxz3EQC-X1FbciDEg3dx21jL67usbaSZNlIrQ2psHX_a8EHa7HBNX2dD2JASe3uAnfV9wcqSmSn23s5s1wQBD2x5KXgCyCA26eeqUvgWxVM0izcvsEAv8xEPyEDCfAQOfkuR9Hw2UjGzWrPzvTgIRYumqyUrHCoams1_eTqFhiNe8Kqjpx_aYrFGmOCoQ9KlY1hjXJ'

const RB8291_DOCUMENTS: ProposalDocument[] = [
  {
    id: 'doc-rg',
    name: 'RG do Cliente.pdf',
    kind: 'pdf',
    sizeBytes: 1_258_291,
    uploadedAt: '2024-05-20T14:30:00.000Z',
  },
  {
    id: 'doc-cpf',
    name: 'CPF do Cliente.jpg',
    kind: 'image',
    sizeBytes: 870_400,
    uploadedAt: '2024-05-20T15:10:00.000Z',
  },
  {
    id: 'doc-income',
    name: 'Comprovante de Renda.pdf',
    kind: 'pdf',
    sizeBytes: 2_516_582,
    uploadedAt: '2024-05-21T09:45:00.000Z',
  },
  {
    id: 'doc-address',
    name: 'Comprovante de Residência.png',
    kind: 'image',
    sizeBytes: 1_887_436,
    uploadedAt: '2024-05-21T11:20:00.000Z',
  },
]

const DETAIL_OVERRIDES: Record<string, Partial<ProposalDetail>> = {
  'RB-8291': {
    status: 'Enviada',
    client: {
      name: 'João da Silva Santos',
      cpf: '000.000.000-00',
      phone: '(85) 99999-9999',
    },
    property: {
      type: 'Novo',
      location: 'Fortaleza, CE',
      buildingName: 'Edifício Solar do Parque',
      imageUrl: PROPERTY_IMAGE_URL,
      imageCaption: 'Unidade Reservada',
      imageSubtitle: 'Edifício Solar do Parque',
    },
    documents: RB8291_DOCUMENTS,
  },
}

const LOCATIONS = [
  'Fortaleza, CE',
  'São Paulo, SP',
  'Recife, PE',
  'Belo Horizonte, MG',
  'Curitiba, PR',
  'Salvador, BA',
]

const BUILDINGS = [
  'Edifício Solar do Parque',
  'Residencial Atlântico',
  'Torres do Horizonte',
  'Condomínio Vista Mar',
  'Parque das Palmeiras',
]

const DOCUMENT_TEMPLATES = [
  { name: 'RG do Cliente.pdf', kind: 'pdf' as const, sizeBytes: 1_200_000 },
  { name: 'CPF do Cliente.jpg', kind: 'image' as const, sizeBytes: 850_000 },
  {
    name: 'Comprovante de Renda.pdf',
    kind: 'pdf' as const,
    sizeBytes: 2_400_000,
  },
  {
    name: 'Comprovante de Residência.png',
    kind: 'image' as const,
    sizeBytes: 1_800_000,
  },
]

function formatMockCpf(index: number): string {
  const base = String(100_000_000 + (index * 17_371) % 899_999_999).padStart(9, '0')
  return `${base.slice(0, 3)}.${base.slice(3, 6)}.${base.slice(6, 9)}-${String(index % 100).padStart(2, '0')}`
}

function formatMockPhone(index: number): string {
  const ddd = 11 + (index % 79)
  const prefix = 90000 + (index * 137) % 9999
  const suffix = String(1000 + (index * 53) % 8999).padStart(4, '0')
  return `(${ddd}) ${prefix}-${suffix}`
}

function buildDocumentsForProposal(
  proposalId: string,
  createdAt: string,
): ProposalDocument[] {
  const createdDate = new Date(createdAt)

  return DOCUMENT_TEMPLATES.map((template, index) => {
    const uploadedAt = new Date(createdDate)
    uploadedAt.setDate(createdDate.getDate() - (DOCUMENT_TEMPLATES.length - index))

    return {
      id: `${proposalId}-doc-${index}`,
      name: template.name,
      kind: template.kind,
      sizeBytes: template.sizeBytes + index * 12_345,
      uploadedAt: uploadedAt.toISOString(),
    }
  })
}

function buildProposalDetail(
  listItem: ProposalListItem,
  index: number,
): ProposalDetail {
  const override = DETAIL_OVERRIDES[listItem.id]

  if (override) {
    return {
      id: listItem.id,
      status: override.status ?? 'Enviada',
      ownerId: listItem.ownerId,
      createdAt: listItem.createdAt,
      client: override.client ?? {
        name: listItem.clientName,
        cpf: formatMockCpf(index),
        phone: formatMockPhone(index),
      },
      property: override.property ?? {
        type: listItem.propertyType,
        location: LOCATIONS[index % LOCATIONS.length],
        buildingName: BUILDINGS[index % BUILDINGS.length],
        imageUrl: PROPERTY_IMAGE_URL,
        imageCaption: 'Unidade Reservada',
        imageSubtitle: BUILDINGS[index % BUILDINGS.length],
      },
      documents: override.documents ?? buildDocumentsForProposal(
        listItem.id,
        listItem.createdAt,
      ),
    }
  }

  const location = LOCATIONS[index % LOCATIONS.length]
  const buildingName = BUILDINGS[index % BUILDINGS.length]

  return {
    id: listItem.id,
    status: index % 5 === 0 ? 'Em análise' : index % 11 === 0 ? 'Finalizada' : 'Enviada',
    ownerId: listItem.ownerId,
    createdAt: listItem.createdAt,
    client: {
      name: listItem.clientName,
      cpf: formatMockCpf(index),
      phone: formatMockPhone(index),
    },
    property: {
      type: listItem.propertyType,
      location,
      buildingName,
      imageUrl: PROPERTY_IMAGE_URL,
      imageCaption: 'Unidade Reservada',
      imageSubtitle: buildingName,
    },
    documents: buildDocumentsForProposal(listItem.id, listItem.createdAt),
  }
}

const MOCK_PROPOSAL_DETAILS = new Map(
  MOCK_PROPOSALS.map((listItem, index) => [
    listItem.id,
    buildProposalDetail(listItem, index),
  ]),
)

export function getProposalDetailById(proposalId: string): ProposalDetail | null {
  return MOCK_PROPOSAL_DETAILS.get(proposalId) ?? null
}

export function getProposalDetailForUser(
  proposalId: string,
  userId: string | null,
  isAdmin: boolean,
): ProposalDetail | null {
  const detail = getProposalDetailById(proposalId)

  if (!detail) {
    return null
  }

  const accessibleIds = new Set(
    getProposalsForUser(userId, isAdmin).map((proposal) => proposal.id),
  )

  if (!accessibleIds.has(proposalId)) {
    return null
  }

  return detail
}
