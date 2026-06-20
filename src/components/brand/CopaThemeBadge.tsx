import {
  isBrazilTheme,
  usePreferences,
} from '../../contexts/preferences-context'

type CopaThemeBadgeProps = {
  className?: string
}

export function CopaThemeBadge({ className = '' }: CopaThemeBadgeProps) {
  const { preferences } = usePreferences()

  if (!isBrazilTheme(preferences.theme)) {
    return null
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-[#f7d038]/65 bg-[linear-gradient(90deg,rgba(17,147,71,0.96)_0%,rgba(247,208,56,0.96)_58%,rgba(31,84,200,0.92)_100%)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_10px_24px_rgba(7,90,48,0.18)] ${className}`}
    >
      <span className="h-2 w-2 rounded-full bg-white/90" aria-hidden="true" />
      Tema Copa 2026
    </span>
  )
}
