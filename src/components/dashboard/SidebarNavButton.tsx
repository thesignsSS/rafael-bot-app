import { Icon } from '../ui/Icon'

type SidebarNavButtonProps = {
  icon: string
  label: string
}

export function SidebarNavButton({ icon, label }: SidebarNavButtonProps) {
  return (
    <button
      type="button"
      disabled
      className="flex h-11 w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 text-left text-label-md font-semibold text-on-surface-variant opacity-60"
    >
      <Icon name={icon} size={20} />
      <span>{label}</span>
    </button>
  )
}
