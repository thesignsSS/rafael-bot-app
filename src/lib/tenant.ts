const DOMINIO_BASE = import.meta.env.VITE_DOMINIO_BASE ?? 'effectushub.com'

/**
 * Mesma lista de `SLUGS_RESERVADOS` do `effectus-api`. Um host que caia aqui
 * (ou que seja o próprio domínio raiz) não é uma empresa — é infraestrutura.
 */
const HOSTS_SEM_EMPRESA = new Set([
  'www',
  'app',
  'admin',
  'api',
  'dev',
  'hml',
  'homolog',
  'staging',
  'sandbox',
  'supabase-dev',
  'localhost',
])

/**
 * Extrai o slug da empresa a partir do hostname atual, ou `null` quando a
 * página está sendo servida fora de um subdomínio de empresa (domínio raiz,
 * localhost, ambiente reservado).
 */
export function obterSlugAtual(
  hostname: string = window.location.hostname,
): string | null {
  if (hostname === DOMINIO_BASE || hostname === `www.${DOMINIO_BASE}`) {
    return null
  }

  if (!hostname.endsWith(`.${DOMINIO_BASE}`)) {
    // Ex: localhost, 127.0.0.1, ou um domínio de preview não mapeado.
    return null
  }

  const slug = hostname.slice(0, -`.${DOMINIO_BASE}`.length)

  return HOSTS_SEM_EMPRESA.has(slug) ? null : slug
}
