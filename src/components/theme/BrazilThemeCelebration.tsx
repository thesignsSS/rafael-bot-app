import { useEffect, useRef, useState } from 'react'
import {
  isBrazilTheme,
  usePreferences,
} from '../../contexts/preferences-context'

const CELEBRATION_DURATION_MS = 2200

export function BrazilThemeCelebration() {
  const { preferences } = usePreferences()
  const previousThemeRef = useRef(preferences.theme)
  const hasMountedRef = useRef(false)
  const timeoutRef = useRef<number | null>(null)
  const [burstKey, setBurstKey] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const previousTheme = previousThemeRef.current
    const nextTheme = preferences.theme

    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      previousThemeRef.current = nextTheme
      return
    }

    if (previousTheme !== nextTheme && isBrazilTheme(nextTheme)) {
      setBurstKey((current) => current + 1)
      setIsVisible(true)

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(false)
        timeoutRef.current = null
      }, CELEBRATION_DURATION_MS)
    }

    previousThemeRef.current = nextTheme
  }, [preferences.theme])

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div
      key={burstKey}
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      <div className="brazil-celebration-glow" />

      {[
        'left-[10%] top-[12%] bg-[#119347] delay-[0ms]',
        'left-[18%] top-[18%] bg-[#f7d038] delay-[120ms]',
        'left-[28%] top-[10%] bg-white delay-[240ms]',
        'left-[40%] top-[16%] bg-[#1f54c8] delay-[80ms]',
        'left-[54%] top-[10%] bg-[#119347] delay-[180ms]',
        'left-[66%] top-[14%] bg-[#f7d038] delay-[40ms]',
        'left-[78%] top-[12%] bg-white delay-[200ms]',
        'left-[88%] top-[18%] bg-[#1f54c8] delay-[100ms]',
      ].map((className, index) => (
        <span
          key={`confetti-${index}`}
          className={`brazil-celebration-confetti absolute h-4 w-1.5 rotate-[18deg] rounded-full opacity-90 ${className}`}
        />
      ))}

      {[
        'left-[14%] top-[16%] delay-[0ms]',
        'left-[72%] top-[12%] delay-[140ms]',
        'left-[84%] top-[24%] delay-[280ms]',
      ].map((className, index) => (
        <span
          key={`ball-${index}`}
          className={`brazil-celebration-ball absolute flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_10px_24px_rgba(7,90,48,0.18)] ${className}`}
        >
          <span className="relative block h-6 w-6 rounded-full bg-white">
            <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-[0.35rem] bg-[#111827]" />
          </span>
        </span>
      ))}

      <div className="brazil-celebration-banner absolute left-1/2 top-14 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-white">
        Tema Brazuca ativado
      </div>
    </div>
  )
}
