type ProposalInfoFieldProps = {
  label: string
  value: string
}

export function ProposalInfoField({ label, value }: ProposalInfoFieldProps) {
  return (
    <div>
      <span className="block text-label-sm font-medium text-on-surface-variant">
        {label}
      </span>
      <p className="text-body-md font-medium text-on-surface">{value}</p>
    </div>
  )
}
