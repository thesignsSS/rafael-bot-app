import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Icon } from '../../components/ui/Icon'
import { useAuth } from '../../contexts/auth-context'
import { CampaignStatusBadge } from './components/CampaignStatusBadge'
import {
  disconnectMeta,
  fetchCampaigns,
  fetchConnectionStatus,
  fetchConnectUrl,
  type Campaign,
  type MetaConnectionStatus,
} from './lib/captacaoApi'
import { formatCents, formatDate } from './lib/captacaoFormat'

export default function CaptacaoPage() {
  const { currentUserProfile } = useAuth()
  const userId = currentUserProfile?.id ?? ''
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [connection, setConnection] = useState<MetaConnectionStatus | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)

  const load = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    setError(null)
    try {
      const status = await fetchConnectionStatus(userId)
      setConnection(status)
      setCampaigns(status.connected ? await fetchCampaigns(userId) : [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Falha ao carregar.')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void load()
  }, [load])

  // Retorno do OAuth da Meta: o backend redireciona para cá com ?meta=...
  useEffect(() => {
    const result = searchParams.get('meta')
    if (!result) return

    if (result === 'connected') {
      toast.success('Instagram conectado com sucesso.', { id: 'meta-oauth' })
    } else {
      toast.error(`Não foi possível conectar: ${searchParams.get('reason') ?? 'erro desconhecido'}`, {
        id: 'meta-oauth',
      })
    }
    setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams])

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      window.location.href = await fetchConnectUrl(userId)
    } catch (connectError) {
      toast.error(connectError instanceof Error ? connectError.message : 'Falha ao conectar.')
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectMeta(userId)
      toast.success('Instagram desconectado.')
      setConfirmDisconnect(false)
      await load()
    } catch (disconnectError) {
      toast.error(disconnectError instanceof Error ? disconnectError.message : 'Falha ao desconectar.')
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-col gap-1">
          <h3 className="text-headline-md font-bold text-on-surface">Captação de leads</h3>
          <p className="text-body-md text-on-surface-variant">
            Impulsione uma publicação do Instagram e receba os interessados direto aqui.
          </p>
        </div>

        {connection?.connected ? (
          <button
            type="button"
            onClick={() => navigate('/captacao/nova')}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-body-md font-semibold text-on-primary shadow-sm transition-all hover:bg-surface-tint active:scale-95"
          >
            <Icon name="add_circle" size={20} />
            Nova campanha
          </button>
        ) : null}
      </div>

      {connection?.provider === 'fake' ? (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-body-sm text-amber-700">
          <Icon name="science" size={18} />
          Modo de teste: a conexão, as publicações e os anúncios são simulados. Nada é enviado à Meta.
        </div>
      ) : null}

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-xl border border-outline-variant bg-surface-container-low" />
      ) : error ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-error/30 bg-error/5 p-6">
          <p className="text-body-md text-error">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="text-label-md font-semibold text-primary hover:underline"
          >
            Tentar de novo
          </button>
        </div>
      ) : !connection?.connected ? (
        <section className="flex flex-col items-start gap-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon name="campaign" size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-headline-md font-bold text-on-surface">
              Conecte o Instagram da empresa
            </h2>
            <p className="mt-1 max-w-2xl text-body-md text-on-surface-variant">
              Você será levado ao Facebook para autorizar o acesso à página, ao Instagram
              Business e à conta de anúncios. Depois disso, é só escolher uma publicação e
              definir quanto investir.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleConnect()}
            disabled={isConnecting}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-6 py-3 text-body-md font-semibold text-on-primary shadow-sm transition-all hover:bg-surface-tint active:scale-95 disabled:opacity-70"
          >
            <Icon name={isConnecting ? 'sync' : 'link'} size={20} className={isConnecting ? 'animate-spin' : ''} />
            Conectar Instagram
          </button>
        </section>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <Icon name="check_circle" size={20} />
              </span>
              <div>
                <p className="text-label-md font-semibold text-on-surface">
                  {connection.instagramUsername ? `@${connection.instagramUsername}` : 'Instagram conectado'}
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  Página {connection.pageName ?? '—'} · conectado em {formatDate(connection.connectedAt)}
                </p>
              </div>
            </div>
            {confirmDisconnect ? (
              <div className="flex items-center gap-3 text-body-sm">
                <span className="text-on-surface-variant">Os anúncios já no ar continuam rodando.</span>
                <button
                  type="button"
                  onClick={() => void handleDisconnect()}
                  className="font-semibold text-error hover:underline"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDisconnect(false)}
                  className="font-semibold text-on-surface-variant hover:underline"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDisconnect(true)}
                className="text-label-md font-semibold text-on-surface-variant hover:text-error"
              >
                Desconectar
              </button>
            )}
          </div>

          {campaigns.length === 0 ? (
            <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-10 text-center">
              <p className="text-body-md text-on-surface-variant">
                Nenhuma campanha ainda. Crie a primeira para começar a receber leads.
              </p>
            </div>
          ) : (
            <ul className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
              {campaigns.map((campaign) => (
                <li key={campaign.id} className="border-b border-outline-variant/60 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => navigate(`/captacao/${campaign.id}`)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-container-low"
                  >
                    {campaign.instagramMediaThumbnailUrl ? (
                      <img
                        src={campaign.instagramMediaThumbnailUrl}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant">
                        <Icon name="image" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-label-md font-semibold text-on-surface">{campaign.name}</p>
                        <CampaignStatusBadge status={campaign.status} />
                      </div>
                      <p className="mt-0.5 text-body-sm text-on-surface-variant">
                        {formatCents(campaign.budgetCents)} em {campaign.durationDays}{' '}
                        {campaign.durationDays === 1 ? 'dia' : 'dias'} · {formatDate(campaign.startsAt)} a{' '}
                        {formatDate(campaign.endsAt)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-headline-md font-bold text-on-surface">{campaign.leadCount}</p>
                      <p className="text-body-sm text-on-surface-variant">
                        {campaign.leadCount === 1 ? 'lead' : 'leads'}
                      </p>
                    </div>
                    <Icon name="chevron_right" className="text-on-surface-variant" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
