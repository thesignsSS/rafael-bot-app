import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Icon } from '../../../components/ui/Icon'
import { useAuth } from '../../../contexts/auth-context'
import { CampaignStatusBadge } from '../components/CampaignStatusBadge'
import {
  fetchCampaign,
  updateLeadStatus,
  type Campaign,
  type Lead,
  type LeadStatus,
} from '../lib/captacaoApi'
import {
  formatCents,
  formatDate,
  formatDateTime,
  LEAD_STATUS_OPTIONS,
  whatsappUrl,
} from '../lib/captacaoFormat'

export default function CampanhaDetailPage() {
  const { campaignId = '' } = useParams()
  const { currentUserProfile } = useAuth()
  const userId = currentUserProfile?.id ?? ''
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId || !campaignId) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchCampaign(userId, campaignId)
      setCampaign(result.campaign)
      setLeads(result.leads)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Falha ao carregar a campanha.')
    } finally {
      setIsLoading(false)
    }
  }, [userId, campaignId])

  useEffect(() => {
    void load()
  }, [load])

  const handleStatusChange = async (lead: Lead, status: LeadStatus) => {
    const previous = lead.status
    setLeads((items) => items.map((item) => (item.id === lead.id ? { ...item, status } : item)))
    try {
      await updateLeadStatus(userId, lead.id, status)
    } catch (updateError) {
      setLeads((items) => items.map((item) => (item.id === lead.id ? { ...item, status: previous } : item)))
      toast.error(updateError instanceof Error ? updateError.message : 'Falha ao atualizar o lead.')
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <button
        type="button"
        onClick={() => navigate('/captacao')}
        className="group mb-4 flex items-center gap-1 text-label-md font-medium text-on-surface-variant transition-colors hover:text-primary"
      >
        <Icon name="arrow_back" size={18} />
        Voltar para as campanhas
      </button>

      {isLoading && !campaign ? (
        <div className="h-48 animate-pulse rounded-xl border border-outline-variant bg-surface-container-low" />
      ) : error ? (
        <div className="rounded-xl border border-error/30 bg-error/5 p-6 text-body-md text-error">{error}</div>
      ) : campaign ? (
        <>
          <section className="mb-6 flex flex-col gap-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm sm:flex-row">
            {campaign.instagramMediaThumbnailUrl ? (
              <img
                src={campaign.instagramMediaThumbnailUrl}
                alt=""
                className="h-32 w-32 shrink-0 rounded-lg object-cover"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-headline-lg font-bold text-on-surface">{campaign.name}</h1>
                <CampaignStatusBadge status={campaign.status} />
              </div>
              {campaign.instagramMediaCaption ? (
                <p className="mt-1 line-clamp-2 text-body-sm text-on-surface-variant">
                  {campaign.instagramMediaCaption}
                </p>
              ) : null}
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-body-sm sm:grid-cols-4">
                <div>
                  <dt className="text-on-surface-variant">Orçamento</dt>
                  <dd className="font-semibold text-on-surface">{formatCents(campaign.budgetCents)}</dd>
                </div>
                <div>
                  <dt className="text-on-surface-variant">Período</dt>
                  <dd className="font-semibold text-on-surface">
                    {formatDate(campaign.startsAt)} a {formatDate(campaign.endsAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-on-surface-variant">Público</dt>
                  <dd className="font-semibold text-on-surface">
                    {campaign.audience.city
                      ? `${campaign.audience.city.name} + ${campaign.audience.city.radiusKm} km`
                      : 'Brasil'}
                    , {campaign.audience.ageMin}–{campaign.audience.ageMax} anos
                  </dd>
                </div>
                <div>
                  <dt className="text-on-surface-variant">Leads</dt>
                  <dd className="font-semibold text-on-surface">{leads.length}</dd>
                </div>
              </dl>
              {campaign.instagramMediaPermalink ? (
                <a
                  href={campaign.instagramMediaPermalink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-label-md font-semibold text-primary hover:underline"
                >
                  Ver publicação no Instagram
                  <Icon name="open_in_new" size={16} />
                </a>
              ) : null}
            </div>
          </section>

          {campaign.status === 'failed' ? (
            <div className="mb-6 flex gap-3 rounded-xl border border-error/30 bg-error/5 p-4 text-body-md text-error">
              <Icon name="error" size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">O anúncio não foi criado na Meta.</p>
                <p className="mt-1 text-body-sm">{campaign.failureReason ?? 'Motivo não informado.'}</p>
                <p className="mt-1 text-body-sm">Nada foi cobrado. Ajuste e crie uma nova campanha.</p>
              </div>
            </div>
          ) : null}

          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-headline-md font-bold text-on-surface">Leads recebidos</h2>
            <button
              type="button"
              onClick={() => void load()}
              className="flex items-center gap-1 text-label-md font-semibold text-primary hover:underline"
            >
              <Icon name="refresh" size={18} className={isLoading ? 'animate-spin' : ''} />
              Atualizar
            </button>
          </div>

          {leads.length === 0 ? (
            <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-10 text-center text-body-md text-on-surface-variant">
              {campaign.status === 'failed'
                ? 'Esta campanha não recebe leads.'
                : 'Nenhum lead ainda. Eles aparecem aqui assim que alguém preencher o formulário do anúncio.'}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
              <table className="w-full min-w-[720px] text-left text-body-sm">
                <thead className="border-b border-outline-variant bg-surface-container-low text-label-sm uppercase tracking-wide text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">Contato</th>
                    <th className="px-4 py-3">Recebido em</th>
                    <th className="px-4 py-3">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const whatsapp = whatsappUrl(lead.phone)
                    return (
                      <tr key={lead.id} className="border-b border-outline-variant/60 last:border-b-0">
                        <td className="px-4 py-3 font-semibold text-on-surface">{lead.fullName ?? '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {lead.phone ? (
                              whatsapp ? (
                                <a
                                  href={whatsapp}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                  <Icon name="chat" size={16} />
                                  {lead.phone}
                                </a>
                              ) : (
                                <span className="text-on-surface">{lead.phone}</span>
                              )
                            ) : null}
                            {lead.email ? (
                              <a href={`mailto:${lead.email}`} className="text-on-surface-variant hover:text-primary">
                                {lead.email}
                              </a>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">{formatDateTime(lead.receivedAt)}</td>
                        <td className="px-4 py-3">
                          <select
                            value={lead.status}
                            onChange={(event) => void handleStatusChange(lead, event.target.value as LeadStatus)}
                            aria-label={`Situação de ${lead.fullName ?? 'lead'}`}
                            className="proposal-input !h-9 !py-1 text-body-sm"
                          >
                            {LEAD_STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
