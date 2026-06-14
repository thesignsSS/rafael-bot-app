import { Icon } from '../../../components/ui/Icon'
import { Field } from './Field'
import { FormSection } from './FormSection'

type ClientDataSectionProps = {
  clientName: string
  clientCpf: string
  clientCpfError: string
  clientPhone: string
  clientPhoneError: string
  clientEmail: string
  emailError: string
  onClientNameChange: (value: string) => void
  onClientCpfChange: (value: string) => void
  onClientPhoneChange: (value: string) => void
  onClientEmailChange: (value: string) => void
  onValidateClientCpf: () => void
  onValidateClientPhone: () => void
  onValidateClientEmail: () => void
}

export function ClientDataSection({
  clientName,
  clientCpf,
  clientCpfError,
  clientPhone,
  clientPhoneError,
  clientEmail,
  emailError,
  onClientNameChange,
  onClientCpfChange,
  onClientPhoneChange,
  onClientEmailChange,
  onValidateClientCpf,
  onValidateClientPhone,
  onValidateClientEmail,
}: ClientDataSectionProps) {
  return (
    <FormSection icon="person" title="Dados do Cliente">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.3fr_0.8fr_1fr_1fr]">
        <Field label="Nome do Cliente" required>
          <input
            value={clientName}
            onChange={(event) => onClientNameChange(event.target.value)}
            placeholder="Digite o nome completo do cliente"
            className="proposal-input"
          />
        </Field>
        <Field label="CPF do Cliente" required error={clientCpfError}>
          <input
            value={clientCpf}
            onBlur={onValidateClientCpf}
            onChange={(event) => onClientCpfChange(event.target.value)}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            aria-invalid={clientCpfError ? true : undefined}
            className={`proposal-input ${
              clientCpfError ? 'proposal-input-error' : ''
            }`}
          />
        </Field>
        <Field label="Telefone do Cliente" required error={clientPhoneError}>
          <div className="relative">
            <input
              value={clientPhone}
              onBlur={onValidateClientPhone}
              onChange={(event) => onClientPhoneChange(event.target.value)}
              placeholder="(85) 99999-9999"
              inputMode="tel"
              maxLength={15}
              aria-invalid={clientPhoneError ? true : undefined}
              className={`proposal-input pr-12 ${
                clientPhoneError ? 'proposal-input-error' : ''
              }`}
            />
            <Icon
              name="chat"
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"
            />
          </div>
        </Field>
        <Field label="E-mail do Cliente" required error={emailError}>
          <div className="relative">
            <input
              type="email"
              value={clientEmail}
              onBlur={onValidateClientEmail}
              onChange={(event) => onClientEmailChange(event.target.value)}
              placeholder="cliente@email.com"
              aria-invalid={emailError ? true : undefined}
              className={`proposal-input pr-12 ${
                emailError ? 'proposal-input-error' : ''
              }`}
            />
            <Icon
              name="mail"
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-primary"
            />
          </div>
        </Field>
      </div>
    </FormSection>
  )
}
