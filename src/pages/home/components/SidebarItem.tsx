import { Icon } from '../../../components/ui/Icon'

type SidebarItemProps = {
  icon: string
  label: string
  active?: boolean
}

export function SidebarItem({ icon, label, active = false }: SidebarItemProps) {
  return (
    <button
      type="button"
      className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-label-md font-semibold transition-colors ${
        active
          ? 'bg-primary-fixed text-primary'
          : 'text-on-surface-variant hover:bg-surface-container-low'
      }`}
    >
      <Icon name={icon} size={20} />
      <span>{label}</span>
    </button>
  )
}
