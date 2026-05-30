import type { InputHTMLAttributes, ReactNode } from 'react'
import { useId } from 'react'

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string
  error?: string
  endAdornment?: ReactNode
  id?: string
}

export function TextField({
  label,
  error,
  endAdornment,
  className = '',
  id: idProp,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const errorId = `${id}-error`

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-label-md font-medium text-on-surface-variant"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-12 w-full rounded-lg border bg-white px-4 py-3 text-body-md text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            error ? 'border-error' : 'border-outline-variant'
          } ${endAdornment ? 'pr-12' : ''} ${className}`}
          {...inputProps}
        />
        {endAdornment ? (
          <div className="absolute inset-y-0 right-0 flex w-12 items-center justify-center">
            {endAdornment}
          </div>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="text-body-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
