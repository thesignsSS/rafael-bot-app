import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'

type SidebarNavItemProps = {
  icon: string
  label: string
  to: string
  end?: boolean
  showIndicator?: boolean
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
  indicatorClassName,
  onNavigate,
  isCollapsed = false,
}: SidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      title={isCollapsed ? label : undefined}
      className={({ isActive }) =>
        `relative flex h-11 w-full items-center rounded-lg text-left text-label-md font-semibold transition-colors ${
          isActive
            ? 'bg-primary-container text-on-primary-container'
            : 'text-on-surface-variant hover:bg-surface-container-high'
        } ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}`
      }
    >
      <Icon name={icon} size={20} />
      {!isCollapsed ? (
        <span className="flex min-w-0 items-center gap-2">
          <span>{label}</span>
          {showIndicator ? (
            <span
              className={`inline-flex h-2.5 w-2.5 rounded-full animate-gentle-pulse ${
                indicatorClassName ??
                'bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.14)]'
              }`}
              aria-label="Há proposta pendente"
              title="Há proposta pendente"
            />
          ) : null}
        </span>
      ) : showIndicator ? (
        <span
          className={`absolute right-2 top-2 inline-flex h-2.5 w-2.5 rounded-full animate-gentle-pulse ${
            indicatorClassName ??
            'bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.14)]'
          }`}
          aria-label="Há proposta pendente"
          title="Há proposta pendente"
        />
      ) : null}
    </NavLink>
  )
}
