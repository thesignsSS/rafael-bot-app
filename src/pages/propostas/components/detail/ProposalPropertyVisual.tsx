type ProposalPropertyVisualProps = {
  imageUrl: string
  caption: string
  subtitle: string
}

export function ProposalPropertyVisual({
  imageUrl,
  caption,
  subtitle,
}: ProposalPropertyVisualProps) {
  return (
    <div className="relative h-48 overflow-hidden rounded-xl border border-outline-variant">
      <img
        src={imageUrl}
        alt={subtitle}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-4">
        <p className="text-label-sm font-bold text-white">{caption}</p>
        <p className="text-body-sm text-white/80">{subtitle}</p>
      </div>
    </div>
  )
}
