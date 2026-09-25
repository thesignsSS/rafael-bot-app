import { supabase } from './supabase'

/**
 * Cliente da API de assinatura (effectus-api), que é um serviço diferente do
 * `bot-wpp`: autentica pela sessão do Supabase, não por chave compartilhada, e
 * nunca recebe qual empresa está sendo consultada — ela sai do token.
 */

const API_URL = import.meta.env.VITE_CORE_API_URL as string | undefined

export type FormaPagamento = 'PIX' | 'CREDIT_CARD'

export type MinhaAssinatura = {
  empresa: { nome: string; slug: string }
  plano: {
    id: string
    nome: string
    precoMensalCentavos: number
    usuariosIncluidos: number
  }
  situacao: {
    status: string
    temAcesso: boolean
    emTrial: boolean
    diasRestantesTrial: number | null
    acessoAte: string | null
    cancelamentoAgendado: boolean
  }
  formaPagamento: string | null
  /** `false` esconde valores e ações de quem não responde pela empresa. */
  podeGerenciar: boolean
}

export type ResultadoPagamento = {
  urlPagamento: string | null
  valorCentavos: number | null
  vencimento: string | null
  forma: string | null
  temCobrancaEmAberto: boolean
}

async function chamar<T>(caminho: string, init?: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new Error('VITE_CORE_API_URL não configurada.')
  }

  // Pego a cada chamada em vez de guardado: o Supabase renova o token sozinho,
  // e um valor memorizado expiraria sem ninguém perceber.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Sessão expirada. Entre de novo.')
  }

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!resposta.ok) {
    const corpo: unknown = await resposta.json().catch(() => null)
    const mensagem =
      corpo && typeof corpo === 'object' && 'message' in corpo
        ? String(corpo.message)
        : `A API respondeu ${resposta.status}.`

    throw new Error(mensagem)
  }

  return resposta.json() as Promise<T>
}

export function buscarMinhaAssinatura(): Promise<MinhaAssinatura> {
  return chamar<MinhaAssinatura>('/minha-assinatura')
}

export function pagarAssinatura(
  formaPagamento?: FormaPagamento,
): Promise<ResultadoPagamento> {
  return chamar<ResultadoPagamento>('/minha-assinatura/pagar', {
    method: 'POST',
    body: JSON.stringify(formaPagamento ? { formaPagamento } : {}),
  })
}

export function formatarPreco(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
