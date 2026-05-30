import { useEffect, useState } from 'react'
import type { IbgeCity } from '../types/proposal'
import { ibgeCearaCitiesUrl } from '../lib/proposalUtils'

export function useCearaCities() {
  const [cities, setCities] = useState<IbgeCity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadCearaCities() {
      try {
        const response = await fetch(ibgeCearaCitiesUrl, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('IBGE request failed')
        }

        const ibgeCities = (await response.json()) as IbgeCity[]
        const sortedCities = [...ibgeCities].sort((firstCity, secondCity) =>
          firstCity.nome.localeCompare(secondCity.nome, 'pt-BR'),
        )

        setCities(sortedCities)
        setError('')
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          return
        }

        setError('Não foi possível carregar os municípios do IBGE.')
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadCearaCities()

    return () => controller.abort()
  }, [])

  return { cities, isLoading, error }
}
