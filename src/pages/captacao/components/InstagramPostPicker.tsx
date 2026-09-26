import { Icon } from '../../../components/ui/Icon'
import type { InstagramPost } from '../lib/captacaoApi'

type InstagramPostPickerProps = {
  posts: InstagramPost[]
  isLoading: boolean
  error: string | null
  selectedId: string
  onSelect: (id: string) => void
  onRetry: () => void
}

export function InstagramPostPicker({
  posts,
  isLoading,
  error,
  selectedId,
  onSelect,
  onRetry,
}: InstagramPostPickerProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className="aspect-square animate-pulse rounded-lg bg-surface-container" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border border-error/30 bg-error/5 p-4">
        <p className="text-body-md text-error">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="text-label-md font-semibold text-primary hover:underline"
        >
          Tentar de novo
        </button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <p className="rounded-lg border border-outline-variant bg-surface-container-low p-4 text-body-md text-on-surface-variant">
        Nenhuma publicação encontrada no Instagram conectado.
      </p>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label="Publicação do Instagram"
      className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5"
    >
      {posts.map((post) => {
        const isSelected = post.id === selectedId
        return (
          <button
            key={post.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            title={post.caption ?? undefined}
            onClick={() => onSelect(post.id)}
            className={`group relative aspect-square overflow-hidden rounded-lg border-2 bg-surface-container transition-all ${
              isSelected
                ? 'border-primary ring-2 ring-primary/30'
                : 'border-transparent hover:border-outline-variant'
            }`}
          >
            {post.thumbnailUrl ? (
              <img
                src={post.thumbnailUrl}
                alt={post.caption ?? 'Publicação do Instagram'}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-on-surface-variant">
                <Icon name="image" />
              </span>
            )}
            {post.mediaType === 'VIDEO' ? (
              <span className="absolute right-1.5 top-1.5 rounded-full bg-black/55 p-0.5 text-white">
                <Icon name="play_arrow" size={16} />
              </span>
            ) : null}
            {isSelected ? (
              <span className="absolute inset-0 flex items-center justify-center bg-primary/25">
                <span className="rounded-full bg-primary p-1 text-on-primary shadow">
                  <Icon name="check" size={20} />
                </span>
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
