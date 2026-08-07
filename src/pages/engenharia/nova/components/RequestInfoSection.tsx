import { Field } from '../../../../components/ui/Field'
import { Icon } from '../../../../components/ui/Icon'
import { PROPERTY_KIND_OPTIONS, type PropertyKind } from '../../types/engenharia'

type RequestInfoSectionProps = {
  propertyKind: PropertyKind | ''
  propertyKindError: string
  propertyValue: string
  propertyValueError: string
  contact: string
  contactError: string
  accompanyingName: string
  accompanyingNameError: string
  onPropertyKindChange: (value: PropertyKind | '') => void
  onPropertyValueChange: (value: string) => void
  onContactChange: (value: string) => void
  onAccompanyingNameChange: (value: string) => void
}

export function RequestInfoSection({
  propertyKind,
  propertyKindError,
  propertyValue,
  propertyValueError,
  contact,
  contactError,
  accompanyingName,
  accompanyingNameError,
  onPropertyKindChange,
  onPropertyValueChange,
  onContactChange,
  onAccompanyingNameChange,
}: RequestInfoSectionProps) {
  return (
    <div>
      <h2 className="text-headline-md font-bold text-on-surface">
        Informações da Solicitação
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Tipo de Imóvel" required error={propertyKindError}>
          <select
            value={propertyKind}
            onChange={(event) =>
              onPropertyKindChange(event.target.value as PropertyKind | '')
            }
            aria-invalid={propertyKindError ? true : undefined}
            className={`proposal-input ${propertyKindError ? 'proposal-input-error' : ''}`}
          >
            <option value="">Selecione o tipo de imóvel</option>
            {PROPERTY_KIND_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Valor do Imóvel" required error={propertyValueError}>
          <input
            value={propertyValue}
            onChange={(event) => onPropertyValueChange(event.target.value)}
            placeholder="Ex.: 350.000,00"
            inputMode="numeric"
            aria-invalid={propertyValueError ? true : undefined}
            className={`proposal-input ${propertyValueError ? 'proposal-input-error' : ''}`}
          />
        </Field>

        <Field label="Contato" required error={contactError}>
          <div className="relative">
            <Icon
              name="call"
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              value={contact}
              onChange={(event) => onContactChange(event.target.value)}
              placeholder="(00) 00000-0000"
              inputMode="tel"
              maxLength={15}
              aria-invalid={contactError ? true : undefined}
              className={`proposal-input !pl-12 ${contactError ? 'proposal-input-error' : ''}`}
            />
          </div>
        </Field>

        <Field
          label="Nome de quem irá acompanhar a engenharia"
          required
          error={accompanyingNameError}
        >
          <input
            value={accompanyingName}
            onChange={(event) => onAccompanyingNameChange(event.target.value)}
            placeholder="Ex.: João da Silva"
            aria-invalid={accompanyingNameError ? true : undefined}
            className={`proposal-input ${accompanyingNameError ? 'proposal-input-error' : ''}`}
          />
        </Field>
      </div>
    </div>
  )
}
