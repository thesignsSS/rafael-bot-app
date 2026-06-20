import { useEffect, useMemo, useState } from 'react'
import { getProfileAvatarUrl } from '../../../lib/profile-avatar'

const formSubmissionApiUrl = import.meta.env.VITE_FORM_SUBMISSION_API_URL
const formSubmissionApiKey = import.meta.env.VITE_FORM_SUBMISSION_API_KEY

type PreferencesInsightsTabProps = {
  userId: string
  enabled: boolean
}

type PreferencesInsightsResponse = {
  summary: {
    totalUsers: number
    usersWithSavedPreferences: number
    usersWithAvatar: number
    usersUsingBrazilTheme: number
    mostUsedTheme: string | null
    themeUsage: Array<{
      theme: string
      count: number
    }>
  }
  items: Array<{
    id: string
    fullName: string
    role: 'admin' | 'broker'
    isAdmin: boolean
    isActive: boolean
    avatarPath: string | null
    hasAvatar: boolean
    canViewPreferencesInsights: boolean
    theme: string | null
    fontSize: string | null
    density: string | null
    proposalsLayout: string | null
    chatWallpaper: string | null
    enterBehavior: string | null
    notificationsSound: boolean | null
    isBrazilTheme: boolean
    preferencesUpdatedAt: string | null
    updatedAt: string | null
  }>
}

function getPreferencesInsightsApiUrl() {
  if (!formSubmissionApiUrl) {
    throw new Error('URL de envio do formulário não configurada.')
  }

  return formSubmissionApiUrl.replace(
    /\/form-submissions\/?$/,
    '/profiles/preferences-insights',
  )
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Sem registro'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Sem registro'
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getThemeLabel(theme: string | null) {
  switch (theme) {
    case 'light':
      return 'Claro'
    case 'dark':
      return 'Escuro'
    case 'graphite':
      return 'Grafite'
    case 'rose':
      return 'Rosa'
    case 'emerald':
      return 'Esmeralda'
    case 'sunset':
      return 'Pôr do sol'
    case 'brazuca':
      return 'Brazuca'
    case 'brazuca-dark':
      return 'Brazuca Escuro'
    default:
      return 'Sem tema salvo'
  }
}

function getDensityLabel(value: string | null) {
  if (value === 'compact') {
    return 'Compacta'
  }

  if (value === 'default') {
    return 'Padrão'
  }

  return 'Sem dado'
}

function getFontSizeLabel(value: string | null) {
  if (value === 'large') {
    return 'Grande'
  }

  if (value === 'medium') {
    return 'Médio'
  }

  return 'Sem dado'
}

function getEnterBehaviorLabel(value: string | null) {
  if (value === 'newline') {
    return 'Ctrl+Enter envia'
  }

  if (value === 'send') {
    return 'Enter envia'
  }

  return 'Sem dado'
}

export function PreferencesInsightsTab({
  userId,
  enabled,
}: PreferencesInsightsTabProps) {
  const [data, setData] = useState<PreferencesInsightsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    let isMounted = true

    async function loadInsights() {
      try {
        setIsLoading(true)
        setError(null)

        if (!formSubmissionApiKey) {
          throw new Error('Chave de API de envio do formulário não configurada.')
        }

        const url = new URL(getPreferencesInsightsApiUrl())
        url.searchParams.set('userId', userId)

        const response = await fetch(url.toString(), {
          headers: {
            'x-api-key': formSubmissionApiKey,
          },
        })

        const result = (await response.json().catch(() => null)) as
          | (PreferencesInsightsResponse & { ok?: boolean; error?: string })
          | null

        if (!response.ok || !result) {
          throw new Error(
            result && 'error' in result && typeof result.error === 'string'
              ? result.error
              : 'Não foi possível carregar os insights de preferências.',
          )
        }

        if (isMounted) {
          setData(result)
        }
      } catch (nextError) {
        if (isMounted) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : 'Não foi possível carregar os insights de preferências.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadInsights()

    return () => {
      isMounted = false
    }
  }, [enabled, userId])

  const mostUsedThemeLabel = useMemo(
    () => getThemeLabel(data?.summary.mostUsedTheme ?? null),
    [data?.summary.mostUsedTheme],
  )

  if (!enabled) {
    return null
  }

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-2">
        <h2 className="text-headline-md font-semibold text-on-surface">
          Preferências dos usuários
        </h2>
        <p className="text-body-sm text-on-surface-variant">
          Veja quais temas e configurações estão sendo mais usados para orientar
          melhorias de UX.
        </p>
      </div>

      {isLoading ? (
        <div className="mt-6 rounded-2xl border border-dashed border-outline-variant bg-surface-container-low px-4 py-10 text-center text-body-md text-on-surface-variant">
          Carregando preferências dos usuários...
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-error/20 bg-error/8 px-4 py-6 text-body-md text-error">
          {error}
        </div>
      ) : data ? (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: 'Usuários mapeados',
                value: String(data.summary.totalUsers),
                detail: `${data.summary.usersWithSavedPreferences} com preferências salvas`,
              },
              {
                label: 'Com foto de perfil',
                value: String(data.summary.usersWithAvatar),
                detail: 'Ajuda a medir adesão à personalização',
              },
              {
                label: 'Usando tema Brasil',
                value: String(data.summary.usersUsingBrazilTheme),
                detail: 'Brazuca claro ou escuro',
              },
              {
                label: 'Tema mais usado',
                value: mostUsedThemeLabel,
                detail: 'Bom indicador para manter ou evoluir',
              },
            ].map((item) => (
              <article
                key={item.label}
                className="rounded-2xl border border-outline-variant bg-surface-container-low p-4"
              >
                <p className="text-label-sm font-semibold uppercase tracking-[0.14em] text-primary/80">
                  {item.label}
                </p>
                <p className="mt-3 text-headline-lg font-semibold text-on-surface">
                  {item.value}
                </p>
                <p className="mt-2 text-body-sm text-on-surface-variant">
                  {item.detail}
                </p>
              </article>
            ))}
          </div>

          <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5">
            <h3 className="text-label-md font-semibold text-on-surface">
              Uso por tema
            </h3>
            <div className="mt-4 space-y-3">
              {data.summary.themeUsage.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant">
                  Nenhuma preferência foi sincronizada ainda.
                </p>
              ) : (
                data.summary.themeUsage.map((item) => {
                  const percent =
                    data.summary.totalUsers > 0
                      ? Math.round((item.count / data.summary.totalUsers) * 100)
                      : 0

                  return (
                    <div key={item.theme}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-body-sm">
                        <span className="font-medium text-on-surface">
                          {getThemeLabel(item.theme)}
                        </span>
                        <span className="text-on-surface-variant">
                          {item.count} usuário{item.count === 1 ? '' : 's'} · {percent}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-container-highest">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5">
            <h3 className="text-label-md font-semibold text-on-surface">
              Usuários e escolhas atuais
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-body-sm">
                <thead>
                  <tr className="border-b border-outline-variant text-on-surface-variant">
                    <th className="px-3 py-2 font-medium">Usuário</th>
                    <th className="px-3 py-2 font-medium">Tema</th>
                    <th className="px-3 py-2 font-medium">Fonte</th>
                    <th className="px-3 py-2 font-medium">Densidade</th>
                    <th className="px-3 py-2 font-medium">Foto</th>
                    <th className="px-3 py-2 font-medium">Enter</th>
                    <th className="px-3 py-2 font-medium">Última sync</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => {
                    const avatarUrl = getProfileAvatarUrl(
                      item.avatarPath,
                      item.updatedAt,
                    )

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-outline-variant/60 text-on-surface last:border-b-0"
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-container-highest">
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={`Foto de ${item.fullName}`}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-label-md font-semibold text-primary">
                                  {(item.fullName || 'U').slice(0, 1).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{item.fullName || 'Usuário sem nome'}</p>
                              <p className="text-label-sm text-on-surface-variant">
                                {item.isAdmin ? 'Administrador' : 'Corretor'}
                                {item.canViewPreferencesInsights
                                  ? ' · Acesso aos insights'
                                  : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-label-sm font-semibold ${
                              item.isBrazilTheme
                                ? 'bg-[#f7d038]/20 text-[#8a6c00]'
                                : 'bg-surface-container-high text-on-surface-variant'
                            }`}
                          >
                            {getThemeLabel(item.theme)}
                          </span>
                        </td>
                        <td className="px-3 py-3">{getFontSizeLabel(item.fontSize)}</td>
                        <td className="px-3 py-3">{getDensityLabel(item.density)}</td>
                        <td className="px-3 py-3">
                          {item.hasAvatar ? 'Com foto' : 'Sem foto'}
                        </td>
                        <td className="px-3 py-3">
                          {getEnterBehaviorLabel(item.enterBehavior)}
                        </td>
                        <td className="px-3 py-3 text-on-surface-variant">
                          {formatDateTime(item.preferencesUpdatedAt)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
