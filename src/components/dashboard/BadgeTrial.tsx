import { Link } from 'react-router-dom'
import { useAssinatura } from '../../hooks/useAssinatura'
import { Icon } from '../ui/Icon'

/**
 * Quantos dias faltam do período de teste. Aparece só durante o trial — quem
 * já paga não precisa ser lembrado de nada.
 *
 * Fica discreto enquanto há folga e fica vermelho no último dia, que é quando
 * a informação passa a ser urgente: no dia seguinte a pessoa não entra mais.
 */
export function BadgeTrial() {
  const assinatura = useAssinatura()

  if (assinatura.status !== 'carregada') return null

  const { emTrial, diasRestantesTrial } = assinatura.assinatura.situacao

  if (!emTrial || diasRestantesTrial === null) return null

  const ultimoDia = diasRestantesTrial <= 1
  const texto = ultimoDia
    ? 'Teste termina hoje'
    : `${diasRestantesTrial} dias de teste`

  const conteudo = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-label-sm font-medium ${
        ultimoDia
          ? 'bg-error-container text-on-error-container'
          : 'bg-surface-container-high text-on-surface-variant'
      }`}
    >
      <Icon name={ultimoDia ? 'schedule' : 'hourglass_top'} size={14} />
      {texto}
    </span>
  )

  // Só quem pode resolver ganha o atalho; para os demais o aviso é informativo,
  // e um link para uma página que eles não podem usar só frustraria.
  return assinatura.assinatura.podeGerenciar ? (
    <Link to="/assinatura" title="Ver assinatura">
      {conteudo}
    </Link>
  ) : (
    conteudo
  )
}
