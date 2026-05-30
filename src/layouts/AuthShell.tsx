import type { ReactNode } from 'react'

type AuthShellProps = {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col font-sans text-body-md text-on-surface">
      <main className="flex grow items-center justify-center px-4 py-12">
        {children}
      </main>
      <footer className="w-full py-6 text-center">
        <p className="text-body-sm text-secondary opacity-70">
          © 2026 Rafael Bot. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  )
}
