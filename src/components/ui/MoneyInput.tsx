import { centsFromTyping, formatCents } from '../../lib/money'

type MoneyInputProps = {
  /** Valor em centavos, como o DESIGN.md pede para o campo de reais. */
  valueCents: number
  onChange: (cents: number) => void
  hasError?: boolean
  disabled?: boolean
  id?: string
  ariaLabel?: string
}

/** Campo de valor em reais (DESIGN.md): digitação estilo caixa eletrônico. */
export function MoneyInput({ valueCents, onChange, hasError = false, disabled, id, ariaLabel }: MoneyInputProps) {
  return (
    <input
      id={id}
      value={valueCents ? formatCents(valueCents) : ''}
      onChange={(event) => onChange(centsFromTyping(event.target.value))}
      placeholder="R$ 0,00"
      inputMode="numeric"
      disabled={disabled}
      aria-label={ariaLabel}
      aria-invalid={hasError ? true : undefined}
      className={`proposal-input ${hasError ? 'proposal-input-error' : ''}`}
    />
  )
}
