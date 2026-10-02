import { Icon } from '../../../components/ui/Icon'

type PropertyPageHeaderProps = {
  title: string
  description: string
  onBack: () => void
}

export function PropertyPageHeader({ title, description, onBack }: PropertyPageHeaderProps) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="group mb-4 flex min-h-11 items-center gap-1 text-label-md font-medium text-on-surface-variant transition-colors hover:text-primary"
      >
        <Icon name="arrow_back" size={18} />
        Voltar
      </button>

      <section className="mb-8 flex items-start gap-4 border-b border-outline-variant/60 pb-7">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon name="home_work" size={32} />
        </div>
        <div>
          <h1 className="text-headline-xl font-bold text-on-surface">{title}</h1>
          <p className="mt-1 max-w-3xl text-body-md text-on-surface-variant">{description}</p>
        </div>
      </section>
    </>
  )
}
