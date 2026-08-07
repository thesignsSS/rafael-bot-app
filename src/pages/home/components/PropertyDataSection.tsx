import type { RefObject } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { brazilianStates } from '../lib/proposalUtils'
import {
  PROPERTY_TYPE_OPTIONS,
  type IbgeCity,
  type PropertyType,
} from '../types/proposal'
import { Field } from '../../../components/ui/Field'
import { FormSection } from '../../../components/ui/FormSection'

type PropertyDataSectionProps = {
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
  return (
    <FormSection icon="home" title="Dados do Imóvel">
      <div className="grid gap-5">
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
