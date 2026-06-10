import type { ProposalStatus } from '../../types/proposal-detail'

const STATUS_STYLES: Record<
  ProposalStatus,
  { container: string; label: string }
> = {
  Enviada: {
    container: 'bg-secondary-container text-on-secondary-container',
    label: 'Enviada',
  },
  'Em análise': {
    container: 'bg-primary-fixed text-on-primary-fixed',
    label: 'Em análise',
  },
  Finalizada: {
    container: 'bg-surface-container-high text-on-surface',
    label: 'Finalizada',
  },
}

type ProposalStatusBadgeProps = {
  status: ProposalStatus
}

export function ProposalStatusBadge({ status }: ProposalStatusBadgeProps) {
  const styles = STATUS_STYLES[status]

  return (
    <span
      className={`rounded-full px-3 py-1 text-label-sm font-semibold uppercase tracking-wider ${styles.container}`}
    >
      {styles.label}
    </span>
  )
}
