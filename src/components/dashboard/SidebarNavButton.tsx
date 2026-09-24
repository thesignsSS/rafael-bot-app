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
  if (isCollapsed) {
    return (
      <button
        type="button"
        disabled
        title={label}
        className="flex w-full cursor-not-allowed flex-col items-center gap-1 rounded-lg px-1 py-2 text-center text-on-surface-variant opacity-60"
      >
        <Icon name={icon} size={22} />
        <span className="line-clamp-2 text-[10px] leading-tight font-semibold break-words">
          {label}
        </span>
      </button>
    )
  }

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
