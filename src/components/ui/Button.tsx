import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon } from './Icon'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  icon?: string
  children: ReactNode
}

export function Button({
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled ?? loading}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-container text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary hover:shadow-md active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70 ${className}`}
      {...props}
    >
      {loading ? (
        <Icon name="sync" size={20} className="animate-spin" />
      ) : (
        <>
          <span>{children}</span>
          {icon ? <Icon name={icon} size={20} /> : null}
        </>
      )}
    </button>
  )
}
