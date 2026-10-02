import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
import { formatReais } from '../../lib/money'
import { PropertyStatusPill } from './components/PropertyStatusPill'
import { PROPERTY_STATUS_OPTIONS } from './lib/propertyStatus'
import { fetchBrokers, fetchProperties, type PropertyListItem } from './lib/propertiesApi'
import { PROPERTY_TYPE_OPTIONS, type Broker } from './types'

const PAGE_SIZE = 50

type Filters = { q: string; status: string; type: string; responsibleBrokerId: string }
const EMPTY_FILTERS: Filters = { q: '', status: '', type: '', responsibleBrokerId: '' }

/** Seção 9 · protótipos 12 (celular) e 17 (computador). */
export default function ImoveisPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [debouncedQ, setDebouncedQ] = useState('')
  const [items, setItems] = useState<PropertyListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [state, setState] = useState<'loading' | 'ready' | 'error' | 'loading_more'>('loading')
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    fetchBrokers()
      .then(setBrokers)
      .catch(() => setBrokers([]))
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(filters.q.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [filters.q])

  const load = useCallback(
    async (targetPage: number) => {
      setState(targetPage === 1 ? 'loading' : 'loading_more')

      try {
        const result = await fetchProperties({
          q: debouncedQ,
          status: filters.status,
          type: filters.type,
          responsibleBrokerId: filters.responsibleBrokerId,
          page: targetPage,
          pageSize: PAGE_SIZE,
        })
        setItems((current) => (targetPage === 1 ? result.items : [...current, ...result.items]))
        setTotal(result.total)
        setPage(targetPage)
        setState('ready')
      } catch {
        setState('error')
      }
    },
    [debouncedQ, filters.responsibleBrokerId, filters.status, filters.type],
  )

  useEffect(() => {
    void load(1)
  }, [load, attempt])

  const hasFilters = Boolean(debouncedQ || filters.status || filters.type || filters.responsibleBrokerId)
  const setFilter = (key: keyof Filters, value: string) => setFilters((current) => ({ ...current, [key]: value }))

  return (
    <div className="mx-auto max-w-6xl pb-24 sm:pb-0">
      <section className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-xl font-bold text-on-surface">Imóveis</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            O cadastro único da imobiliária, usado em propostas, engenharias e anúncios.
          </p>
        </div>
        <Link
          to="/imoveis/novo"
          className="hidden h-[var(--control-height)] items-center gap-2 rounded-lg bg-primary-container px-5 text-sm font-semibold text-white shadow-sm hover:bg-primary sm:flex"
        >
          <Icon name="add" size={20} />
          Novo imóvel
        </Link>
      </section>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <label className="relative sm:col-span-4">
          <span className="sr-only">Buscar imóveis</span>
          <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={filters.q}
            onChange={(event) => setFilter('q', event.target.value)}
            placeholder="Buscar por endereço, bairro, código ou matrícula"
            className="proposal-input !pl-10"
          />
        </label>
        <FilterSelect label="Situação" value={filters.status} onChange={(v) => setFilter('status', v)}>
          <option value="">Todas, menos Inativo</option>
          {PROPERTY_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Tipo" value={filters.type} onChange={(v) => setFilter('type', v)}>
          <option value="">Todos os tipos</option>
          {PROPERTY_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Corretor" value={filters.responsibleBrokerId} onChange={(v) => setFilter('responsibleBrokerId', v)}>
          <option value="">Todos os corretores</option>
          {brokers.map((broker) => (
            <option key={broker.id} value={broker.id}>
              {broker.fullName ?? 'Sem nome'}
            </option>
          ))}
        </FilterSelect>
        <p className="flex items-end text-body-md text-on-surface-variant" aria-live="polite">
          {state === 'ready' || state === 'loading_more' ? `${total} ${total === 1 ? 'imóvel' : 'imóveis'}` : ''}
        </p>
      </div>

      {state === 'loading' ? (
        <div className="flex items-center gap-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-6 text-on-surface-variant">
          <Icon name="sync" size={22} className="animate-spin" />
          Carregando imóveis…
        </div>
      ) : null}

      {state === 'error' ? (
        <div className="rounded-lg border border-error/30 bg-error/5 p-6" role="alert">
          <p className="text-label-md font-semibold text-on-surface">Não foi possível carregar os imóveis.</p>
          <button type="button" onClick={() => setAttempt((v) => v + 1)} className="mt-3 min-h-11 font-semibold text-primary underline">
            Tentar de novo
          </button>
        </div>
      ) : null}

      {state === 'ready' && items.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon="search_off"
            title="Nenhum imóvel encontrado"
            text="Nada bate com a busca e os filtros escolhidos."
            action={
              <button
                type="button"
                onClick={() => {
                  setFilters(EMPTY_FILTERS)
                  setDebouncedQ('')
                }}
                className="min-h-11 font-semibold text-primary underline"
              >
                Limpar busca e filtros
              </button>
            }
          />
        ) : (
          <EmptyState
            icon="home_work"
            title="Nenhum imóvel cadastrado"
            text="Cadastre o imóvel uma vez e use os dados dele em propostas, engenharias e anúncios, sem digitar de novo."
            action={
              <Link to="/imoveis/novo" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-container px-5 font-semibold text-white">
                <Icon name="add" size={20} />
                Cadastrar imóvel
              </Link>
            }
          />
        )
      ) : null}

      {items.length > 0 && state !== 'loading' && state !== 'error' ? (
        <ul className="divide-y divide-outline-variant/60 overflow-hidden rounded-lg border border-outline-variant/60 bg-surface-container-lowest shadow-sm">
          {items.map((item) => (
            <PropertyRow key={item.id} item={item} onOpen={() => navigate(`/imoveis/${item.id}`)} />
          ))}
        </ul>
      ) : null}

      {items.length < total && state !== 'loading' && state !== 'error' ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            disabled={state === 'loading_more'}
            onClick={() => void load(page + 1)}
            className="min-h-11 rounded-lg border border-outline-variant px-6 font-semibold text-on-surface hover:border-primary disabled:opacity-60"
          >
            {state === 'loading_more' ? 'Carregando…' : 'Carregar mais'}
          </button>
        </div>
      ) : null}

      {/* Celular: ação principal em botão flutuante (9.8). */}
      <Link
        to="/imoveis/novo"
        aria-label="Novo imóvel"
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-white shadow-lg sm:hidden"
      >
        <Icon name="add" size={28} />
      </Link>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-label-sm font-semibold text-on-surface-variant">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="proposal-input">
        {children}
      </select>
    </label>
  )
}

function EmptyState({ icon, title, text, action }: { icon: string; title: string; text: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon name={icon} size={28} />
      </div>
      <p className="mt-4 text-headline-md font-semibold text-on-surface">{title}</p>
      <p className="mt-1 max-w-md text-body-md text-on-surface-variant">{text}</p>
      <div className="mt-4">{action}</div>
    </div>
  )
}

/** 9.2: miniatura de 40 px, endereço, bairro, tipo, valor, situação e indicador de anúncio. */
function PropertyRow({ item, onOpen }: { item: PropertyListItem; onOpen: () => void }) {
  const faded = item.status === 'vendido' || item.status === 'inativo'

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-container-low ${faded ? 'opacity-60' : ''}`}
      >
        {item.coverThumbnailUrl ? (
          <img src={item.coverThumbnailUrl} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-surface-container text-on-surface-variant" aria-label="Sem foto">
            —
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-label-md font-semibold text-on-surface">
            {item.street}
            {item.number ? `, ${item.number}` : ''}
          </span>
          <span className="block truncate text-body-sm text-on-surface-variant">
            {item.neighborhood} · {item.typeLabel} · {item.referenceCode}
          </span>
          <span className={`block truncate text-body-sm ${item.adReadiness.kind === 'ready' ? 'text-emerald-700' : 'text-on-surface-variant'}`}>
            {item.adReadinessLabel}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-label-md font-semibold text-on-surface">{formatReais(item.salePrice)}</span>
          <PropertyStatusPill status={item.status} label={item.statusLabel} />
        </span>
      </button>
    </li>
  )
}
