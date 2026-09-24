import { Icon } from '../ui/Icon'
import {
  SUPORTE_WHATSAPP_EXIBICAO,
  urlSuporteComMensagem,
} from '../../lib/suporte'

type Props = {
  nomeEmpresa: string
  logoUrl: string | null
}

/**
 * Tela de bloqueio de empresa sem assinatura ativa. Substitui o app inteiro —
 * não é um aviso que dá para fechar.
 *
 * Nada foi apagado: suspender é desligar o acesso, e os dados continuam lá.
 * O texto diz isso na cara, porque a primeira reação de quem vê essa tela é
 * achar que perdeu tudo.
 *
 * O bloqueio que vale é o da API; esta tela existe para explicar e dar saída.
 */
export function EmpresaSuspensaScreen({ nomeEmpresa, logoUrl }: Props) {
  const contato = urlSuporteComMensagem(
    `Olá! O acesso da empresa ${nomeEmpresa} está suspenso no Effectus e eu gostaria de regularizar.`,
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-center shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={nomeEmpresa}
            className="mx-auto mb-5 h-12 w-auto object-contain"
          />
        )}

        <span
          aria-hidden
          className="mx-auto flex size-12 items-center justify-center rounded-full bg-error-container text-on-error-container"
        >
          <Icon name="lock" size={24} />
        </span>

        <h1 className="mt-4 text-headline-lg font-semibold text-on-surface">
          Acesso suspenso
        </h1>

        <p className="mt-2 text-body-md text-on-surface-variant">
          O acesso de <strong>{nomeEmpresa}</strong> está suspenso por
          pendência na assinatura.
        </p>

        <p className="mt-3 rounded-lg bg-surface-container-low p-3 text-body-sm text-on-surface-variant">
          Seus dados continuam guardados. Assim que a assinatura for
          regularizada, tudo volta exatamente como estava.
        </p>

        <a
          href={contato}
          target="_blank"
          rel="noreferrer"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container"
        >
          <Icon name="call" size={18} />
          Falar com o suporte
        </a>

        <p className="mt-3 text-body-sm text-on-surface-variant">
          WhatsApp {SUPORTE_WHATSAPP_EXIBICAO}
        </p>
      </div>
    </div>
  )
}
