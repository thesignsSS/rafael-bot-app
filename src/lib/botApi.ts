import { supabase } from './supabase'

/**
 * Cliente único das chamadas ao bot (`bot-wpp`). Autentica com o JWT da sessão
 * do Supabase, como `assinatura.ts` faz com o effectus-api, em vez da chave
 * compartilhada que ficava no bundle (effectus-api/docs/prd-autenticacao-bot-wpp.md).
 *
 * O token é lido a cada chamada: o Supabase renova a sessão sozinho, e um
 * valor guardado expiraria sem ninguém perceber. Se o bot responder 401, a
 * sessão é renovada e a chamada repetida uma vez antes de propagar o erro.
 */
export async function botFetch(input: string | URL, init: RequestInit = {}): Promise<Response> {
  const response = await send(input, init, await currentAccessToken())

  if (response.status !== 401) {
    return response
  }

  const {
    data: { session },
  } = await supabase.auth.refreshSession()

  if (!session) {
    return response
  }

  return send(input, init, session.access_token)
}

/** Token para quem não usa `fetch` (ex.: websocket do chat). */
export async function currentAccessToken(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Sessão expirada. Entre de novo.')
  }

  return session.access_token
}

function send(input: string | URL, init: RequestInit, token: string): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)

  return fetch(input, { ...init, headers })
}
