const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatCents(cents: number) {
  return brl.format(cents / 100)
}

export function formatReais(value: number) {
  return brl.format(value)
}

/** Digitação estilo caixa eletrônico: só dígitos, os dois últimos são centavos. */
export function centsFromTyping(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 13)

  return digits ? Number(digits) : 0
}
