import type { ProposalBank } from '../types/proposal'
import { Field } from './Field'
import { FormSection } from './FormSection'

const BANK_OPTIONS: ProposalBank[] = [
  'Caixa',
  'Bradesco',
  'Itaú',
  'Santander',
  'Inter',
  'Todos',
]

type BankSelectionSectionProps = {
  selectedBank: ProposalBank | ''
  bankError: string
  onSelectedBankChange: (value: ProposalBank | '') => void
}

export function BankSelectionSection({
  selectedBank,
  bankError,
  onSelectedBankChange,
}: BankSelectionSectionProps) {
  return (
    <FormSection
      icon="account_balance"
      title="Banco da Proposta"
      description="Escolha o banco ou marque todos para uma proposta sem restrição específica."
    >
      <div className="max-w-md">
        <Field label="Escolha o banco" required error={bankError}>
          <select
            value={selectedBank}
            onChange={(event) =>
              onSelectedBankChange(event.target.value as ProposalBank | '')
            }
            aria-invalid={bankError ? true : undefined}
            className={`proposal-input ${bankError ? 'proposal-input-error' : ''}`}
          >
            <option value="">Selecione o banco</option>
            {BANK_OPTIONS.map((bank) => (
              <option key={bank} value={bank}>
                {bank}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </FormSection>
  )
}
