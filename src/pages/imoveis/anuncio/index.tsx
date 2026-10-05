import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/Button'
import { Field } from '../../../components/ui/Field'
import { FormSection } from '../../../components/ui/FormSection'
import { Icon } from '../../../components/ui/Icon'
import { PropertyPageHeader } from '../components/PropertyPageHeader'
import { PropertyApiError, fetchProperty, saveAd, type AdPayload } from '../lib/propertiesApi'
import { TYPOLOGY_OPTIONS, type FieldErrors, type Property, type TriState } from '../types'

const MAX_TITLE = 40
const MAX_HEADLINE = 125
/** [PROVISÓRIO] igual ao bot. */
const MAX_HIGHLIGHTS = 8

/** Item que falta → campo para onde o indicador leva (12, "Telas"). */
const MISSING_TARGET: Record<string, string> = {
  tipologia: 'anuncio-tipologia',
  título: 'anuncio-titulo',
  chamada: 'anuncio-chamada',
}

function toPayload(property: Property): AdPayload {
  const { latitude: _lat, longitude: _lng, ...ad } = property.ad
  void _lat
  void _lng
  return ad
}

/** Seção 12 · protótipos 21 (celular) e 25 (computador). */
export default function DadosAnuncioPage() {
  const { propertyId = '' } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState<Property | null>(null)
  const [values, setValues] = useState<AdPayload | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [newHighlight, setNewHighlight] = useState('')

  useEffect(() => {
    fetchProperty(propertyId)
      .then((loaded) => {
        setProperty(loaded)
        setValues(toPayload(loaded))
      })
      .catch((error: unknown) =>
        setLoadError(error instanceof PropertyApiError && error.status === 404 ? 'Imóvel não encontrado' : 'Não foi possível carregar o imóvel.'),
      )
  }, [propertyId])

  if (loadError) {
    return (
      <div className="mx-auto max-w-4xl rounded-lg border border-error/30 bg-error/5 p-6" role="alert">
        {loadError}
      </div>
    )
  }

  if (!property || !values) {
    return (
      <div className="mx-auto flex max-w-4xl items-center gap-3 p-6 text-on-surface-variant">
        <Icon name="sync" size={22} className="animate-spin" />
        Carregando…
      </div>
    )
  }

  if (!property.permissions.canEdit) {
    return (
      <div className="mx-auto max-w-4xl rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-6 text-body-md text-on-surface-variant">
        Só o corretor responsável e o administrador criam anúncio.
      </div>
    )
  }

  const set = <K extends keyof AdPayload>(key: K, value: AdPayload[K]) => setValues((current) => (current ? { ...current, [key]: value } : current))
  const count = (value: string) => (value === '' ? null : Math.max(0, Math.floor(Number(value))))
  const readiness = property.adReadiness

  const addHighlight = () => {
    const text = newHighlight.trim()
    if (!text || values.highlights.length >= MAX_HIGHLIGHTS) return
    set('highlights', [...values.highlights, text])
    setNewHighlight('')
  }

  const handleSave = async () => {
    setSaving(true)
    setErrors({})

    try {
      const result = await saveAd(property.id, values)
      setProperty(result.property)
      setValues(toPayload(result.property))
      // 12.4: telefone ou e-mail no texto avisam, mas o salvamento acontece.
      result.warnings.forEach((warning) => toast.warning(warning))
      toast.success('Dados do anúncio salvos')
    } catch (error) {
      if (error instanceof PropertyApiError) {
        setErrors(error.fields)
        toast.error(error.message)
      } else {
        toast.error('Não foi possível salvar. Confira sua conexão e tente de novo.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl pb-28">
      <PropertyPageHeader
        title="Dados do anúncio"
        description={`${property.address.street}${property.address.number ? `, ${property.address.number}` : ''} · ${property.referenceCode}. Nada aqui é obrigatório para salvar.`}
        onBack={() => navigate(`/imoveis/${property.id}`)}
      />

      <section
        className={`mb-5 rounded-lg border p-4 ${readiness?.kind === 'ready' ? 'border-emerald-200 bg-emerald-50' : 'border-outline-variant/60 bg-surface-container-lowest'}`}
        aria-live="polite"
      >
        {readiness?.kind === 'ready' ? (
          <p className="flex items-center gap-2 font-semibold text-emerald-800">
            <Icon name="check_circle" size={20} />
            Pronto para anunciar
          </p>
        ) : readiness?.kind === 'not_advertisable' ? (
          <p className="text-body-md text-on-surface-variant">Fora do anúncio nesta situação ({property.statusLabel}).</p>
        ) : (
          <div>
            <p className="font-semibold text-on-surface">Falta para anunciar:</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {(readiness?.kind === 'missing' ? readiness.missing : []).map((item) => (
                <li key={item}>
                  {MISSING_TARGET[item] ? (
                    <a href={`#${MISSING_TARGET[item]}`} className="inline-flex min-h-9 items-center rounded-full border border-outline-variant px-3 text-label-md text-primary underline">
                      {item}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate(`/imoveis/${property.id}/editar`)}
                      className="inline-flex min-h-9 items-center rounded-full border border-outline-variant px-3 text-label-md text-primary underline"
                    >
                      {item}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="space-y-5">
        <FormSection icon="campaign" title="Texto do anúncio">
          <div className="space-y-5">
            <div id="anuncio-tipologia">
              <Field label="Tipologia" error={errors.typology}>
                <select
                  value={values.typology ?? ''}
                  onChange={(event) => set('typology', (event.target.value || null) as AdPayload['typology'])}
                  className="proposal-input"
                >
                  <option value="">Escolha</option>
                  {TYPOLOGY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div id="anuncio-titulo">
              <CountedText
                label="Título"
                max={MAX_TITLE}
                value={values.title ?? ''}
                error={errors.title}
                onChange={(value) => set('title', value || null)}
              />
            </div>
            <div id="anuncio-chamada">
              <CountedText
                label="Chamada"
                max={MAX_HEADLINE}
                value={values.headline ?? ''}
                error={errors.headline}
                multiline
                onChange={(value) => set('headline', value || null)}
              />
            </div>
            <Field label="Descrição pública" hint="separada das observações internas" error={errors.description}>
              <textarea
                value={values.description ?? ''}
                onChange={(event) => set('description', event.target.value || null)}
                rows={5}
                maxLength={5000}
                className="proposal-input !h-auto py-3"
              />
            </Field>

            <fieldset>
              <legend className="text-label-md font-semibold text-on-surface">
                Destaques <span className="font-normal text-outline">(até {MAX_HIGHLIGHTS})</span>
              </legend>
              <ul className="mt-2 flex flex-wrap gap-2">
                {values.highlights.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex items-center gap-1 rounded-full bg-primary/10 pl-3 text-label-md text-primary">
                    {item}
                    <button
                      type="button"
                      aria-label={`Remover ${item}`}
                      onClick={() => set('highlights', values.highlights.filter((_, i) => i !== index))}
                      className="flex h-9 w-9 items-center justify-center"
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </li>
                ))}
              </ul>
              {values.highlights.length < MAX_HIGHLIGHTS ? (
                <div className="mt-2 flex gap-2">
                  <input
                    value={newHighlight}
                    onChange={(event) => setNewHighlight(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        addHighlight()
                      }
                    }}
                    maxLength={40}
                    placeholder="Ex.: Varanda gourmet"
                    aria-label="Novo destaque"
                    className="proposal-input"
                  />
                  <button type="button" onClick={addHighlight} className="min-h-11 shrink-0 rounded-lg border border-primary/40 px-4 font-semibold text-primary">
                    Incluir
                  </button>
                </div>
              ) : null}
              {errors.highlights ? <p className="mt-1 text-body-sm text-error">{errors.highlights}</p> : null}
            </fieldset>
          </div>
        </FormSection>

        <FormSection icon="bed" title="Características">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {(
              [
                ['bedrooms', 'Quartos'],
                ['suites', 'Suítes'],
                ['bathrooms', 'Banheiros'],
                ['parkingSpaces', 'Vagas'],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label} error={errors[key]}>
                <input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={values[key] ?? ''}
                  onChange={(event) => set(key, count(event.target.value))}
                  className="proposal-input"
                />
              </Field>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {(
              [
                ['acceptsFinancing', 'Aceita financiamento'],
                ['acceptsFgts', 'Aceita FGTS'],
                ['acceptsMcmv', 'Minha Casa Minha Vida'],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <select value={values[key]} onChange={(event) => set(key, event.target.value as TriState)} className="proposal-input">
                  <option value="nao_informado">Não informado</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </Field>
            ))}
          </div>
        </FormSection>

        <FormSection icon="visibility" title="O que aparece no anúncio">
          <div className="space-y-3">
            <Toggle checked={values.showPrice} onChange={(checked) => set('showPrice', checked)} label="Exibir preço no anúncio" />
            <Toggle
              checked={values.showFullAddress}
              onChange={(checked) => set('showFullAddress', checked)}
              label="Exibir endereço completo no anúncio"
              hint="Desmarcado, o anúncio mostra só bairro e município."
            />
          </div>
          <p className="mt-4 text-body-sm text-on-surface-variant">
            {property.ad.latitude !== null
              ? 'Localização no mapa obtida do endereço.'
              : 'Sem ponto no mapa: a localização do endereço não está disponível.'}
          </p>
        </FormSection>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant/60 bg-surface-container-lowest/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl justify-end">
          <Button loading={saving} onClick={() => void handleSave()} className="sm:!w-auto sm:px-8">
            Salvar
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Contador de caracteres que não deixa digitar além do limite (CA-12.2). */
function CountedText({
  label,
  max,
  value,
  error,
  multiline = false,
  onChange,
}: {
  label: string
  max: number
  value: string
  error?: string
  multiline?: boolean
  onChange: (value: string) => void
}) {
  const props = {
    value,
    maxLength: max,
    onChange: (event: { target: { value: string } }) => onChange(event.target.value.slice(0, max)),
    className: `proposal-input ${error ? 'proposal-input-error' : ''} ${multiline ? '!h-auto py-3' : ''}`,
  }

  return (
    <Field label={label} error={error}>
      {multiline ? <textarea rows={3} {...props} /> : <input {...props} />}
      <span className={`block text-right text-body-sm ${value.length >= max ? 'text-amber-700' : 'text-on-surface-variant'}`}>
        {value.length}/{max}
      </span>
    </Field>
  )
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (checked: boolean) => void; label: string; hint?: ReactNode }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-5 w-5" />
      <span>
        <span className="block text-label-md text-on-surface">{label}</span>
        {hint ? <span className="block text-body-sm text-on-surface-variant">{hint}</span> : null}
      </span>
    </label>
  )
}
