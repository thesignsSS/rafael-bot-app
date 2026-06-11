import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { normalizeSearchText } from '../lib/proposalUtils'
import { validateCityValue, validateStateValue } from '../lib/proposalValidation'
import { useCitiesByState } from './useCitiesByState'

export function useCityCombobox(selectedState: string) {
  const { cities, isLoading, error: citiesError } = useCitiesByState(selectedState)
  const [city, setCity] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [cityError, setCityError] = useState('')
  const [stateError, setStateError] = useState('')
  const comboboxRef = useRef<HTMLDivElement>(null)
  const previousStateRef = useRef(selectedState)

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

  useEffect(() => {
    if (previousStateRef.current === selectedState) {
      return
    }

    const previousState = previousStateRef.current
    previousStateRef.current = selectedState

    if (!previousState) {
      return
    }

    setCity('')
    setCitySearch('')
    setCityError('')
    setIsDropdownOpen(false)
  }, [selectedState])

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

  const restoreCity = useCallback((cityName: string) => {
    setCity(cityName)
    setCitySearch(cityName)
    setCityError('')
    setIsDropdownOpen(false)
  }, [])

  const handleCitySearchChange = useCallback(
    (value: string) => {
      if (!selectedState.trim()) {
        setStateError(validateStateValue(selectedState) ?? '')
        return
      }

      setCitySearch(value)
      setCity('')
      setCityError('')
      setIsDropdownOpen(true)
    },
    [selectedState],
  )

  const openCityDropdown = useCallback(() => {
    if (!selectedState.trim()) {
      setStateError(validateStateValue(selectedState) ?? '')
      return
    }

    setIsDropdownOpen(true)
  }, [selectedState])

  const toggleCityDropdown = useCallback(() => {
    setIsDropdownOpen((currentState) => !currentState)
  }, [])

  const validateCity = useCallback(() => {
    const error = validateCityValue(city)
    setCityError(error ?? '')
    return error === null
  }, [city])

  const validateState = useCallback(() => {
    const error = validateStateValue(selectedState)
    setStateError(error ?? '')
    return error === null
  }, [selectedState])

  const cityLabel = city || 'Selecione o município'

  return {
    city,
    citySearch,
    cityError,
    stateError,
    citiesError,
    isLoadingCities: isLoading,
    isCityDropdownOpen: isDropdownOpen,
    filteredCities,
    comboboxRef,
    cityLabel,
    selectCity,
    restoreCity,
    handleCitySearchChange,
    openCityDropdown,
    toggleCityDropdown,
    validateCity,
    validateState,
  }
}
