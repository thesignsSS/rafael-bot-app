import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Icon } from '../../../components/ui/Icon'
import { formatReais } from '../../../lib/money'
import { ChangeStatusModal } from '../components/ChangeStatusModal'
import { PropertyActionsCard } from '../components/PropertyActionsCard'
import { PropertyPhotosSection } from '../components/PropertyPhotosSection'
import { PropertyStatusPill } from '../components/PropertyStatusPill'
import { usePropertyPhotos } from '../hooks/usePropertyPhotos'
import { describeEvent, formatDate, formatDateTime } from '../lib/historyLabels'
import {
  PropertyApiError,
  changeStatus,
  fetchHistory,
  fetchProperty,
  type PropertyHistoryItem,
} from '../lib/propertiesApi'
import type { Property, PropertyStatus } from '../types'

type LoadState =
  | { kind: 'loading' }
  | { kind: 'error'; notFound: boolean }
  | { kind: 'ready'; property: Property }

/** Seção 10 · protótipos 22, 23 (outro corretor) e 26 (computador). */
export default function ImovelDetalhePage() {
  const { propertyId = '' } = useParams()
  const navigate = useNavigate()
  const [state, setState] = useState<LoadState>({ kind: 'loading' })
  const [history, setHistory] = useState<PropertyHistoryItem[] | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [changingStatus, setChangingStatus] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const photos = usePropertyPhotos(propertyId)

  const loadHistory = useCallback(() => {
    fetchHistory(propertyId)
      .then(setHistory)
      .catch(() => setHistory([]))
  }, [propertyId])

  useEffect(() => {
    let cancelled = false
    setState({ kind: 'loading' })

    fetchProperty(propertyId)
      .then((property) => !cancelled && setState({ kind: 'ready', property }))
      .catch((error: unknown) => {
        if (!cancelled) setState({ kind: 'error', notFound: error instanceof PropertyApiError && error.status === 404 })
      })
    loadHistory()

    return () => {
      cancelled = true
    }
  }, [propertyId, attempt, loadHistory])

  const handleStatus = async (status: PropertyStatus) => {
    setSavingStatus(true)

    try {
      const property = await changeStatus(propertyId, status)
      setState({ kind: 'ready', property })
      setChangingStatus(false)
      toast.success(`Situação alterada para ${property.statusLabel}`)
      loadHistory()
    } catch (error) {
      toast.error(
        error instanceof PropertyApiError
          ? (Object.values(error.fields)[0] ?? error.message)
          : 'Não foi possível alterar a situação. Tente de novo.',
      )
    } finally {
      setSavingStatus(false)
    }
  }

  const handleActionDone = (updated?: Property) => {
    if (updated) setState({ kind: 'ready', property: updated })
    else setAttempt((value) => value + 1)
    loadHistory()
  }

  if (state.kind === 'loading') {
    return (
      <div className="mx-auto flex max-w-6xl items-center gap-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-6 text-on-surface-variant">
        <Icon name="sync" size={22} className="animate-spin" />
        Carregando imóvel…
      </div>
    )
  }

  if (state.kind === 'error') {
    return (
      <div className="mx-auto max-w-6xl rounded-lg border border-error/30 bg-error/5 p-6" role="alert">
        {/* Inexistente ou de outra empresa: a mesma mensagem, sem dizer se existe (10.13). */}
        <p className="text-label-md font-semibold text-on-surface">
          {state.notFound ? 'Imóvel não encontrado' : 'Não foi possível carregar o imóvel.'}
        </p>
        {state.notFound ? (
          <Link to="/imoveis" className="mt-3 inline-flex min-h-11 items-center font-semibold text-primary underline">
            Voltar para a lista
          </Link>
        ) : (
          <button type="button" onClick={() => setAttempt((v) => v + 1)} className="mt-3 min-h-11 font-semibold text-primary underline">
            Tentar de novo
          </button>
        )}
      </div>
    )
  }

  const { property } = state
  const { address, permissions } = property
  const blocked = property.status === 'vendido' || property.status === 'inativo'
  const lastStatusChange = history?.find((event) => event.kind === 'status_changed') ?? history?.find((e) => e.kind === 'created')

  const proposalButton = permissions.canUseInProposal ? (
    blocked ? (
      // 10.10: em Vendido e Inativo o botão explica em vez de falhar em silêncio.
      <div className="rounded-lg border border-outline-variant bg-surface-container p-3 text-body-md text-on-surface-variant">
        <p className="font-semibold text-on-surface">Criar proposta com este imóvel</p>
        Altere a situação antes. Imóvel {property.statusLabel.toLowerCase()} não entra em proposta nova.
      </div>
    ) : (
      <Link
        to={`/?imovel=${property.id}`}
        className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary-container px-5 text-sm font-semibold text-white shadow-sm hover:bg-primary"
      >
        <Icon name="note_add" size={20} />
        Criar proposta com este imóvel
      </Link>
    )
  ) : null

  return (
    <div className="mx-auto max-w-6xl pb-10">
      <button
        type="button"
        onClick={() => navigate('/imoveis')}
        className="mb-4 flex min-h-11 items-center gap-1 text-label-md font-medium text-on-surface-variant hover:text-primary"
      >
        <Icon name="arrow_back" size={18} />
        Imóveis
      </button>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Coluna principal (esquerda no computador). */}
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <h1 className="text-headline-lg font-bold text-on-surface">
              {address.street}
              {address.number ? `, ${address.number}` : ''}
              {address.complement ? `, ${address.complement}` : ''}
            </h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              {address.neighborhood} · {address.municipality}/{address.state}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-body-sm text-on-surface-variant">
              <PropertyStatusPill status={property.status} label={property.statusLabel} />
              <span>{property.typeLabel}</span>
              <span>·</span>
              <span>{property.referenceCode}</span>
            </div>
            <p className="mt-3 text-headline-xl font-bold text-on-surface">{formatReais(property.salePrice)}</p>
            <div className="mt-4 lg:hidden">{proposalButton}</div>
          </Card>

          <div className="space-y-5 lg:hidden">
            <StatusCard property={property} lastChange={lastStatusChange} onChange={() => setChangingStatus(true)} />
            <AdCard property={property} />
          </div>

          <Card title="Dados do imóvel">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              <Data label="Corretor responsável" value={property.responsibleBroker.name} />
              <Data label="Tipo" value={property.typeLabel} />
              <Data label="Área privativa" value={property.privateAreaM2 ? `${property.privateAreaM2} m²` : null} />
              <Data label="Área total" value={property.totalAreaM2 ? `${property.totalAreaM2} m²` : null} />
              <Data label="Matrícula" value={property.registrationNumber} />
              <Data
                label="Avaliação"
                value={
                  property.appraisal
                    ? `${formatReais(property.appraisal.value)} · válida até ${formatDate(property.appraisal.validUntil)}`
                    : 'Não possui'
                }
              />
              <Data label="Empreendimento" value={property.developmentName} />
              <Data label="CEP" value={address.postalCode} />
            </dl>
            <div className="mt-4 border-t border-outline-variant/60 pt-3">
              <p className="text-body-sm text-on-surface-variant">Observações internas</p>
              <p className="mt-1 whitespace-pre-line text-body-md text-on-surface">{property.internalNotes ?? '—'}</p>
            </div>
          </Card>

          <Card title="Vendedores">
            {permissions.canViewSellers ? (
              <p className="text-body-md text-on-surface-variant">Nenhum vendedor vinculado.</p>
            ) : (
              // 10.7: outro corretor não vê nem o nome do vendedor.
              <p className="text-body-md text-on-surface-variant">
                Só o corretor responsável e o administrador veem os vendedores deste imóvel.
              </p>
            )}
          </Card>

          <PropertyPhotosSection
            controller={photos}
            readOnly
            emptyAction={
              permissions.canEdit ? (
                <Link to={`/imoveis/${property.id}/editar`} className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline">
                  <Icon name="add_photo_alternate" size={18} />
                  Incluir fotos
                </Link>
              ) : undefined
            }
          />

          <Card title="Histórico">
            {history === null ? (
              <p className="text-body-md text-on-surface-variant">Carregando…</p>
            ) : history.length === 0 ? (
              <p className="text-body-md text-on-surface-variant">Sem registros.</p>
            ) : (
              <ul className="divide-y divide-outline-variant/60">
                {history.map((event) => (
                  <li key={event.id} className="flex flex-wrap justify-between gap-2 py-2 text-body-md">
                    <span className="text-on-surface">
                      {describeEvent(event)}
                      <span className="text-on-surface-variant">, por {event.actorName ?? 'Sistema'}</span>
                    </span>
                    <span className="text-body-sm text-on-surface-variant">{formatDateTime(event.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Coluna de ações (direita no computador). */}
        <div className="hidden space-y-5 lg:block">
          <Card>
            <div className="space-y-2">
              {proposalButton}
              {permissions.canEdit ? (
                <Link
                  to={`/imoveis/${property.id}/editar`}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 text-sm font-semibold text-on-surface hover:border-primary"
                >
                  <Icon name="edit" size={18} />
                  Editar imóvel
                </Link>
              ) : null}
            </div>
          </Card>
          <StatusCard property={property} lastChange={lastStatusChange} onChange={() => setChangingStatus(true)} />
          <AdCard property={property} />
          <PropertyActionsCard property={property} onChanged={handleActionDone} />
        </div>

        <div className="lg:hidden">
          <PropertyActionsCard property={property} onChanged={handleActionDone} />
        </div>

        {permissions.canEdit ? (
          <Link
            to={`/imoveis/${property.id}/editar`}
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-sm font-semibold text-on-surface lg:hidden"
          >
            <Icon name="edit" size={18} />
            Editar imóvel
          </Link>
        ) : null}
      </div>

      {changingStatus ? (
        <ChangeStatusModal
          current={property.status}
          isAdmin={permissions.canTransfer}
          saving={savingStatus}
          onConfirm={(status) => void handleStatus(status)}
          onClose={() => setChangingStatus(false)}
        />
      ) : null}
    </div>
  )
}

function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-sm">
      {title ? <h2 className="mb-3 text-headline-md font-bold text-on-surface">{title}</h2> : null}
      {children}
    </section>
  )
}

function Data({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-3 border-b border-outline-variant/40 py-1.5 sm:block sm:border-0">
      <dt className="text-body-sm text-on-surface-variant">{label}</dt>
      <dd className="text-label-md font-semibold text-on-surface">{value || '—'}</dd>
    </div>
  )
}

/** 10.3: situação atual, quando e quem mudou; só responsável e ADM veem o botão. */
function StatusCard({
  property,
  lastChange,
  onChange,
}: {
  property: Property
  lastChange: PropertyHistoryItem | undefined
  onChange: () => void
}) {
  return (
    <Card title="Situação">
      <PropertyStatusPill status={property.status} label={property.statusLabel} />
      {lastChange ? (
        <p className="mt-2 text-body-sm text-on-surface-variant">
          Desde {formatDateTime(lastChange.createdAt)}, por {lastChange.actorName ?? 'Sistema'}
        </p>
      ) : null}
      {property.permissions.canChangeStatus ? (
        <button
          type="button"
          onClick={onChange}
          className="mt-3 flex min-h-11 w-full items-center justify-center rounded-lg border border-primary/40 font-semibold text-primary hover:bg-primary/5"
        >
          Alterar situação
        </button>
      ) : (
        <p className="mt-3 text-body-sm text-on-surface-variant">Só o corretor responsável e o administrador alteram a situação.</p>
      )}
    </Card>
  )
}

/** 10.6: indicador de anúncio; só responsável e ADM veem "Completar para anunciar". */
function AdCard({ property }: { property: Property }) {
  const ready = property.adReadiness?.kind === 'ready'

  return (
    <Card title="Anúncio">
      <p className={`flex items-start gap-2 text-body-md ${ready ? 'text-emerald-700' : 'text-on-surface-variant'}`}>
        <Icon name={ready ? 'check_circle' : 'info'} size={18} className="mt-0.5 shrink-0" />
        {property.adReadinessLabel ?? '—'}
      </p>
      {property.permissions.canEdit ? (
        <Link
          to={`/imoveis/${property.id}/anuncio`}
          className="mt-3 flex min-h-11 items-center justify-center rounded-lg border border-primary/40 font-semibold text-primary hover:bg-primary/5"
        >
          {ready ? 'Dados do anúncio' : 'Completar para anunciar'}
        </Link>
      ) : (
        <p className="mt-3 text-body-sm text-on-surface-variant">Só o corretor responsável e o administrador criam anúncio.</p>
      )}
    </Card>
  )
}
