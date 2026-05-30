import { Link } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'

type ResetEmailConfirmScreenProps = {
  email: string
}

export function ResetEmailConfirmScreen({ email }: ResetEmailConfirmScreenProps) {
  return (
    <div className="animate-fade-up-delay-2 space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-primary-container text-on-primary-container shadow-sm">
        <Icon name="mark_email_read" size={40} />
      </div>
      <div className="space-y-2">
        <h2 className="text-headline-lg font-semibold text-on-surface">
          Verifique seu e-mail
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Enviamos um link de recuperação para{' '}
          <span className="font-medium text-on-surface">{email}</span>. Acesse
          sua caixa de entrada e clique no link para redefinir sua senha.
        </p>
      </div>
      <Link
        to="/login"
        className="inline-block text-label-md font-medium text-primary transition-all hover:underline"
      >
        Voltar ao login
      </Link>
    </div>
  )
}
