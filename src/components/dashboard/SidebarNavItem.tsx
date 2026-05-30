import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'

type SidebarNavItemProps = {
  icon: string
  label: string
  to: string
  end?: boolean
  onNavigate?: () => void
}

export function SidebarNavItem({
  icon,
  label,
  to,
  end = false,
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
      <span>{label}</span>
    </NavLink>
  )
}
