import { PROPERTY_STATUS_TONE } from '../lib/propertyStatus'
import type { PropertyStatus } from '../types'

export function PropertyStatusPill({ status, label }: { status: PropertyStatus; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-label-sm font-semibold ${PROPERTY_STATUS_TONE[status]}`}
    >
      {label}
    </span>
  )
}
