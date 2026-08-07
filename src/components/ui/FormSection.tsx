import type { ReactNode } from 'react'
import { Icon } from './Icon'

type FormSectionProps = {
  icon: string
  title: string
  description?: string
  optional?: boolean
  children: ReactNode
}

export function FormSection({
  icon,
  title,
  description,
  optional = false,
  children,
}: FormSectionProps) {
  return (
    <section className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon name={icon} size={22} />
        </div>
        <div>
          <h2 className="text-headline-md font-bold text-on-surface">
            {title}{' '}
            {optional ? (
              <span className="text-body-sm font-normal text-outline">
                (opcional)
              </span>
            ) : null}
          </h2>
          {description ? (
            <p className="mt-1 text-body-md text-on-surface-variant">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  )
}
