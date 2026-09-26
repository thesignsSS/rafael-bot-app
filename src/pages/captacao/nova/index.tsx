import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/Button'
import { Field } from '../../../components/ui/Field'
import { Icon } from '../../../components/ui/Icon'
import { useAuth } from '../../../contexts/auth-context'
import { mapFieldErrors } from '../../../lib/mapFieldErrors'
import { BudgetInput } from '../components/BudgetInput'
import { CityPicker } from '../components/CityPicker'
import { InstagramPostPicker } from '../components/InstagramPostPicker'
import {
  createCampaign,
  fetchInstagramPosts,
  type InstagramPost,
  type MetaCity,
} from '../lib/captacaoApi'
import { formatCents } from '../lib/captacaoFormat'
import {
  CAMPAIGN_FORM_FIELDS,
  campaignSchema,
  type CampaignFormField,
} from '../schemas/campaignSchema'

const DURATION_OPTIONS = [3, 7, 14, 30]

export default function NovaCampanhaPage() {
  const { currentUserProfile } = useAuth()
  const userId = currentUserProfile?.id ?? ''
  const navigate = useNavigate()

  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [postsError, setPostsError] = useState<string | null>(null)
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)

  const [name, setName] = useState('')
  const [instagramMediaId, setInstagramMediaId] = useState('')
  const [budgetCents, setBudgetCents] = useState(0)
  const [durationDays, setDurationDays] = useState(7)
  const [city, setCity] = useState<MetaCity | null>(null)
  const [radiusKm, setRadiusKm] = useState(25)
  const [ageMin, setAgeMin] = useState(25)
  const [ageMax, setAgeMax] = useState(65)
  const [errors, setErrors] = useState<Partial<Record<CampaignFormField, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Erro some assim que o campo muda; não espera o próximo envio.
  const edit =
    <T,>(field: CampaignFormField, setter: (value: T) => void) =>
    (value: T) => {
      setter(value)
      setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
    }

  const loadPosts = useCallback(async () => {
    if (!userId) return
    setIsLoadingPosts(true)
    setPostsError(null)
    try {
      setPosts(await fetchInstagramPosts(userId))
    } catch (error) {
      setPostsError(error instanceof Error ? error.message : 'Falha ao carregar publicações.')
    } finally {
      setIsLoadingPosts(false)
    }
  }, [userId])

  useEffect(() => {
    void loadPosts()
  }, [loadPosts])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const parsed = campaignSchema.safeParse({
      name,
      instagramMediaId,
      budgetCents,
      durationDays,
      cityKey: city?.key ?? '',
      radiusKm,
      ageMin,
      ageMax,
    })

    if (!parsed.success) {
      setErrors(mapFieldErrors(CAMPAIGN_FORM_FIELDS, parsed.error.flatten().fieldErrors))
      toast.error('Revise os campos destacados.')
      return
    }

    setErrors({})
    setIsSubmitting(true)
    try {
      const campaign = await createCampaign({
        userId,
        name: parsed.data.name,
        instagramMediaId,
        budgetCents,
        durationDays,
        audience: {
          city: city ? { key: city.key, name: city.name, radiusKm } : undefined,
          ageMin,
          ageMax,
        },
      })

      if (campaign.status === 'failed') {
        toast.error(`A Meta recusou o anúncio: ${campaign.failureReason ?? 'motivo não informado'}`)
      } else {
        toast.success('Campanha enviada. A Meta revisa o anúncio antes de colocá-lo no ar.')
      }
      navigate(`/captacao/${campaign.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao criar a campanha.')
      setIsSubmitting(false)
    }
  }

  const dailyCents = durationDays ? Math.floor(budgetCents / durationDays) : 0

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="mx-auto max-w-4xl" noValidate>
      <button
        type="button"
        onClick={() => navigate('/captacao')}
        className="group mb-4 flex items-center gap-1 text-label-md font-medium text-on-surface-variant transition-colors hover:text-primary"
      >
        <Icon name="arrow_back" size={18} />
        Voltar para as campanhas
      </button>

      <section className="mb-8 flex items-start gap-4 border-b border-outline-variant/60 pb-7">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon name="campaign" size={32} />
        </div>
        <div>
          <h1 className="text-headline-xl font-bold text-on-surface">Nova campanha</h1>
          <p className="mt-1 max-w-3xl text-body-md text-on-surface-variant">
            Escolha uma publicação, quanto investir e quem deve ver o anúncio. Quem se
            interessar preenche um formulário sem sair do Instagram e cai direto aqui.
          </p>
        </div>
      </section>

      <div className="space-y-8">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface">1. Publicação</h2>
          <p className="mb-4 mt-1 text-body-sm text-on-surface-variant">
            Últimas publicações do Instagram conectado.
          </p>
          <InstagramPostPicker
            posts={posts}
            isLoading={isLoadingPosts}
            error={postsError}
            selectedId={instagramMediaId}
            onSelect={edit('instagramMediaId', setInstagramMediaId)}
            onRetry={() => void loadPosts()}
          />
          {errors.instagramMediaId ? (
            <p className="mt-2 text-body-sm text-error" role="alert">{errors.instagramMediaId}</p>
          ) : null}
        </div>

        <div>
          <h2 className="text-headline-md font-bold text-on-surface">2. Investimento</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Nome da campanha" required error={errors.name}>
              <input
                value={name}
                onChange={(event) => edit('name', setName)(event.target.value)}
                placeholder="Ex.: Lançamento Residencial Jardins"
                maxLength={120}
                className={`proposal-input ${errors.name ? 'proposal-input-error' : ''}`}
              />
            </Field>
            <Field label="Orçamento total" required hint="mínimo R$ 20,00" error={errors.budgetCents}>
              <BudgetInput valueCents={budgetCents} onChange={edit('budgetCents', setBudgetCents)} hasError={Boolean(errors.budgetCents)} />
            </Field>
            <Field label="Duração" required error={errors.durationDays}>
              <select
                value={durationDays}
                onChange={(event) => edit('durationDays', setDurationDays)(Number(event.target.value))}
                className="proposal-input"
              >
                {DURATION_OPTIONS.map((days) => (
                  <option key={days} value={days}>
                    {days} dias
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex items-end">
              <p className="rounded-lg bg-surface-container-low px-4 py-3 text-body-sm text-on-surface-variant">
                Cerca de <strong className="text-on-surface">{formatCents(dailyCents)}</strong> por
                dia. A Meta distribui o valor ao longo do período e nunca passa do total.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-headline-md font-bold text-on-surface">3. Público</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Cidade" required error={errors.cityKey}>
              <CityPicker userId={userId} value={city} onChange={edit('cityKey', setCity)} />
            </Field>
            <Field label="Raio ao redor da cidade" required hint="km" error={errors.radiusKm}>
              <input
                type="number"
                min={1}
                max={80}
                value={radiusKm}
                onChange={(event) => edit('radiusKm', setRadiusKm)(Number(event.target.value))}
                className={`proposal-input ${errors.radiusKm ? 'proposal-input-error' : ''}`}
              />
            </Field>
            <Field label="Idade mínima" required error={errors.ageMin}>
              <input
                type="number"
                min={18}
                max={65}
                value={ageMin}
                onChange={(event) => edit('ageMin', setAgeMin)(Number(event.target.value))}
                className={`proposal-input ${errors.ageMin ? 'proposal-input-error' : ''}`}
              />
            </Field>
            <Field label="Idade máxima" required hint="65 = 65 ou mais" error={errors.ageMax}>
              <input
                type="number"
                min={18}
                max={65}
                value={ageMax}
                onChange={(event) => edit('ageMax', setAgeMax)(Number(event.target.value))}
                className={`proposal-input ${errors.ageMax ? 'proposal-input-error' : ''}`}
              />
            </Field>
          </div>
          <p className="mt-3 text-body-sm text-on-surface-variant">
            Anúncios de imóveis entram na categoria especial de moradia da Meta: a faixa de
            idade pode ser ignorada e o raio mínimo aceito é de 25 km.
          </p>
        </div>

        <div className="border-t border-outline-variant/60 pt-6">
          <Button type="submit" loading={isSubmitting} icon="rocket_launch" className="sm:ml-auto sm:w-64">
            Lançar campanha
          </Button>
        </div>
      </div>
    </form>
  )
}
