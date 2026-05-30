import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/Button'
import { Checkbox } from '../../../components/ui/Checkbox'
import { Icon } from '../../../components/ui/Icon'
import { TextField } from '../../../components/ui/TextField'
import { supabase } from '../../../lib/supabase'
import {
  signupSchema,
  type SignupFormData,
} from '../schemas/signupSchema'

type CadastroFormProps = {
  onSignupPending: (email: string) => void
}

function mapFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Partial<Record<keyof SignupFormData, string>> {
  const errors: Partial<Record<keyof SignupFormData, string>> = {}
  for (const key of [
    'fullName',
    'email',
    'password',
    'confirmPassword',
    'acceptedTerms',
  ] as const) {
    const messages = fieldErrors[key]
    if (messages?.[0]) {
      errors[key] = messages[0]
    }
  }
  return errors
}

export function CadastroForm({ onSignupPending }: CadastroFormProps) {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof SignupFormData, string>>
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clearFieldError = (field: keyof SignupFormData) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = signupSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
      acceptedTerms,
    })

    if (!result.success) {
      setFieldErrors(mapFieldErrors(result.error.flatten().fieldErrors))
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)

    const { data, error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: { full_name: result.data.fullName.trim() },
      },
    })

    setIsSubmitting(false)

    if (error) {
      toast.error('Não foi possível criar a conta. Tente novamente.')
      return
    }

    if (data.session) {
      navigate('/', { replace: true })
      return
    }

    onSignupPending(result.data.email)
  }

  return (
    <form
      noValidate
      className="animate-fade-up-delay-2 space-y-6"
      onSubmit={handleSubmit}
    >
      <TextField
        id="fullName"
        label="Nome completo"
        name="fullName"
        type="text"
        autoComplete="name"
        placeholder="Seu nome completo"
        value={fullName}
        error={fieldErrors.fullName}
        onChange={(event) => {
          setFullName(event.target.value)
          clearFieldError('fullName')
        }}
      />

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
          clearFieldError('email')
        }}
      />

      <TextField
        id="password"
        label="Senha"
        name="password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder="••••••••"
        value={password}
        error={fieldErrors.password}
        onChange={(event) => {
          setPassword(event.target.value)
          clearFieldError('password')
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

      <TextField
        id="confirmPassword"
        label="Confirmar senha"
        name="confirmPassword"
        type={showConfirmPassword ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder="••••••••"
        value={confirmPassword}
        error={fieldErrors.confirmPassword}
        onChange={(event) => {
          setConfirmPassword(event.target.value)
          clearFieldError('confirmPassword')
        }}
        endAdornment={
          <button
            type="button"
            className="flex size-10 items-center justify-center text-outline transition-colors hover:text-primary"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            aria-label={
              showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'
            }
          >
            <Icon
              name={showConfirmPassword ? 'visibility_off' : 'visibility'}
              size={20}
            />
          </button>
        }
      />

      <Checkbox
        id="acceptedTerms"
        name="acceptedTerms"
        label="Li e aceito os Termos de Uso e a Política de Privacidade"
        checked={acceptedTerms}
        error={fieldErrors.acceptedTerms}
        onChange={(event) => {
          setAcceptedTerms(event.target.checked)
          clearFieldError('acceptedTerms')
        }}
      />

      <Button type="submit" loading={isSubmitting} icon="person_add">
        Cadastrar
      </Button>

      <div className="mt-8 border-t border-outline-variant pt-8 text-center">
        <p className="text-body-md text-on-surface-variant">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </form>
  )
}
