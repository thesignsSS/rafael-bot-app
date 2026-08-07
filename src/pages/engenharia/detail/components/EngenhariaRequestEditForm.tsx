import { Field } from '../../../../components/ui/Field'
import { Icon } from '../../../../components/ui/Icon'
import {
  ENGENHARIA_REQUEST_STATUS_OPTIONS,
  type EngenhariaRequestStatus,
} from '../../types/engenhariaRequest'
import { PROPERTY_KIND_OPTIONS, type PropertyKind } from '../../types/engenharia'

type EditDraft = {
  propertyKind: PropertyKind
  propertyValue: string
  contactPhone: string
  accompanyingName: string
  status: EngenhariaRequestStatus
}

type EngenhariaRequestEditFormProps = {
  draft: EditDraft
  isAdmin: boolean
  isSaving: boolean
  onChange: (updates: Partial<EditDraft>) => void
  onPropertyValueChange: (value: string) => void
  onContactPhoneChange: (value: string) => void
  onCancel: () => void
  onSave: () => void
}

export function EngenhariaRequestEditForm({
  draft,
  isAdmin,
  isSaving,
  onChange,
  onPropertyValueChange,
  onContactPhoneChange,
  onCancel,
  onSave,
}: EngenhariaRequestEditFormProps) {
  return (
    <div className="rounded-lg border border-primary/40 bg-surface-container-lowest p-5 shadow-sm sm:p-6">
      <h2 className="text-headline-md font-bold text-on-surface">
        Editar Solicitação
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Tipo de Imóvel" required>
          <select
            value={draft.propertyKind}
            onChange={(event) =>
              onChange({ propertyKind: event.target.value as PropertyKind })
            }
            className="proposal-input"
          >
            {PROPERTY_KIND_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Valor do Imóvel" required>
          <input
            value={draft.propertyValue}
            onChange={(event) => onPropertyValueChange(event.target.value)}
            placeholder="Ex.: 350.000,00"
            inputMode="numeric"
            className="proposal-input"
          />
        </Field>

        <Field label="Contato" required>
          <div className="relative">
            <Icon
              name="call"
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              value={draft.contactPhone}
              onChange={(event) => onContactPhoneChange(event.target.value)}
              placeholder="(00) 00000-0000"
              inputMode="tel"
              maxLength={15}
              className="proposal-input !pl-12"
            />
          </div>
        </Field>

        <Field label="Nome de quem irá acompanhar a engenharia" required>
          <input
            value={draft.accompanyingName}
            onChange={(event) => onChange({ accompanyingName: event.target.value })}
            placeholder="Ex.: João da Silva"
            className="proposal-input"
          />
        </Field>

        {isAdmin ? (
          <Field label="Situação" hint="somente admin">
            <select
              value={draft.status}
              onChange={(event) =>
                onChange({ status: event.target.value as EngenhariaRequestStatus })
              }
              className="proposal-input"
            >
              {ENGENHARIA_REQUEST_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-lg border border-outline px-4 py-2.5 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="rounded-lg bg-primary px-4 py-2.5 text-label-md font-semibold text-on-primary transition-all hover:bg-surface-tint disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>
    </div>
  )
}
