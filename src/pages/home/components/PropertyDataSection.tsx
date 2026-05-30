import type { RefObject } from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { IbgeCity, PropertyType } from '../types/proposal'
import { Field } from './Field'
import { FormSection } from './FormSection'

type PropertyDataSectionProps = {
  propertyType: PropertyType
  city: string
  citySearch: string
  cityError: string
  citiesError: string
  isLoadingCities: boolean
  isCityDropdownOpen: boolean
  filteredCities: IbgeCity[]
  comboboxRef: RefObject<HTMLDivElement | null>
  onPropertyTypeChange: (type: PropertyType) => void
  onCitySearchChange: (value: string) => void
  onOpenCityDropdown: () => void
  onToggleCityDropdown: () => void
  onSelectCity: (cityName: string) => void
}

export function PropertyDataSection({
  propertyType,
  city,
  citySearch,
  cityError,
  citiesError,
  isLoadingCities,
  isCityDropdownOpen,
  filteredCities,
  comboboxRef,
  onPropertyTypeChange,
  onCitySearchChange,
  onOpenCityDropdown,
  onToggleCityDropdown,
  onSelectCity,
}: PropertyDataSectionProps) {
  return (
    <FormSection icon="home" title="Dados do Imóvel">
      <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]">
        <Field label="Tipo do Imóvel" required>
          <div className="grid grid-cols-2 gap-3">
            {(['Novo', 'Usado'] as PropertyType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onPropertyTypeChange(type)}
                className={`flex h-12 items-center gap-3 rounded-lg border px-4 text-label-md font-semibold transition-all ${
                  propertyType === type
                    ? 'border-primary bg-blue-50 text-primary shadow-sm'
                    : 'border-outline-variant bg-white text-on-surface-variant hover:border-primary/60'
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
                {type}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Município do Imóvel" required error={cityError}>
          <div ref={comboboxRef} className="relative">
            <input
              type="text"
              value={citySearch}
              onChange={(event) => onCitySearchChange(event.target.value)}
              onFocus={onOpenCityDropdown}
              placeholder={
                isLoadingCities
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
                className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-lg border border-outline-variant bg-white shadow-xl"
              >
                <div className="max-h-64 overflow-y-auto py-2">
                  {isLoadingCities ? (
                    <p className="px-4 py-3 text-body-md text-on-surface-variant">
                      Carregando municípios do Ceará...
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
                        className={`flex w-full items-center justify-between px-4 py-3 text-left text-body-md transition-colors hover:bg-blue-50 ${
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
    </FormSection>
  )
}
