import type { ProposalListItem } from '../types/proposal-list-item'

export const MOCK_OWNER_A = '11111111-1111-4111-8111-111111111111'
export const MOCK_OWNER_B = '22222222-2222-4222-8222-222222222222'
export const MOCK_OWNER_C = '33333333-3333-4333-8333-333333333333'

export const MOCK_OWNER_IDS = [MOCK_OWNER_A, MOCK_OWNER_B, MOCK_OWNER_C] as const

const MOCK_OWNER_NAMES: Record<(typeof MOCK_OWNER_IDS)[number], string> = {
  [MOCK_OWNER_A]: 'Rafael Mendes',
  [MOCK_OWNER_B]: 'Carla Souza',
  [MOCK_OWNER_C]: 'Bruno Alves',
}

const pickMockOwnerId = (index: number): string =>
  MOCK_OWNER_IDS[index % MOCK_OWNER_IDS.length]

const pickMockOwnerName = (ownerId: string): string =>
  MOCK_OWNER_NAMES[ownerId as (typeof MOCK_OWNER_IDS)[number]] ?? 'Corretor'

const SEED_PROPOSALS: ProposalListItem[] = [
  {
    id: 'RB-8291',
    clientName: 'João da Silva Santos',
    propertyType: 'Novo',
    createdAt: '2024-05-22T10:00:00.000Z',
    ownerId: MOCK_OWNER_A,
    ownerName: MOCK_OWNER_NAMES[MOCK_OWNER_A],
  },
  {
    id: 'RB-8290',
    clientName: 'Maria Oliveira Souza',
    propertyType: 'Usado',
    createdAt: '2024-05-21T10:00:00.000Z',
    ownerId: MOCK_OWNER_B,
    ownerName: MOCK_OWNER_NAMES[MOCK_OWNER_B],
  },
  {
    id: 'RB-8285',
    clientName: 'Pedro Henrique Gomes',
    propertyType: 'Novo',
    createdAt: '2024-05-19T10:00:00.000Z',
    ownerId: MOCK_OWNER_C,
    ownerName: MOCK_OWNER_NAMES[MOCK_OWNER_C],
  },
  {
    id: 'RB-8272',
    clientName: 'Ana Luiza Ribeiro',
    propertyType: 'Usado',
    createdAt: '2024-05-15T10:00:00.000Z',
    ownerId: MOCK_OWNER_A,
    ownerName: MOCK_OWNER_NAMES[MOCK_OWNER_A],
  },
]

const FIRST_NAMES = [
  'Carlos',
  'Fernanda',
  'Ricardo',
  'Juliana',
  'Marcos',
  'Patricia',
  'Lucas',
  'Camila',
  'Bruno',
  'Larissa',
]

const LAST_NAMES = [
  'Almeida',
  'Costa',
  'Ferreira',
  'Lima',
  'Moura',
  'Nascimento',
  'Pereira',
  'Rocha',
  'Teixeira',
  'Vieira',
]

const generateMockProposals = (): ProposalListItem[] => {
  const proposals: ProposalListItem[] = [...SEED_PROPOSALS]
  const baseDate = new Date('2024-05-14T10:00:00.000Z')

  for (let index = 4; index < 128; index += 1) {
    const firstName = FIRST_NAMES[index % FIRST_NAMES.length]
    const lastName = LAST_NAMES[(index * 3) % LAST_NAMES.length]
    const middleName = LAST_NAMES[(index * 7) % LAST_NAMES.length]
    const numericId = 8272 - (index - 3)
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() - (index - 3))

    const ownerId = pickMockOwnerId(index)

    proposals.push({
      id: `RB-${numericId}`,
      clientName: `${firstName} ${middleName} ${lastName}`,
      propertyType: index % 2 === 0 ? 'Novo' : 'Usado',
      createdAt: date.toISOString(),
      ownerId,
      ownerName: pickMockOwnerName(ownerId),
    })
  }

  return proposals
}

export const MOCK_PROPOSALS = generateMockProposals()

export function resolveMockOwnerId(userId: string): string {
  let hash = 0

  for (const char of userId) {
    hash = (hash + char.charCodeAt(0)) % MOCK_OWNER_IDS.length
  }

  return MOCK_OWNER_IDS[hash]
}

export function getProposalsForUser(
  userId: string | null,
  isAdmin: boolean,
): ProposalListItem[] {
  if (isAdmin) {
    return MOCK_PROPOSALS
  }

  if (!userId) {
    return []
  }

  const effectiveOwnerId = resolveMockOwnerId(userId)

  return MOCK_PROPOSALS.filter(
    (proposal) => proposal.ownerId === effectiveOwnerId,
  )
}
