import type { InputHTMLAttributes } from 'react'
import { useId } from 'react'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> & {
  label: string
  error?: string
  id?: string
}

export function Checkbox({
  label,
  error,
  className = '',
  id: idProp,
  ...inputProps
}: CheckboxProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const errorId = `${id}-error`

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`mt-0.5 size-4 shrink-0 rounded border outline-none transition-all focus:ring-2 focus:ring-primary/20 ${
            error
              ? 'border-error accent-error'
              : 'border-outline-variant accent-primary'
          } ${className}`}
          {...inputProps}
        />
        <label
          htmlFor={id}
          className="text-body-md text-on-surface-variant"
        >
          {label}
        </label>
      </div>
      {error ? (
        <p id={errorId} className="text-body-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
