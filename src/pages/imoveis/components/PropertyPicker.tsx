import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../../../components/ui/Icon'
import { formatReais } from '../../../lib/money'
import { blockedReason, fetchPickerProperties, type PropertyListItem } from '../lib/propertiesApi'
import type { Property } from '../types'
import { NewPropertyOverlay } from './NewPropertyOverlay'
import { PropertyStatusPill } from './PropertyStatusPill'

type Props = {
  /** "proposta" ou "engenharia", para os textos. */
  context: string
  /** Imóvel já escolhido: aparece marcado. */
  selectedId?: string | null
  onPick: (property: PropertyListItem) => void
  onClose: () => void
}

/** O imóvel recém-cadastrado no formato da linha do seletor. */
function toListItem(property: Property): PropertyListItem {
  return {
    id: property.id,
    referenceCode: property.referenceCode,
    street: property.address.street,
    number: property.address.number,
    neighborhood: property.address.neighborhood,
    municipality: property.address.municipality,
    state: property.address.state,
    type: property.type,
    typeLabel: property.typeLabel,
    salePrice: property.salePrice,
    status: property.status,
    statusLabel: property.statusLabel,
    responsibleBroker: property.responsibleBroker,
    coverThumbnailUrl: null,
    adReadiness: property.adReadiness ?? { kind: 'not_advertisable' },
    adReadinessLabel: property.adReadinessLabel ?? '',
    updatedAt: property.updatedAt,
  }
}

/**
 * Seletor de imóvel (13.2, protótipo 14): busca no topo, imóveis de todos os
 * corretores da empresa, Vendido e Inativo desabilitados com o motivo, e
 * "Cadastrar novo imóvel" fixo no rodapé.
 */
export function PropertyPicker({ context, selectedId, onPick, onClose }: Props) {
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [items, setItems] = useState<PropertyListItem[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const [reserved, setReserved] = useState<PropertyListItem | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(q.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [q])

  useEffect(() => {
    let active = true
    setState('loading')
    fetchPickerProperties(debouncedQ)
      .then((result) => {
        if (!active) return
        setItems(result.items)
        setState('ready')
      })
      .catch(() => active && setState('error'))

    return () => {
      active = false
    }
  }, [debouncedQ, attempt])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !creating) onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [creating, onClose])

  // 13.4: Reservado avisa e deixa seguir.
  const choose = (item: PropertyListItem) => (item.status === 'reservado' ? setReserved(item) : onPick(item))

  if (creating) {
    return <NewPropertyOverlay context={context} onSaved={(property) => onPick(toListItem(property))} onClose={() => setCreating(false)} />
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[85] flex items-stretch justify-center bg-[#131b2e]/70 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="seletor-imovel"
        className="flex w-full flex-col bg-surface-container-lowest sm:max-h-[85vh] sm:max-w-2xl sm:rounded-2xl sm:border sm:border-outline-variant sm:shadow-[0_28px_80px_rgba(0,0,0,0.32)]"
      >
        <header className="border-b border-outline-variant/60 p-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low"
            >
              <Icon name="arrow_back" size={22} />
            </button>
            <h2 id="seletor-imovel" className="text-headline-md font-semibold text-on-surface">
              Escolher imóvel
            </h2>
          </div>
          <label className="relative mt-3 block">
            <span className="sr-only">Buscar imóvel</span>
            <Icon name="search" size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              autoFocus
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Endereço, bairro, código ou empreendimento"
              className="proposal-input pl-10"
            />
          </label>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-2" aria-busy={state === 'loading'}>
          {state === 'loading' ? (
            <p className="p-4 text-body-md text-on-surface-variant">Carregando imóveis...</p>
          ) : state === 'error' ? (
            <div className="p-4">
              <p className="text-body-md text-error">Não foi possível carregar os imóveis.</p>
              <button type="button" onClick={() => setAttempt((n) => n + 1)} className="mt-2 text-label-md font-semibold text-primary">
                Tentar de novo
              </button>
            </div>
          ) : items.length === 0 ? (
            <p className="p-4 text-body-md text-on-surface-variant">
              {debouncedQ ? 'Nenhum imóvel encontrado com essa busca.' : 'Nenhum imóvel cadastrado ainda.'} Use “Cadastrar novo imóvel”.
            </p>
          ) : (
            <ul className="space-y-1">
              {items.map((item) => {
                const reason = blockedReason(item)
                const isSelected = item.id === selectedId

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={Boolean(reason)}
                      onClick={() => choose(item)}
                      aria-describedby={reason ? `motivo-${item.id}` : undefined}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-surface-container-low'
                      }`}
                    >
                      <PropertyThumb url={item.coverThumbnailUrl} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-label-md font-semibold text-on-surface">
                          {item.street}
                          {item.number ? `, ${item.number}` : ''}
                        </span>
                        <span className="block truncate text-body-sm text-on-surface-variant">
                          {item.neighborhood} · {item.municipality}/{item.state} · {item.typeLabel}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-2 text-body-sm">
                          <span className="font-semibold text-on-surface">{formatReais(item.salePrice)}</span>
                          <PropertyStatusPill status={item.status} label={item.statusLabel} />
                          <span className="text-on-surface-variant">{item.responsibleBroker.name ?? 'Sem nome'}</span>
                        </span>
                        {reason ? (
                          <span id={`motivo-${item.id}`} className="mt-1 block text-body-sm text-on-surface-variant">
                            {reason}
                          </span>
                        ) : null}
                      </span>
                      {isSelected ? <Icon name="check_circle" size={22} className="text-primary" /> : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <footer className="border-t border-outline-variant/60 p-4">
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex h-[var(--control-height)] w-full items-center justify-center gap-2 rounded-lg border border-primary text-sm font-semibold text-primary hover:bg-primary/5"
          >
            <Icon name="add_home" size={20} />
            Cadastrar novo imóvel
          </button>
        </footer>
      </section>

      {reserved ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#131b2e]/50 p-4" role="presentation">
          <section role="alertdialog" aria-modal="true" aria-labelledby="aviso-reservado" className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-xl">
            <h3 id="aviso-reservado" className="text-headline-md font-semibold text-on-surface">
              Imóvel reservado
            </h3>
            <p className="mt-3 text-body-md text-on-surface-variant">
              {reserved.street}
              {reserved.number ? `, ${reserved.number}` : ''} está Reservado. Você pode continuar: ao vincular à {context}, ele passa
              a Em proposta.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReserved(null)}
                className="h-10 rounded-lg border border-outline-variant px-4 text-sm font-semibold text-on-surface"
              >
                Escolher outro
              </button>
              <button
                type="button"
                onClick={() => onPick(reserved)}
                className="h-10 rounded-lg bg-primary-container px-4 text-sm font-semibold text-white"
              >
                Continuar com este imóvel
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>,
    document.body,
  )
}

function PropertyThumb({ url }: { url: string | null }) {
  return url ? (
    <img src={url} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
  ) : (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface-container text-outline">
      <Icon name="home" size={24} />
    </span>
  )
}
