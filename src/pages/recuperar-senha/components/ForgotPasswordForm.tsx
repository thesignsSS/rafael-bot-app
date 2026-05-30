import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { useForgotPasswordForm } from '../hooks/useForgotPasswordForm'

type ForgotPasswordFormProps = {
  onEmailSent: (email: string) => void
}

export function ForgotPasswordForm({ onEmailSent }: ForgotPasswordFormProps) {
  const { email, fieldErrors, isSubmitting, handleSubmit, handleEmailChange } =
    useForgotPasswordForm({ onEmailSent })

  return (
    <form
      noValidate
      className="animate-fade-up-delay-2 space-y-6"
      onSubmit={handleSubmit}
    >
      <p className="text-body-md text-on-surface-variant">
        Informe o e-mail da sua conta. Enviaremos um link para redefinir sua
        senha.
      </p>

      <TextField
        id="email"
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="seu@email.com.br"
        value={email}
        error={fieldErrors.email}
        onChange={(event) => handleEmailChange(event.target.value)}
      />

      <Button type="submit" loading={isSubmitting} icon="send">
        Enviar link
      </Button>

      <div className="mt-8 border-t border-outline-variant pt-8 text-center">
        <Link
          to="/login"
          className="text-label-md font-medium text-primary transition-all hover:underline"
        >
          Voltar ao login
        </Link>
      </div>
    </form>
  )
}
