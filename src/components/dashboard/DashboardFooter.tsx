export function DashboardFooter() {
  return (
    <footer className="mt-12 flex flex-col items-center justify-center gap-4 border-t border-outline-variant py-12 sm:flex-row sm:gap-8">
      <p className="text-body-sm text-on-surface-variant">
        © 2024 Rafael Bot. Todos os direitos reservados.
      </p>
      <div className="flex gap-4">
        <a
          href="#"
          className="text-body-sm text-on-surface-variant transition-colors hover:text-primary"
        >
          Política de Privacidade
        </a>
        <a
          href="#"
          className="text-body-sm text-on-surface-variant transition-colors hover:text-primary"
        >
          Termos de Uso
        </a>
      </div>
    </footer>
  )
}
