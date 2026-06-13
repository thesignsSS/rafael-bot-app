import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/auth-context'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

type WhatsAppAdminState = {
  connectionStatus: 'waiting_qr' | 'connected' | 'disconnected'
  qrCode: {
    dataUrl: string
    updatedAt: string
  } | null
}

const formSubmissionApiUrl = import.meta.env.VITE_FORM_SUBMISSION_API_URL
const formSubmissionApiKey = import.meta.env.VITE_FORM_SUBMISSION_API_KEY

function getAdminApiUrl(path: string) {
  if (!formSubmissionApiUrl) {
    throw new Error('URL de envio do formulário não configurada.')
  }

  return formSubmissionApiUrl.replace(/\/form-submissions\/?$/, path)
}

function getAdminApiHeaders() {
  if (!formSubmissionApiKey) {
    throw new Error('Chave de API de envio do formulário não configurada.')
  }

  return {
    Authorization: `Bearer ${formSubmissionApiKey}`,
  }
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export default function AdminWhatsAppPage() {
  const { currentUserProfile } = useAuth()
  const [whatsAppState, setWhatsAppState] = useState<WhatsAppAdminState | null>(null)
  const [isLoadingWhatsAppState, setIsLoadingWhatsAppState] = useState(true)
  const [isResettingWhatsAppSession, setIsResettingWhatsAppSession] = useState(false)

  useDocumentTitle('Bot do WhatsApp | Effectus')

  useEffect(() => {
    if (!currentUserProfile?.id) {
      return
    }

    let isMounted = true
    const currentUserId = currentUserProfile.id

    async function loadWhatsAppState(showError = true) {
      try {
        if (isMounted) {
          setIsLoadingWhatsAppState(true)
        }

        const url = new URL(getAdminApiUrl('/admin/whatsapp/state'))
        url.searchParams.set('userId', currentUserId)

        const response = await fetch(url.toString(), {
          headers: getAdminApiHeaders(),
        })
        const data = (await response.json().catch(() => null)) as
          | ({ ok: true } & WhatsAppAdminState)
          | { ok: false; error: string }
          | null

        if (!response.ok || !data || ('ok' in data && data.ok === false)) {
          throw new Error(
            data && 'error' in data && data.error
              ? data.error
              : 'Não foi possível carregar o estado do WhatsApp.',
          )
        }

        if (!isMounted) {
          return
        }

        setWhatsAppState({
          connectionStatus: data.connectionStatus,
          qrCode: data.qrCode,
        })
      } catch (error) {
        if (isMounted && showError) {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar o estado do WhatsApp.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoadingWhatsAppState(false)
        }
      }
    }

    void loadWhatsAppState()
    const intervalId = window.setInterval(() => {
      void loadWhatsAppState(false)
    }, 10000)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [currentUserProfile?.id])

  async function handleResetWhatsAppSession() {
    if (!currentUserProfile?.id) {
      return
    }

    try {
      setIsResettingWhatsAppSession(true)

      const url = new URL(getAdminApiUrl('/admin/whatsapp/session'))
      url.searchParams.set('userId', currentUserProfile.id)

      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: getAdminApiHeaders(),
      })

      const data = (await response.json().catch(() => null)) as
        | { ok: true }
        | { ok: false; error: string }
        | null

      if (!response.ok || !data || ('ok' in data && data.ok === false)) {
        throw new Error(
          data && 'error' in data && data.error
            ? data.error
            : 'Não foi possível encerrar a sessão do WhatsApp.',
        )
      }

      toast.success('Sessão do WhatsApp encerrada. Um novo QR será gerado.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível encerrar a sessão do WhatsApp.',
      )
    } finally {
      setIsResettingWhatsAppSession(false)
    }
  }

  const whatsAppStatusLabel = useMemo(() => {
    if (!whatsAppState) {
      return 'Indisponível'
    }

    if (whatsAppState.connectionStatus === 'connected') {
      return 'Conectado'
    }

    if (whatsAppState.connectionStatus === 'waiting_qr') {
      return 'Aguardando QR Code'
    }

    return 'Desconectado'
  }, [whatsAppState])

  return (
    <div className="mx-auto max-w-6xl animate-fade-up space-y-6">
      <section className="rounded-[28px] border border-outline-variant bg-[linear-gradient(135deg,#ffffff_0%,#f5f8ff_100%)] p-6 shadow-[0px_10px_32px_rgba(19,27,46,0.08)] sm:p-8">
        <p className="text-label-sm font-semibold uppercase tracking-[0.16em] text-primary/80">
          Administração
        </p>
        <h1 className="mt-2 text-headline-xl font-semibold text-on-surface">
          Bot do WhatsApp
        </h1>
        <p className="mt-3 max-w-3xl text-body-md text-on-surface-variant">
          Acompanhe a sessão do bot, escaneie o QR code deste ambiente e encerre
          a conexão quando precisar trocar a autenticação.
        </p>
      </section>

      <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.05)] sm:p-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-[linear-gradient(135deg,#ffffff_0%,#f5f8ff_100%)] p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-headline-md font-semibold text-on-surface">
              Sessão atual
            </h2>
            <p className="mt-2 text-body-sm text-on-surface-variant">
              Monitore o estado do bot e gerencie a autenticação diretamente por aqui.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-label-sm font-semibold ${
                whatsAppState?.connectionStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700'
                  : whatsAppState?.connectionStatus === 'waiting_qr'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {isLoadingWhatsAppState ? 'Carregando...' : whatsAppStatusLabel}
            </span>

            <button
              type="button"
              onClick={() => void handleResetWhatsAppSession()}
              disabled={isResettingWhatsAppSession}
              className="rounded-xl border border-error/30 px-4 py-2.5 text-label-md font-semibold text-error transition-all hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isResettingWhatsAppSession ? 'Encerrando...' : 'Encerrar sessão'}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="rounded-2xl border border-outline-variant bg-white p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
            <h3 className="text-headline-sm font-semibold text-on-surface">
              QR Code
            </h3>
            <p className="mt-2 text-body-sm text-on-surface-variant">
              Escaneie com o WhatsApp que deve operar este ambiente.
            </p>

            <div className="mt-5 flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-4">
              {isLoadingWhatsAppState ? (
                <p className="text-body-sm text-on-surface-variant">
                  Carregando QR code...
                </p>
              ) : whatsAppState?.connectionStatus === 'connected' ? (
                <p className="text-center text-body-sm text-on-surface-variant">
                  O bot já está conectado. Encerre a sessão se quiser gerar um novo QR code.
                </p>
              ) : whatsAppState?.qrCode?.dataUrl ? (
                <img
                  src={whatsAppState.qrCode.dataUrl}
                  alt="QR code do WhatsApp"
                  className="h-auto w-full max-w-[240px] rounded-xl bg-white"
                />
              ) : (
                <p className="text-center text-body-sm text-on-surface-variant">
                  Ainda não há QR code disponível. Se necessário, encerre a sessão para gerar um novo.
                </p>
              )}
            </div>

            {whatsAppState?.qrCode?.updatedAt ? (
              <p className="mt-4 text-body-xs text-on-surface-variant">
                Última atualização do QR: {formatDateTime(whatsAppState.qrCode.updatedAt)}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-outline-variant bg-white p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
            <h3 className="text-headline-sm font-semibold text-on-surface">
              Como usar
            </h3>
            <div className="mt-4 space-y-3 text-body-sm text-on-surface-variant">
              <p>1. Verifique se o status está em “Aguardando QR Code”.</p>
              <p>2. Abra o WhatsApp no celular e escaneie o QR mostrado nesta tela.</p>
              <p>3. Após autenticar, o status muda para “Conectado”.</p>
              <p>4. Se precisar trocar de conta, use “Encerrar sessão” para forçar um novo login.</p>
              <p>5. Esta sessão pertence ao ambiente do servidor, não ao seu computador local.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
