import {
  isBrazilTheme,
  usePreferences,
} from '../../../contexts/preferences-context'

export function LoginConfetti() {
  const { preferences } = usePreferences()

  if (!isBrazilTheme(preferences.theme)) {
    return null
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      aria-hidden="true"
    >
      {[
        'left-[10%] top-[12%] h-2.5 w-1 bg-[#119347] rotate-[18deg]',
        'left-[18%] top-[22%] h-2 w-2 rounded-full bg-[#f7d038]',
        'left-[74%] top-[14%] h-3 w-1 bg-[#1f54c8] -rotate-[20deg]',
        'left-[84%] top-[24%] h-2.5 w-2.5 rounded-full bg-white/80',
        'left-[8%] top-[72%] h-3 w-1 bg-[#f7d038] rotate-[26deg]',
        'left-[88%] top-[78%] h-2.5 w-1 bg-[#119347] -rotate-[16deg]',
        'left-[68%] top-[84%] h-2 w-2 rounded-full bg-[#1f54c8]',
        'left-[30%] top-[10%] h-2.5 w-1 bg-white/75 rotate-[30deg]',
      ].map((className, index) => (
        <span
          key={index}
          className={`login-confetti-piece absolute opacity-75 shadow-[0_4px_10px_rgba(7,90,48,0.08)] ${className}`}
        />
      ))}
    </div>
  )
}
