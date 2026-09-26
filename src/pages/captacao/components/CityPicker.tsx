import { useEffect, useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { searchCities, type MetaCity } from '../lib/captacaoApi'

type CityPickerProps = {
  userId: string
  value: MetaCity | null
  onChange: (city: MetaCity | null) => void
}

export function CityPicker({ userId, value, onChange }: CityPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MetaCity[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const term = query.trim()
    if (value || term.length < 2) {
      setResults([])
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      setIsSearching(true)
      searchCities(userId, term)
        .then((items) => {
          if (!cancelled) setResults(items)
        })
        .catch(() => {
          if (!cancelled) setResults([])
        })
        .finally(() => {
          if (!cancelled) setIsSearching(false)
        })
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query, userId, value])

  if (value) {
    return (
      <div className="flex h-[var(--control-height)] items-center justify-between rounded-lg border border-primary/40 bg-primary/5 px-4 text-body-md text-on-surface">
        <span className="truncate">
          {value.name}
          {value.region ? <span className="text-on-surface-variant"> · {value.region}</span> : null}
        </span>
        <button
          type="button"
          onClick={() => {
            onChange(null)
            setQuery('')
          }}
          aria-label="Trocar cidade"
          className="text-on-surface-variant transition-colors hover:text-error"
        >
          <Icon name="close" size={18} />
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <Icon
        name="location_on"
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
      />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Digite a cidade (ex.: Belém)"
        className="proposal-input !pl-12"
      />
      {isSearching ? (
        <Icon
          name="sync"
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-on-surface-variant"
        />
      ) : null}
      {results.length > 0 ? (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-outline-variant bg-surface-container-lowest py-1 shadow-lg">
          {results.map((city) => (
            <li key={city.key}>
              <button
                type="button"
                onClick={() => onChange(city)}
                className="w-full px-4 py-2 text-left text-body-md text-on-surface hover:bg-surface-container-low"
              >
                {city.name}
                {city.region ? (
                  <span className="text-on-surface-variant"> · {city.region}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
