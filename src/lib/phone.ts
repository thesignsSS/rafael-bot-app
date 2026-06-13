export function formatBrazilianPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (!digits) {
    return ''
  }

  if (digits.length <= 2) {
    return `(${digits}`
  }

  const areaCode = digits.slice(0, 2)

  if (digits.length <= 6) {
    return `(${areaCode}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${areaCode}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${areaCode}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}
