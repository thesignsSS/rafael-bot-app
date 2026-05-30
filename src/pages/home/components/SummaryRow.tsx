type SummaryRowProps = {
  label: string
  value: string
  muted?: boolean
  success?: boolean
}

export function SummaryRow({
  label,
  value,
  muted = false,
  success = false,
}: SummaryRowProps) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-1">
      <dt className="font-semibold text-on-surface-variant">{label}:</dt>
      <dd
        className={`font-bold ${
          success ? 'text-emerald-600' : muted ? 'text-outline' : 'text-primary'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}
