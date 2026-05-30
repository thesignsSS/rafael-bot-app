import type { ProposalListItem } from '../types/proposal-list-item'

const SEED_PROPOSALS: ProposalListItem[] = [
  {
    id: 'RB-8291',
    clientName: 'João da Silva Santos',
    propertyType: 'Novo',
    createdAt: '2024-05-22T10:00:00.000Z',
  },
  {
    id: 'RB-8290',
    clientName: 'Maria Oliveira Souza',
    propertyType: 'Usado',
    createdAt: '2024-05-21T10:00:00.000Z',
  },
  {
    id: 'RB-8285',
    clientName: 'Pedro Henrique Gomes',
    propertyType: 'Novo',
    createdAt: '2024-05-19T10:00:00.000Z',
  },
  {
    id: 'RB-8272',
    clientName: 'Ana Luiza Ribeiro',
    propertyType: 'Usado',
    createdAt: '2024-05-15T10:00:00.000Z',
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

    proposals.push({
      id: `RB-${numericId}`,
      clientName: `${firstName} ${middleName} ${lastName}`,
      propertyType: index % 2 === 0 ? 'Novo' : 'Usado',
      createdAt: date.toISOString(),
    })
  }

  return proposals
}

export const MOCK_PROPOSALS = generateMockProposals()
