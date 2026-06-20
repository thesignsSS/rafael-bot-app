import {
  isBrazilTheme,
  usePreferences,
} from '../../contexts/preferences-context'
import { Icon } from '../ui/Icon'

type ThemeBrandMarkProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSNAME: Record<NonNullable<ThemeBrandMarkProps['size']>, string> = {
  sm: 'h-10 w-10 rounded-xl',
  md: 'h-16 w-16 rounded-2xl',
  lg: 'h-20 w-20 rounded-[1.75rem]',
}

const ICON_SIZE: Record<NonNullable<ThemeBrandMarkProps['size']>, number> = {
  sm: 24,
  md: 40,
  lg: 52,
}

export function ThemeBrandMark({
  size = 'sm',
  className = '',
}: ThemeBrandMarkProps) {
  const { preferences } = usePreferences()

  if (isBrazilTheme(preferences.theme)) {
    return (
      <div
        className={`theme-brand-mark theme-brand-mark-brazuca relative flex shrink-0 items-center justify-center overflow-hidden border border-[#f7d038]/60 bg-[linear-gradient(145deg,#0f8a47_0%,#0a6c3a_100%)] text-white shadow-[0_14px_32px_rgba(7,90,48,0.22)] ${SIZE_CLASSNAME[size]} ${className}`}
      >
        <svg
          viewBox="0 0 80 80"
          className="h-[82%] w-[82%]"
          role="img"
          aria-label="Bandeira do Brasil"
        >
          <rect x="7" y="12" width="66" height="48" rx="8" fill="#119347" />
          <path d="M40 18 61 36 40 54 19 36Z" fill="#f7d038" />
          <circle cx="40" cy="36" r="10.5" fill="#1f54c8" />
          <path
            d="M31.5 37.6c3.3-2.3 8.8-3.2 16.7-1.6"
            fill="none"
            stroke="#ffffff"
            strokeLinecap="round"
            strokeWidth="2.2"
          />
          <circle cx="56" cy="54" r="11" fill="#fffef7" />
          <path
            d="M56 47.2l3.8 2.8 1.5 4.6-2.8 3.8h-5l-2.8-3.8 1.5-4.6 3.8-2.8Z"
            fill="#111827"
          />
          <path
            d="M56 47.2v3.7m-3.7 2.8h7.4m-6-1.4-2 3m8-3 2 3"
            fill="none"
            stroke="#111827"
            strokeLinecap="round"
            strokeWidth="1.3"
          />
        </svg>
      </div>
    )
  }

  return (
    <div
      className={`theme-brand-mark flex shrink-0 items-center justify-center bg-primary text-on-primary shadow-sm ${SIZE_CLASSNAME[size]} ${className}`}
    >
      <Icon name="robot_2" size={ICON_SIZE[size]} />
    </div>
  )
}
