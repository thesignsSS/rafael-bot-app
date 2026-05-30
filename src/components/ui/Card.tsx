import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
}

export function Card({ children }: CardProps) {
  return (
    <div className="card w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-8">
      {children}
    </div>
  )
}
