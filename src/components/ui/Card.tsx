import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
}

export function Card({ children }: CardProps) {
  return (
    <div className="card animate-fade-up-delay-1 w-full max-w-[440px] rounded-xl border border-outline-variant bg-surface-container-lowest p-8 md:p-10">
      {children}
    </div>
  )
}
