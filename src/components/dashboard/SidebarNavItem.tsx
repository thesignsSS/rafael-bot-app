import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'

type SidebarNavItemProps = {
  icon: string
  label: string
  to: string
  end?: boolean
  showIndicator?: boolean
  onNavigate?: () => void
}

export function SidebarNavItem({
  icon,
  label,
  to,
  end = false,
  showIndicator = false,
  onNavigate,
}: SidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-label-md font-semibold transition-colors ${
          isActive
            ? 'bg-primary-container text-on-primary-container'
            : 'text-on-surface-variant hover:bg-surface-container-high'
        }`
      }
    >
      <Icon name={icon} size={20} />
      <span className="flex min-w-0 items-center gap-2">
        <span>{label}</span>
        {showIndicator ? (
          <span
            className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.14)] animate-gentle-pulse"
            aria-label="Há proposta pendente"
            title="Há proposta pendente"
          />
        ) : null}
      </span>
    </NavLink>
  )
}
