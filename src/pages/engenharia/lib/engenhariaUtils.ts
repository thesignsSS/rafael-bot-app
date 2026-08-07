export function parsePropertyValueToNumber(value: string): number {
  const normalized = value.replace(/\./g, '').replace(',', '.')

  return Number(normalized)
}

export function formatPropertyValueInput(value: string): string {
  const digits = value.replace(/\D/g, '')

  if (!digits) {
    return ''
  }

  const amount = Number(digits) / 100

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatCreatedAt(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
