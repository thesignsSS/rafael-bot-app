import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Checkbox } from '../../../components/ui/Checkbox'
import { Icon } from '../../../components/ui/Icon'
import type { PropertyType } from '../../home/types/proposal'
import type {
  AdvancedProposalFilters,
  ProposalDocumentFilter,
} from '../types/advanced-proposal-filters'
import { EMPTY_ADVANCED_PROPOSAL_FILTERS } from '../types/advanced-proposal-filters'
import type {
  ProposalStatus,
  ProposalStatusOption,
} from '../types/proposal-status'

type AdvancedProposalFiltersModalProps = {
  isOpen: boolean
  value: AdvancedProposalFilters
  brokerOptions: string[]
  clientsByBroker: Record<string, string[]>
  statusOptions: ProposalStatusOption[]
  propertyTypeOptions: PropertyType[]
  onClose: () => void
  onApply: (filters: AdvancedProposalFilters) => void
}

type MultiChoiceSectionProps<Value extends string> = {
  title: string
  emptyLabel: string
  options: Array<{ value: Value; label: string }>
  selectedValues: Value[]
  onToggle: (value: Value) => void
}

function MultiChoiceSection<Value extends string>({
  title,
  emptyLabel,
  options,
  selectedValues,
  onToggle,
}: MultiChoiceSectionProps<Value>) {
  return (
    <fieldset className="rounded-xl border border-outline-variant bg-surface p-4">
      <legend className="px-1 text-label-md font-semibold text-on-surface">
        {title}
      </legend>
      {options.length > 0 ? (
        <div className="mt-2 max-h-44 space-y-3 overflow-y-auto pr-2">
          {options.map((option) => (
            <Checkbox
              key={option.value}
              label={option.label}
              checked={selectedValues.includes(option.value)}
              onChange={() => onToggle(option.value)}
            />
          ))}
        </div>
      ) : (
        <p className="mt-2 text-body-sm text-on-surface-variant">{emptyLabel}</p>
      )}
    </fieldset>
  )
}

function toggleValue<Value extends string>(values: Value[], value: Value) {
  return values.includes(value)
    ? values.filter((currentValue) => currentValue !== value)
    : [...values, value]
}

export function AdvancedProposalFiltersModal({
  isOpen,
  value,
  brokerOptions,
  clientsByBroker,
  statusOptions,
  propertyTypeOptions,
  onClose,
  onApply,
}: AdvancedProposalFiltersModalProps) {
  const [draft, setDraft] = useState<AdvancedProposalFilters>(value)

  useEffect(() => {
    if (isOpen) {
      setDraft(value)
    }
  }, [isOpen, value])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const updateDraft = <Key extends keyof AdvancedProposalFilters>(
    key: Key,
    nextValue: AdvancedProposalFilters[Key],
  ) => setDraft((currentDraft) => ({ ...currentDraft, [key]: nextValue }))

  const clientOptions = draft.brokerName
    ? clientsByBroker[draft.brokerName] ?? []
    : []

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#131b2e]/55 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="advanced-proposal-filters-title"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[0px_24px_60px_rgba(0,0,0,0.25)]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-outline-variant px-6 py-5">
          <div>
            <h2
              id="advanced-proposal-filters-title"
              className="text-headline-lg font-semibold text-on-surface"
            >
              Filtros avançados
            </h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Combine múltiplas informações para refinar as propostas exibidas.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            aria-label="Fechar filtros avançados"
          >
            <Icon name="close" size={22} />
          </button>
        </header>

        <div className="overflow-y-auto p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="rounded-xl border border-outline-variant bg-surface p-4 text-label-md font-semibold text-on-surface">
              Nome do corretor
              <select
                value={draft.brokerName}
                onChange={(event) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    brokerName: event.target.value,
                    clientName: '',
                  }))
                }
                className="mt-3 h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md font-normal text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Todos os corretores</option>
                {brokerOptions.map((brokerName) => (
                  <option key={brokerName} value={brokerName}>
                    {brokerName}
                  </option>
                ))}
              </select>
            </label>

            <label className="rounded-xl border border-outline-variant bg-surface p-4 text-label-md font-semibold text-on-surface">
              Nome do cliente
              <select
                value={draft.clientName}
                disabled={!draft.brokerName}
                onChange={(event) => updateDraft('clientName', event.target.value)}
                className="mt-3 h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md font-normal text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-surface-container disabled:opacity-60"
              >
                <option value="">
                  {draft.brokerName
                    ? 'Todos os clientes do corretor'
                    : 'Selecione um corretor primeiro'}
                </option>
                {clientOptions.map((clientName) => (
                  <option key={clientName} value={clientName}>
                    {clientName}
                  </option>
                ))}
              </select>
            </label>

            <MultiChoiceSection<ProposalStatus>
              title="Situação"
              emptyLabel="Nenhuma situação disponível."
              options={statusOptions}
              selectedValues={draft.statuses}
              onToggle={(status) =>
                updateDraft('statuses', toggleValue(draft.statuses, status))
              }
            />

            <MultiChoiceSection<PropertyType>
              title="Tipo de imóvel"
              emptyLabel="Nenhum tipo de imóvel disponível."
              options={propertyTypeOptions.map((propertyType) => ({
                value: propertyType,
                label: propertyType,
              }))}
              selectedValues={draft.propertyTypes}
              onToggle={(propertyType) =>
                updateDraft(
                  'propertyTypes',
                  toggleValue(draft.propertyTypes, propertyType),
                )
              }
            />
          </div>

          <fieldset className="mt-4 rounded-xl border border-outline-variant bg-surface p-4">
            <legend className="px-1 text-label-md font-semibold text-on-surface">
              Data de criação
            </legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <label className="text-label-md font-medium text-on-surface">
                De
                <input
                  type="date"
                  value={draft.createdFrom}
                  onChange={(event) => {
                    const createdFrom = event.target.value
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      createdFrom,
                      createdTo:
                        createdFrom &&
                        (!currentDraft.createdTo || currentDraft.createdTo >= createdFrom)
                          ? currentDraft.createdTo
                          : '',
                    }))
                  }}
                  className="mt-2 h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="text-label-md font-medium text-on-surface">
                Até
                <input
                  type="date"
                  value={draft.createdTo}
                  min={draft.createdFrom || undefined}
                  disabled={!draft.createdFrom}
                  onChange={(event) => updateDraft('createdTo', event.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-surface-container disabled:opacity-60"
                />
              </label>
            </div>
            <p className="mt-3 text-body-sm text-on-surface-variant">
              Sem a data “Até”, serão exibidas todas as propostas criadas a partir da data “De”.
            </p>
          </fieldset>

          <div className="mt-4">
            <MultiChoiceSection<ProposalDocumentFilter>
              title="Outras informações — documentos"
              emptyLabel="Nenhuma opção disponível."
              options={[
                { value: 'with_documents', label: 'Com documentos' },
                { value: 'without_documents', label: 'Sem documentos' },
              ]}
              selectedValues={draft.documentFilters}
              onToggle={(documentFilter) =>
                updateDraft(
                  'documentFilters',
                  toggleValue(draft.documentFilters, documentFilter),
                )
              }
            />
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-outline-variant px-6 py-4 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => setDraft({ ...EMPTY_ADVANCED_PROPOSAL_FILTERS })}
            className="rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            Limpar filtros
          </button>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-primary transition-colors hover:bg-surface-container"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onApply(draft)}
              className="rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container"
            >
              Aplicar filtros
            </button>
          </div>
        </footer>
      </section>
    </div>,
    document.body,
  )
}
