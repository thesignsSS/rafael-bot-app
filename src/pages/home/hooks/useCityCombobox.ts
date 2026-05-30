import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { normalizeSearchText } from '../lib/proposalUtils'
import { validateCityValue } from '../lib/proposalValidation'
import { useCearaCities } from './useCearaCities'

export function useCityCombobox() {
  const { cities, isLoading, error: citiesError } = useCearaCities()
  const [city, setCity] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [cityError, setCityError] = useState('')
  const comboboxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        comboboxRef.current &&
        !comboboxRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCities = useMemo(() => {
    const normalizedSearch = normalizeSearchText(citySearch.trim())

    if (!normalizedSearch) {
      return cities
    }

    return cities.filter((cityOption) =>
      normalizeSearchText(cityOption.nome).includes(normalizedSearch),
    )
  }, [cities, citySearch])

  const selectCity = useCallback((cityName: string) => {
    setCity(cityName)
    setCitySearch(cityName)
    setCityError('')
    setIsDropdownOpen(false)
  }, [])

  const handleCitySearchChange = useCallback(
    (value: string) => {
      setCitySearch(value)
      setCity('')
      setCityError('')
      setIsDropdownOpen(true)
    },
    [],
  )

  const openCityDropdown = useCallback(() => {
    setIsDropdownOpen(true)
  }, [])

  const toggleCityDropdown = useCallback(() => {
    setIsDropdownOpen((currentState) => !currentState)
  }, [])

  const validateCity = useCallback(() => {
    const error = validateCityValue(city)
    setCityError(error ?? '')
    return error === null
  }, [city])

  const cityLabel = city || 'Selecione o município'

  return {
    city,
    citySearch,
    cityError,
    citiesError,
    isLoadingCities: isLoading,
    isCityDropdownOpen: isDropdownOpen,
    filteredCities,
    comboboxRef,
    cityLabel,
    selectCity,
    handleCitySearchChange,
    openCityDropdown,
    toggleCityDropdown,
    validateCity,
  }
}
