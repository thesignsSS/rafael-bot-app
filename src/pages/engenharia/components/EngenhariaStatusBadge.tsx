import type { EngenhariaRequestStatus } from '../types/engenhariaRequest'

const STATUS_CLASS_NAME: Record<EngenhariaRequestStatus, string> = {
  pending: 'border-amber-400/30 bg-amber-500/10 text-amber-300',
  in_progress: 'border-sky-400/30 bg-sky-500/10 text-sky-300',
  completed: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-400',
  cancelled: 'border-error/30 bg-error/10 text-error',
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
