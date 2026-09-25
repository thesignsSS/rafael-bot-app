import { useEffect, useState } from 'react'
import {
  buscarMinhaAssinatura,
  formatarPreco,
  pagarAssinatura,
  type FormaPagamento,
  type MinhaAssinatura,
} from '../../lib/assinatura'
import { Icon } from '../ui/Icon'
import { EmpresaSuspensaScreen } from './EmpresaSuspensaScreen'

const FORMAS: { id: FormaPagamento; rotulo: string; detalhe: string }[] = [
  { id: 'PIX', rotulo: 'PIX', detalhe: 'Compensa em minutos' },
  { id: 'CREDIT_CARD', rotulo: 'Cartão', detalhe: 'Renova sozinho todo mês' },
]

type Props = {
  nomeEmpresa: string
  logoUrl: string | null
}

/**
 * Substitui o app quando a empresa está sem direito de uso.
 *
 * Quem responde pela empresa vê plano, valor e como pagar. Quem não responde
 * cai no aviso sem valores — decisão do dono do projeto: um funcionário não
 * contrata nem paga em nome da empresa, e nem precisa saber quanto custa.
 *
 * O bloqueio que vale é o da API; esta tela existe para explicar e dar saída.
 */
export function TelaCobranca({ nomeEmpresa, logoUrl }: Props) {
  const [assinatura, setAssinatura] = useState<MinhaAssinatura | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [forma, setForma] = useState<FormaPagamento>('PIX')
  const [pagando, setPagando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    buscarMinhaAssinatura()
      .then((dados) => {
        setAssinatura(dados)
        if (dados.formaPagamento === 'CREDIT_CARD') setForma('CREDIT_CARD')
      })
      .catch((causa: unknown) =>
        setErro(causa instanceof Error ? causa.message : 'Falha ao carregar.'),
      )
      .finally(() => setCarregando(false))
  }, [])

  async function pagar() {
    setPagando(true)
    setErro(null)

    try {
      const { urlPagamento, temCobrancaEmAberto } = await pagarAssinatura(forma)

      if (!temCobrancaEmAberto) {
        // Pagou por fora, ou o webhook ainda não chegou. Recarregar resolve
        // sem o cliente precisar entender o que aconteceu.
        window.location.reload()
        return
      }

      if (!urlPagamento) {
        throw new Error(
          'A cobrança existe, mas o link de pagamento não ficou disponível. Fale com o suporte.',
        )
      }

      window.location.href = urlPagamento
    } catch (causa) {
      setPagando(false)
      setErro(causa instanceof Error ? causa.message : 'Não foi possível pagar.')
    }
  }

  // Enquanto não se sabe quem é, o aviso genérico é o lado seguro: não mostra
  // valor nem botão a quem talvez não possa vê-los.
  if (carregando || !assinatura?.podeGerenciar) {
    return (
      <EmpresaSuspensaScreen nomeEmpresa={nomeEmpresa} logoUrl={logoUrl} />
    )
  }

  const { plano, situacao } = assinatura

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={nomeEmpresa}
            className="mx-auto mb-5 h-12 w-auto object-contain"
          />
        )}

        <h1 className="text-headline-lg font-semibold text-on-surface">
          {situacao.emTrial ? 'Seu teste terminou' : 'Assinatura pendente'}
        </h1>

        <p className="mt-2 text-body-md text-on-surface-variant">
          Para voltar a usar o Effectus, regularize a assinatura de{' '}
          <strong>{nomeEmpresa}</strong>.
        </p>

        <div className="mt-5 rounded-lg border border-outline-variant p-4">
          <p className="text-label-sm text-on-surface-variant">Plano atual</p>
          <p className="mt-1 text-title-md font-semibold text-on-surface">
            {plano.nome}
            <span className="ml-2 font-normal text-on-surface-variant">
              {formatarPreco(plano.precoMensalCentavos)}/mês
            </span>
          </p>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {plano.usuariosIncluidos} usuário
            {plano.usuariosIncluidos > 1 ? 's' : ''} incluído
            {plano.usuariosIncluidos > 1 ? 's' : ''}
          </p>
        </div>

        <fieldset className="mt-5">
          <legend className="text-label-md font-medium text-on-surface">
            Como prefere pagar?
          </legend>

          <div className="mt-2 grid grid-cols-2 gap-2">
            {FORMAS.map((opcao) => (
              <label
                key={opcao.id}
                className={`cursor-pointer rounded-lg border p-3 text-center transition-colors ${
                  forma === opcao.id
                    ? 'border-primary bg-primary-container/30'
                    : 'border-outline-variant hover:bg-surface-container-low'
                }`}
              >
                <input
                  type="radio"
                  name="forma"
                  checked={forma === opcao.id}
                  onChange={() => setForma(opcao.id)}
                  className="sr-only"
                />
                <span className="block text-label-md font-medium text-on-surface">
                  {opcao.rotulo}
                </span>
                <span className="mt-0.5 block text-body-sm text-on-surface-variant">
                  {opcao.detalhe}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {erro && (
          <p className="mt-4 rounded-lg border border-error bg-error-container p-3 text-body-sm text-on-error-container">
            {erro}
          </p>
        )}

        <button
          type="button"
          onClick={() => void pagar()}
          disabled={pagando}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pagando ? 'Abrindo pagamento…' : 'Pagar e voltar a usar'}
        </button>

        <p className="mt-3 flex items-start gap-1.5 text-body-sm text-on-surface-variant">
          <Icon name="lock" size={16} className="mt-0.5 shrink-0" />
          O pagamento acontece numa página segura do nosso processador. Seus
          dados de cartão não passam pelo Effectus.
        </p>

        <p className="mt-4 border-t border-outline-variant pt-4 text-body-sm text-on-surface-variant">
          Seus dados continuam guardados. Assim que o pagamento for confirmado,
          tudo volta como estava.
        </p>
      </div>
    </div>
  )
}
