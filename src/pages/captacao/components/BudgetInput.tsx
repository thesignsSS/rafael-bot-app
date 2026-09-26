import { centsFromTyping, formatCents } from '../lib/captacaoFormat'

type BudgetInputProps = {
  valueCents: number
  onChange: (cents: number) => void
  hasError?: boolean
}

export function BudgetInput({ valueCents, onChange, hasError = false }: BudgetInputProps) {
  return (
    <input
      value={valueCents ? formatCents(valueCents) : ''}
      onChange={(event) => onChange(centsFromTyping(event.target.value))}
      placeholder="R$ 0,00"
      inputMode="numeric"
      aria-invalid={hasError ? true : undefined}
      className={`proposal-input ${hasError ? 'proposal-input-error' : ''}`}
    />
  )
}
