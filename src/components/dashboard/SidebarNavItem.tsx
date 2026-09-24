import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'

type SidebarNavItemProps = {
  icon: string
  label: string
  to: string
  end?: boolean
  showIndicator?: boolean
  indicatorCount?: number
  indicatorClassName?: string
  onNavigate?: () => void
  isCollapsed?: boolean
}

export function SidebarNavItem({
  icon,
  label,
  to,
  end = false,
  showIndicator = false,
  indicatorCount = 0,
  indicatorClassName,
  onNavigate,
  isCollapsed = false,
}: SidebarNavItemProps) {
  const hasCount = indicatorCount > 0

  const indicatorDot = (
    <span
      className={`inline-flex h-2.5 w-2.5 rounded-full animate-gentle-pulse ${
        indicatorClassName ?? 'bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.14)]'
      }`}
      aria-label="Há proposta pendente"
      title="Há proposta pendente"
    />
  )

  const indicatorBadge = (extraClassName: string) => (
    <span
      className={`inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white ${extraClassName}`}
      aria-label={`${indicatorCount} item(ns) pendente(s)`}
      title={`${indicatorCount} item(ns) pendente(s)`}
    >
      {indicatorCount > 9 ? '9+' : indicatorCount}
    </span>
  )

  if (isCollapsed) {
    return (
      <NavLink
        to={to}
        end={end}
        onClick={onNavigate}
        title={label}
        className={({ isActive }) =>
          `relative flex w-full flex-col items-center gap-1 rounded-lg px-1 py-2 text-center transition-colors ${
            isActive
              ? 'bg-primary-container text-on-primary-container'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`
        }
      >
        <Icon name={icon} size={22} />
        <span className="line-clamp-2 text-[10px] leading-tight font-semibold break-words">
          {label}
        </span>
        {hasCount
          ? indicatorBadge('absolute right-1 top-1')
          : showIndicator
            ? <span className="absolute right-2 top-2">{indicatorDot}</span>
            : null}
      </NavLink>
    )
  }

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `relative flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-label-md font-semibold transition-colors ${
          isActive
            ? 'bg-primary-container text-on-primary-container'
            : 'text-on-surface-variant hover:bg-surface-container-high'
        }`
      }
    >
      <Icon name={icon} size={20} />
      <span className="flex min-w-0 items-center gap-2">
        <span>{label}</span>
        {hasCount ? indicatorBadge('') : showIndicator ? indicatorDot : null}
      </span>
    </NavLink>
  )
}
