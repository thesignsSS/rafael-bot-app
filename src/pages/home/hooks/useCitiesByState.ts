import { useEffect, useState } from 'react'
import type { IbgeCity } from '../types/proposal'
import { getIbgeCitiesUrlByState } from '../lib/proposalUtils'

const citiesCache = new Map<string, IbgeCity[]>()
const inflightRequests = new Map<string, Promise<IbgeCity[]>>()

export function useCitiesByState(stateCode: string) {
  const [cities, setCities] = useState<IbgeCity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const trimmedStateCode = stateCode.trim()
    let isCancelled = false

    if (!trimmedStateCode) {
      setCities([])
      setIsLoading(false)
      setError('')
      return
    }

    const citiesUrl = getIbgeCitiesUrlByState(trimmedStateCode)

    if (!citiesUrl) {
      setCities([])
      setIsLoading(false)
      setError('Não foi possível identificar os municípios do estado selecionado.')
      return
    }

    const resolvedCitiesUrl = citiesUrl
    const cachedCities = citiesCache.get(trimmedStateCode)

    if (cachedCities) {
      setCities(cachedCities)
      setIsLoading(false)
      setError('')
      return
    }

    async function loadCities() {
      try {
        setIsLoading(true)
        const existingRequest = inflightRequests.get(trimmedStateCode)
        const citiesRequest =
          existingRequest ??
          fetch(resolvedCitiesUrl, {
          })
            .then(async (response) => {
              if (!response.ok) {
                throw new Error('IBGE request failed')
              }

              const ibgeCities = (await response.json()) as IbgeCity[]
              return [...ibgeCities].sort((firstCity, secondCity) =>
                firstCity.nome.localeCompare(secondCity.nome, 'pt-BR'),
              )
            })
            .finally(() => {
              inflightRequests.delete(trimmedStateCode)
            })

        if (!existingRequest) {
          inflightRequests.set(trimmedStateCode, citiesRequest)
        }

        const sortedCities = await citiesRequest

        citiesCache.set(trimmedStateCode, sortedCities)

        if (isCancelled) {
          return
        }

        setCities(sortedCities)
        setError('')
      } catch (fetchError) {
        if (isCancelled) {
          return
        }

        setCities([])
        setError('Não foi possível carregar os municípios do IBGE.')
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadCities()

    return () => {
      isCancelled = true
    }
  }, [stateCode])

  return { cities, isLoading, error }
}
