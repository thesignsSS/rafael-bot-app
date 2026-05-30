import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { TextField } from '../../../components/ui/TextField'
import { supabase } from '../../../lib/supabase'
import {
  loginSchema,
  type LoginFormData,
} from '../schemas/loginSchema'

function mapFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Partial<Record<keyof LoginFormData, string>> {
  const errors: Partial<Record<keyof LoginFormData, string>> = {}
  for (const key of ['email', 'password'] as const) {
    const messages = fieldErrors[key]
    if (messages?.[0]) {
      errors[key] = messages[0]
    }
  }
  return errors
}


function getLoginErrorMessage(error: { code?: string; message?: string }): string {
  if (
    error.code === 'email_not_confirmed' ||
    error.message === 'Email not confirmed'
  ) {
    return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.'
  }

  return 'E-mail ou senha incorretos'
}

export function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = loginSchema.safeParse({ email, password })

    if (!result.success) {
      setFieldErrors(mapFieldErrors(result.error.flatten().fieldErrors))
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    })

    setIsSubmitting(false)

    if (error) {
      toast.error(getLoginErrorMessage(error))
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <form
      noValidate
      className="animate-fade-up-delay-2 space-y-6"
      onSubmit={handleSubmit}
    >
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

      <TextField
        id="password"
        label="Senha"
        name="password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        error={fieldErrors.password}
        onChange={(event) => {
          setPassword(event.target.value)
          if (fieldErrors.password) {
            setFieldErrors((prev) => ({ ...prev, password: undefined }))
          }
        }}
        endAdornment={
          <button
            type="button"
            className="flex size-10 items-center justify-center text-outline transition-colors hover:text-primary"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Icon
              name={showPassword ? 'visibility_off' : 'visibility'}
              size={20}
            />
          </button>
        }
      />

      <div className="flex items-center justify-end">
        <Link
          to="/recuperar-senha"
          className="text-label-md font-medium text-primary transition-all hover:underline"
        >
          Esqueceu sua senha?
        </Link>
      </div>

      <Button type="submit" loading={isSubmitting} icon="login">
        Entrar
      </Button>

      <div className="mt-8 border-t border-outline-variant pt-8 text-center">
        <p className="text-body-md text-on-surface-variant">
          Ainda não tem uma conta?{' '}
          <Link
            to="/cadastro"
            className="font-semibold text-primary hover:underline"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </form>
  )
}
