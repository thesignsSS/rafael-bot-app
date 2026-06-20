import {
  isBrazilTheme,
  usePreferences,
} from '../../contexts/preferences-context'
import { Icon } from './Icon'

export function SessionLoadingScreen() {
  const { preferences } = usePreferences()
  const isBrazucaTheme = isBrazilTheme(preferences.theme)

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      {isBrazucaTheme ? (
        <div
          className="loading-soccer-ball h-16 w-16 drop-shadow-[0_14px_30px_rgba(7,90,48,0.2)]"
          aria-hidden
        >
          <svg viewBox="0 0 80 80" className="h-full w-full animate-spin">
            <circle cx="40" cy="40" r="34" fill="#fffef7" />
            <path
              d="M40 21.5l8.8 6.4 3.4 10.5-6.4 8.8H34.2l-6.4-8.8 3.4-10.5 8.8-6.4Z"
              fill="#111827"
            />
            <path
              d="M40 21.5v8.1m-8.5 17h17m-13.9-3.5-4.7 6.8m20.1-6.8 4.7 6.8m-24.1-22 7.5 5.3m17-5.3-7.5 5.3"
              fill="none"
              stroke="#111827"
              strokeLinecap="round"
              strokeWidth="2.4"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="#119347"
              strokeOpacity="0.16"
              strokeWidth="3"
            />
          </svg>
        </div>
      ) : (
        <Icon
          name="sync"
          size={32}
          className="animate-spin text-primary"
          aria-hidden
        />
      )}
      <span className="sr-only">Carregando sessão...</span>
    </div>
  )
}
