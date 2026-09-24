/**
 * Contato de suporte da Effectus. Estava repetido no rodapé da sidebar e
 * passou a ser preciso também na tela de empresa suspensa — que é justamente
 * onde o número não pode estar errado, porque é o único caminho que resta
 * para o cliente resolver a situação.
 */

/** Só dígitos, com código do país, no formato que o wa.me espera. */
export const SUPORTE_WHATSAPP = '5585988686633'

/** Como o número é mostrado para quem lê. */
export const SUPORTE_WHATSAPP_EXIBICAO = '(85) 9 8868-6633'

export const SUPORTE_WHATSAPP_URL = `https://wa.me/${SUPORTE_WHATSAPP}`

/**
 * Abre a conversa com uma mensagem já escrita. Poupa o cliente de explicar o
 * problema e dá ao suporte o dado que ele vai pedir primeiro — qual empresa.
 */
export function urlSuporteComMensagem(mensagem: string): string {
  return `${SUPORTE_WHATSAPP_URL}?text=${encodeURIComponent(mensagem)}`
}
