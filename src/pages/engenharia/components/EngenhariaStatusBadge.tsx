import type { EngenhariaRequestStatus } from '../types/engenhariaRequest'

const STATUS_CLASS_NAME: Record<EngenhariaRequestStatus, string> = {
  solicitar_engenharia: 'border-sky-400/30 bg-sky-500/10 text-sky-300',
  pendencia: 'border-amber-400/30 bg-amber-500/10 text-amber-300',
  boleto_enviado: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-400',
  ordem_servico: 'border-violet-400/30 bg-violet-500/10 text-violet-300',
  engenharia_concluida: 'border-green-400/30 bg-green-500/10 text-green-400',
}

type EngenhariaStatusBadgeProps = {
  status: EngenhariaRequestStatus
  statusLabel: string
}

export function EngenhariaStatusBadge({
  status,
  statusLabel,
}: EngenhariaStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_CLASS_NAME[status]}`}
    >
      {statusLabel}
    </span>
  )
}
