import type { PropertyType } from '../../../home/types/proposal'
import type { ProposalEditDraft } from '../../hooks/useProposalDetailPage'

type ProposalEditFormProps = {
  draft: ProposalEditDraft
  isSaving: boolean
  onChange: <Field extends keyof ProposalEditDraft>(
    field: Field,
    value: ProposalEditDraft[Field],
  ) => void
  onCancel: () => void
  onSave: () => void
}

export function ProposalEditForm({
  draft,
  isSaving,
  onChange,
  onCancel,
  onSave,
}: ProposalEditFormProps) {
  return (
    <section className="mb-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
      <div className="mb-5 flex flex-col gap-1">
        <h3 className="text-headline-md font-semibold text-on-surface">
          Editar proposta
        </h3>
        <p className="text-body-sm text-on-surface-variant">
          Atualize os dados principais salvos no backend.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <EditField
          label="Nome do cliente"
          value={draft.clientName}
          onChange={(value) => onChange('clientName', value)}
        />
        <EditField
          label="CPF"
          value={draft.clientCpf}
          onChange={(value) => onChange('clientCpf', value)}
        />
        <EditField
          label="E-mail"
          value={draft.clientEmail}
          onChange={(value) => onChange('clientEmail', value)}
        />
        <EditField
          label="Telefone"
          value={draft.clientPhone}
          onChange={(value) => onChange('clientPhone', value)}
        />

        <label className="flex flex-col gap-1">
          <span className="text-label-sm font-medium text-on-surface-variant">
            Tipo do imóvel
          </span>
          <select
            value={draft.propertyType}
            onChange={(event) =>
              onChange('propertyType', event.target.value as PropertyType)
            }
            className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="Novo">Novo</option>
            <option value="Usado">Usado</option>
          </select>
        </label>

        <EditField
          label="Município"
          value={draft.propertyCity}
          onChange={(value) => onChange('propertyCity', value)}
        />
        <EditField
          label="UF"
          value={draft.propertyState}
          onChange={(value) => onChange('propertyState', value)}
        />

        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-label-sm font-medium text-on-surface-variant">
            Informações adicionais
          </span>
          <textarea
            value={draft.additionalInfo}
            onChange={(event) => onChange('additionalInfo', event.target.value)}
            rows={5}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>
    </section>
  )
}

type EditFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

function EditField({ label, value, onChange }: EditFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-label-sm font-medium text-on-surface-variant">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  )
}
