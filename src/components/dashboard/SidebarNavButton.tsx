import { Icon } from '../ui/Icon'

type SidebarNavButtonProps = {
  icon: string
  label: string
  isCollapsed?: boolean
}

export function SidebarNavButton({
  icon,
  label,
  isCollapsed = false,
}: SidebarNavButtonProps) {
  return (
    <button
      type="button"
      disabled
      title={isCollapsed ? label : undefined}
      className={`flex h-11 w-full cursor-not-allowed items-center rounded-lg text-left text-label-md font-semibold text-on-surface-variant opacity-60 ${
        isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
      }`}
    >
      <Icon name={icon} size={20} />
      {!isCollapsed ? <span>{label}</span> : null}
    </button>
  )
}
