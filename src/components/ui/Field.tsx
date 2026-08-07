import type { ReactNode } from 'react'

type FieldProps = {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
}

export function Field({
  label,
  required = false,
  hint,
  error,
  children,
}: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="block text-label-md font-semibold text-on-surface">
        {label}{' '}
        {required ? (
          <span className="text-error" aria-hidden>
            *
          </span>
        ) : null}
        {hint ? (
          <span className="font-normal text-outline">({hint})</span>
        ) : null}
      </span>
      {children}
      {error ? (
        <span className="block text-body-sm text-error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  )
}
