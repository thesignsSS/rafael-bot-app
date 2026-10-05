import { useState, type RefObject } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { brazilianStates } from '../lib/proposalUtils'
import {
  PROPERTY_TYPE_OPTIONS,
  type IbgeCity,
  type PropertyType,
} from '../types/proposal'
import { Field } from '../../../components/ui/Field'
import { FormSection } from '../../../components/ui/FormSection'
import { formatReais } from '../../../lib/money'
import { PropertyPicker } from '../../imoveis/components/PropertyPicker'
import { PropertyStatusPill } from '../../imoveis/components/PropertyStatusPill'
import type { PropertyListItem } from '../../imoveis/lib/propertiesApi'

type PropertyDataSectionProps = {
  selectedProperty: PropertyListItem | null
  onPickProperty: (property: PropertyListItem | null) => void
  propertyType: PropertyType
  propertyState: string
  stateError: string
  city: string
  citySearch: string
  cityError: string
  citiesError: string
  isLoadingCities: boolean
  isCityDropdownOpen: boolean
  filteredCities: IbgeCity[]
  comboboxRef: RefObject<HTMLDivElement | null>
  onPropertyTypeChange: (type: PropertyType) => void
  onPropertyStateChange: (value: string) => void
  onCitySearchChange: (value: string) => void
  onOpenCityDropdown: () => void
  onToggleCityDropdown: () => void
  onSelectCity: (cityName: string) => void
}

export function PropertyDataSection({
  selectedProperty,
  onPickProperty,
  propertyType,
  propertyState,
  stateError,
  city,
  citySearch,
  cityError,
  citiesError,
  isLoadingCities,
  isCityDropdownOpen,
  filteredCities,
  comboboxRef,
  onPropertyTypeChange,
  onPropertyStateChange,
  onCitySearchChange,
  onOpenCityDropdown,
  onToggleCityDropdown,
  onSelectCity,
}: PropertyDataSectionProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <FormSection icon="home" title="Dados do Imóvel">
      <div className="grid gap-5">
        <SelectedPropertyField
          property={selectedProperty}
          onOpenPicker={() => setPickerOpen(true)}
          onClear={() => onPickProperty(null)}
        />
        {pickerOpen ? (
          <PropertyPicker
            context="proposta"
            selectedId={selectedProperty?.id}
            onPick={(property) => {
              onPickProperty(property)
              setPickerOpen(false)
            }}
            onClose={() => setPickerOpen(false)}
          />
        ) : null}
        <Field label="Tipo do Imóvel" required>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {PROPERTY_TYPE_OPTIONS.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onPropertyTypeChange(type)}
                className={`flex min-h-12 items-center gap-3 rounded-lg border px-4 py-2 text-label-md font-semibold transition-all ${
                  propertyType === type
                    ? 'border-primary bg-primary/10 text-primary shadow-[0_0_0_1px_rgba(0,74,198,0.18)]'
                    : 'border-outline bg-surface-container-lowest text-on-surface-variant hover:border-primary/60 hover:bg-surface-container-low'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    propertyType === type
                      ? 'border-primary bg-primary text-white'
                      : 'border-outline-variant'
                  }`}
                >
                  {propertyType === type ? (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  ) : null}
                </span>
                <span className="text-left leading-tight">{type}</span>
              </button>
            ))}
          </div>
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Estado do Imóvel" required error={stateError}>
            <select
              value={propertyState}
              onChange={(event) => onPropertyStateChange(event.target.value)}
              aria-invalid={stateError ? true : undefined}
              className={`proposal-input ${
                stateError ? 'proposal-input-error' : ''
              }`}
            >
              <option value="">Selecione o estado</option>
              {brazilianStates.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name} ({state.code})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Município do Imóvel" required error={cityError}>
            <div ref={comboboxRef} className="relative">
              <input
                type="text"
                value={citySearch}
                onChange={(event) => onCitySearchChange(event.target.value)}
                onFocus={onOpenCityDropdown}
                disabled={!propertyState}
                placeholder={
                  !propertyState
                    ? 'Selecione o estado primeiro'
                    : isLoadingCities
                    ? 'Carregando municípios...'
                    : 'Busque o município'
                }
                role="combobox"
                aria-expanded={isCityDropdownOpen}
                aria-controls="city-options"
                aria-autocomplete="list"
                aria-invalid={cityError ? true : undefined}
                className={`proposal-input pr-12 ${
                  cityError ? 'proposal-input-error' : ''
                }`}
              />
              <button
                type="button"
                onClick={onToggleCityDropdown}
                disabled={!propertyState}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-outline transition-colors hover:text-primary"
                aria-label="Abrir lista de municípios"
              >
                <Icon
                  name={
                    isCityDropdownOpen
                      ? 'keyboard_arrow_up'
                      : 'keyboard_arrow_down'
                  }
                  size={22}
                />
              </button>

              {isCityDropdownOpen ? (
                <div
                  id="city-options"
                  className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-xl"
                >
                  <div className="max-h-64 overflow-y-auto py-2">
                    {isLoadingCities ? (
                      <p className="px-4 py-3 text-body-md text-on-surface-variant">
                        Carregando municípios...
                      </p>
                    ) : citiesError ? (
                      <p className="px-4 py-3 text-body-md text-error">
                        {citiesError}
                      </p>
                    ) : filteredCities.length > 0 ? (
                      filteredCities.map((cityOption) => (
                        <button
                          key={cityOption.id}
                          type="button"
                          onClick={() => onSelectCity(cityOption.nome)}
                          className={`flex w-full items-center justify-between px-4 py-3 text-left text-body-md transition-colors hover:bg-surface-container-low ${
                            city === cityOption.nome
                              ? 'font-semibold text-primary'
                              : 'text-on-surface'
                          }`}
                        >
                          <span>{cityOption.nome}</span>
                          {city === cityOption.nome ? (
                            <Icon name="check" size={18} />
                          ) : null}
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-3 text-body-md text-on-surface-variant">
                        Nenhum município encontrado.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </Field>
        </div>
      </div>
    </FormSection>
  )
}

/** Imóvel cadastrado da proposta (BKL-093, 13.1 e 13.2): opcional; preenche UF e município. */
function SelectedPropertyField({
  property,
  onOpenPicker,
  onClear,
}: {
  property: PropertyListItem | null
  onOpenPicker: () => void
  onClear: () => void
}) {
  if (!property) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-label-md font-semibold text-on-surface">Imóvel cadastrado</p>
          <p className="text-body-sm text-on-surface-variant">
            Opcional. Escolha um imóvel da imobiliária ou cadastre um novo; UF e município vêm preenchidos.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenPicker}
          className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-primary px-4 text-sm font-semibold text-primary hover:bg-primary/5"
        >
          <Icon name="home_work" size={20} />
          Escolher imóvel
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">Imóvel da proposta</p>
        <p className="truncate text-label-md font-semibold text-on-surface">
          {property.street}
          {property.number ? `, ${property.number}` : ''} · {property.neighborhood}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-body-sm text-on-surface-variant">
          <span>
            {property.typeLabel} · {formatReais(property.salePrice)} · {property.referenceCode}
          </span>
          <PropertyStatusPill status={property.status} label={property.statusLabel} />
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onOpenPicker}
          className="min-h-11 rounded-lg border border-outline-variant px-4 text-sm font-semibold text-on-surface hover:border-primary"
        >
          Trocar imóvel
        </button>
        <button
          type="button"
          onClick={onClear}
          className="min-h-11 rounded-lg px-3 text-sm font-semibold text-on-surface-variant hover:text-error"
        >
          Remover
        </button>
      </div>
    </div>
  )
}
