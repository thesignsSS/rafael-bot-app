import { useState } from 'react'
import { useAssinatura } from '../../hooks/useAssinatura'
import {
  cancelarAssinatura,
  formatarPreco,
  pagarAssinatura,
  reativarAssinatura,
  trocarPlano,
  PLANOS_VENDAVEIS,
  type MinhaAssinatura,
} from '../../lib/assinatura'
import { Icon } from '../../components/ui/Icon'

function formatarData(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('pt-BR') : '—'
}

export default function AssinaturaPage() {
  const estado = useAssinatura()
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  if (estado.status === 'carregando') {
    return <p className="text-body-md text-on-surface-variant">Carregando…</p>
  }

  if (estado.status !== 'carregada') {
    return (
      <p className="text-body-md text-on-surface-variant">
        Não foi possível carregar os dados da assinatura.
      </p>
    )
  }

  const { assinatura, recarregar } = estado

  if (!assinatura.podeGerenciar) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <h1 className="text-headline-sm font-semibold text-on-surface">
          Assinatura
        </h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Só o responsável pela empresa pode ver e alterar a assinatura. Fale
          com ele se precisar de algo.
        </p>
      </div>
    )
  }

  async function executar(nome: string, acao: () => Promise<unknown>) {
    setOcupado(nome)
    setErro(null)
    setAviso(null)

    try {
      await acao()
      recarregar()
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : 'Não foi possível.')
    } finally {
      setOcupado(null)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-headline-sm font-semibold text-on-surface">
          Assinatura
        </h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Plano, cobrança e cancelamento de {assinatura.empresa.nome}.
        </p>
      </div>

      <Situacao assinatura={assinatura} />

      {erro && (
        <p className="rounded-lg border border-error bg-error-container p-3 text-body-sm text-on-error-container">
          {erro}
        </p>
      )}

      {aviso && (
        <p className="rounded-lg border border-outline-variant bg-surface-container-low p-3 text-body-sm text-on-surface-variant">
          {aviso}
        </p>
      )}

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-title-md font-semibold text-on-surface">
          Trocar de plano
        </h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          O novo valor passa a valer na próxima cobrança.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {PLANOS_VENDAVEIS.map((plano) => {
            const atual = plano.id === assinatura.plano.id

            return (
              <button
                key={plano.id}
                type="button"
                disabled={atual || ocupado !== null}
                onClick={() =>
                  void executar(`plano-${plano.id}`, async () => {
                    await trocarPlano(plano.id)
                    setAviso(`Plano alterado para ${plano.nome}.`)
                  })
                }
                className={`rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed ${
                  atual
                    ? 'border-primary bg-primary-container/30'
                    : 'border-outline-variant hover:bg-surface-container-low disabled:opacity-60'
                }`}
              >
                <span className="block text-label-md font-medium text-on-surface">
                  {plano.nome}
                </span>
                <span className="mt-0.5 block text-body-sm text-on-surface-variant">
                  {formatarPreco(plano.precoMensalCentavos)}/mês ·{' '}
                  {plano.usuariosIncluidos} usuário
                  {plano.usuariosIncluidos > 1 ? 's' : ''}
                </span>
                {atual && (
                  <span className="mt-1 block text-label-sm text-primary">
                    Plano atual
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-title-md font-semibold text-on-surface">
          {assinatura.situacao.cancelamentoAgendado
            ? 'Cancelamento agendado'
            : 'Cancelar assinatura'}
        </h2>

        {assinatura.situacao.cancelamentoAgendado ? (
          <>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              O acesso continua até{' '}
              <strong>{formatarData(assinatura.situacao.acessoAte)}</strong>.
              Depois disso, seus dados seguem guardados, mas o sistema fica
              bloqueado.
            </p>
            <button
              type="button"
              disabled={ocupado !== null}
              onClick={() =>
                void executar('reativar', async () => {
                  await reativarAssinatura()
                  setAviso('Assinatura reativada.')
                })
              }
              className="mt-4 rounded-lg bg-primary px-4 py-2.5 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:opacity-60"
            >
              {ocupado === 'reativar' ? 'Reativando…' : 'Voltar atrás'}
            </button>
          </>
        ) : (
          <>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Você continua usando até o fim do período já pago. Nada é apagado.
            </p>
            <button
              type="button"
              disabled={ocupado !== null}
              onClick={() =>
                void executar('cancelar', async () => {
                  await cancelarAssinatura()
                  setAviso('Cancelamento agendado.')
                })
              }
              className="mt-4 rounded-lg border border-error px-4 py-2.5 text-label-md font-semibold text-error transition-colors hover:bg-error-container disabled:opacity-60"
            >
              {ocupado === 'cancelar' ? 'Cancelando…' : 'Cancelar assinatura'}
            </button>
          </>
        )}
      </section>
    </div>
  )
}

function Situacao({ assinatura }: { assinatura: MinhaAssinatura }) {
  const { situacao, plano } = assinatura
  const [pagando, setPagando] = useState(false)

  async function irPagar() {
    setPagando(true)

    try {
      const { urlPagamento } = await pagarAssinatura()

      if (urlPagamento) window.location.href = urlPagamento
      else setPagando(false)
    } catch {
      setPagando(false)
    }
  }

  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-label-sm text-on-surface-variant">Plano atual</p>
          <p className="mt-0.5 text-title-lg font-semibold text-on-surface">
            {plano.nome}
            <span className="ml-2 text-body-md font-normal text-on-surface-variant">
              {formatarPreco(plano.precoMensalCentavos)}/mês
            </span>
          </p>
        </div>

        <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-label-sm text-on-surface-variant">
          {situacao.emTrial
            ? `Teste · ${situacao.diasRestantesTrial} dia(s)`
            : situacao.status}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 border-t border-outline-variant pt-4 sm:grid-cols-2">
        <div>
          <dt className="text-label-sm text-on-surface-variant">
            {situacao.emTrial ? 'Primeira cobrança' : 'Acesso garantido até'}
          </dt>
          <dd className="mt-0.5 text-body-md text-on-surface">
            {formatarData(situacao.acessoAte)}
          </dd>
        </div>
        <div>
          <dt className="text-label-sm text-on-surface-variant">
            Forma de pagamento
          </dt>
          <dd className="mt-0.5 text-body-md text-on-surface">
            {assinatura.formaPagamento === 'CREDIT_CARD' ? 'Cartão' : 'PIX'}
          </dd>
        </div>
      </dl>

      {!situacao.temAcesso && (
        <button
          type="button"
          onClick={() => void irPagar()}
          disabled={pagando}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:opacity-60"
        >
          <Icon name="payments" size={18} />
          {pagando ? 'Abrindo…' : 'Pagar agora'}
        </button>
      )}
    </section>
  )
}
