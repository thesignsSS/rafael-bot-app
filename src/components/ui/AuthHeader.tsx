import {
  isBrazilTheme,
  usePreferences,
} from '../../contexts/preferences-context'
import { useTenant } from '../../hooks/useTenant'
import { CopaThemeBadge } from '../brand/CopaThemeBadge'
import { ThemeBrandMark } from '../brand/ThemeBrandMark'

type AuthHeaderProps = {
  subtitle?: string
}

export function AuthHeader({ subtitle }: AuthHeaderProps) {
  const { preferences } = usePreferences()
  const isBrazucaTheme = isBrazilTheme(preferences.theme)
  const tenant = useTenant()

  const nomeEmpresa =
    tenant.status === 'encontrada' ? tenant.empresa.nome : null
  const logoUrl =
    tenant.status === 'encontrada' ? tenant.empresa.logoUrl : null

  return (
    <div className="animate-fade-up mb-10 flex flex-col items-center">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={`Logo de ${nomeEmpresa}`}
          className="mb-4 h-16 w-16 rounded-2xl object-contain"
        />
      ) : (
        <ThemeBrandMark size="md" className="mb-4" />
      )}

      <CopaThemeBadge className="mb-3" />

      <h1 className="text-headline-xl font-bold tracking-tight text-primary">
        {nomeEmpresa ?? 'Effectus'}
      </h1>

      <p className="text-body-md text-on-surface-variant">
        {isBrazucaTheme ? 'Documentos em clima de Copa' : 'Documentos e Gestão'}
      </p>

      {tenant.status === 'nao-encontrada' && (
        <p className="mt-3 text-body-sm text-error">
          Não encontramos uma empresa para este endereço.
        </p>
      )}

      {subtitle ? (
        <p className="mt-4 text-headline-md font-semibold text-on-surface">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
