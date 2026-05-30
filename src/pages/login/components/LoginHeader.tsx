import { Icon } from '../../../components/ui/Icon'

export function LoginHeader() {
  return (
    <div className="animate-fade-up mb-10 flex flex-col items-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary-container text-on-primary-container shadow-sm">
        <Icon name="robot_2" size={40} />
      </div>
      <h1 className="text-headline-xl font-bold tracking-tight text-primary">
        Rafael Bot
      </h1>
      <p className="text-body-md text-on-surface-variant">Documentos e Gestão</p>
    </div>
  )
}
