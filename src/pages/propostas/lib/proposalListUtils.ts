export const formatProposalId = (id: string) => `#${id}`

export const formatCreatedAt = (isoDate: string) => {
  const date = new Date(isoDate)

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const normalizeProposalSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
