import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
}

export function Card({ children }: CardProps) {
  return (
    <div className="card relative w-full max-w-md overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-8">
      {children}
    </div>
  )
}
