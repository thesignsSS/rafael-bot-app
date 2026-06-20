import {
  isBrazilTheme,
  usePreferences,
} from '../../contexts/preferences-context'
import { CopaThemeBadge } from '../brand/CopaThemeBadge'
import { ThemeBrandMark } from '../brand/ThemeBrandMark'

type AuthHeaderProps = {
  subtitle?: string
}

export function AuthHeader({ subtitle }: AuthHeaderProps) {
  const { preferences } = usePreferences()
  const isBrazucaTheme = isBrazilTheme(preferences.theme)

  return (
    <div className="animate-fade-up mb-10 flex flex-col items-center">
      <ThemeBrandMark size="md" className="mb-4" />
      <CopaThemeBadge className="mb-3" />
      <h1 className="text-headline-xl font-bold tracking-tight text-primary">
        Effectus
      </h1>
      <p className="text-body-md text-on-surface-variant">
        {isBrazucaTheme ? 'Documentos em clima de Copa' : 'Documentos e Gestão'}
      </p>
      {subtitle ? (
        <p className="mt-4 text-headline-md font-semibold text-on-surface">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
