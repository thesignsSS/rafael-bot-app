import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Icon } from '../../../components/ui/Icon'
import { PropertyForm } from '../components/PropertyForm'
import { PropertyPageHeader } from '../components/PropertyPageHeader'
import { PropertyApiError, fetchProperty } from '../lib/propertiesApi'
import type { Property } from '../types'

type LoadState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string; notFound: boolean }
  | { kind: 'ready'; property: Property }

export default function EditarImovelPage() {
  const { propertyId = '' } = useParams()
  const navigate = useNavigate()
  const [state, setState] = useState<LoadState>({ kind: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ kind: 'loading' })

    fetchProperty(propertyId)
      .then((property) => !cancelled && setState({ kind: 'ready', property }))
      .catch((error: unknown) => {
        if (cancelled) return
        const notFound = error instanceof PropertyApiError && error.status === 404
        setState({
          kind: 'error',
          notFound,
          message: error instanceof Error ? error.message : 'Não foi possível carregar o imóvel.',
        })
      })

    return () => {
      cancelled = true
    }
  }, [propertyId, attempt])

  const handleSaved = useCallback((property: Property) => {
    toast.success('Imóvel salvo')
    setState({ kind: 'ready', property })
  }, [])

  return (
    <div className="mx-auto max-w-4xl">
      <PropertyPageHeader
        title={state.kind === 'ready' ? `Imóvel ${state.property.referenceCode}` : 'Imóvel'}
        description={
          state.kind === 'ready'
            ? `${state.property.address.street}${state.property.address.number ? `, ${state.property.address.number}` : ''} · ${state.property.address.neighborhood} · ${state.property.address.municipality}/${state.property.address.state} · ${state.property.statusLabel}`
            : 'Dados do imóvel'
        }
        onBack={() => navigate(-1)}
      />

      {state.kind === 'loading' ? (
        <div className="flex items-center gap-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-6 text-on-surface-variant">
          <Icon name="sync" size={22} className="animate-spin" />
          Carregando imóvel…
        </div>
      ) : null}

      {state.kind === 'error' ? (
        <div className="rounded-lg border border-error/30 bg-error/5 p-6" role="alert">
          <p className="text-label-md font-semibold text-on-surface">
            {state.notFound ? 'Imóvel não encontrado' : state.message}
          </p>
          {!state.notFound ? (
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
              className="mt-3 min-h-11 font-semibold text-primary underline"
            >
              Tentar de novo
            </button>
          ) : null}
        </div>
      ) : null}

      {state.kind === 'ready' ? (
        state.property.permissions.canEdit ? (
          <PropertyForm
            key={state.property.updatedAt}
            property={state.property}
            onSaved={handleSaved}
            onCancel={() => navigate(-1)}
          />
        ) : (
          <div className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-6 text-body-md text-on-surface-variant">
            Só o corretor responsável e o administrador editam este imóvel.
          </div>
        )
      ) : null}
    </div>
  )
}
