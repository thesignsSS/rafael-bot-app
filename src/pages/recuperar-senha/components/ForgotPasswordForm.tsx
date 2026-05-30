import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { supabase } from '../../../lib/supabase'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '../schemas/forgotPasswordSchema'

type ForgotPasswordFormProps = {
  onEmailSent: (email: string) => void
}

function mapFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Partial<Record<keyof ForgotPasswordFormData, string>> {
  const errors: Partial<Record<keyof ForgotPasswordFormData, string>> = {}
  const messages = fieldErrors.email
  if (messages?.[0]) {
    errors.email = messages[0]
  }
  return errors
}

export function ForgotPasswordForm({ onEmailSent }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ForgotPasswordFormData, string>>
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = forgotPasswordSchema.safeParse({ email })

    if (!result.success) {
      setFieldErrors(mapFieldErrors(result.error.flatten().fieldErrors))
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)

    const { error } = await supabase.auth.resetPasswordForEmail(
      result.data.email,
      {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      },
    )

    setIsSubmitting(false)

    if (error) {
      toast.error('Não foi possível enviar. Tente novamente.')
      return
    }

    onEmailSent(result.data.email)
  }

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
        onChange={(event) => {
          setEmail(event.target.value)
          if (fieldErrors.email) {
            setFieldErrors((prev) => ({ ...prev, email: undefined }))
          }
        }}
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
