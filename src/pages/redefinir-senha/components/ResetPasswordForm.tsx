import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { TextField } from '../../../components/ui/TextField'
import { clearPasswordRecoveryFlag } from '../../../hooks/usePasswordRecoveryAccess'
import { supabase } from '../../../lib/supabase'
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '../schemas/resetPasswordSchema'

function mapFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Partial<Record<keyof ResetPasswordFormData, string>> {
  const errors: Partial<Record<keyof ResetPasswordFormData, string>> = {}
  for (const key of ['password', 'confirmPassword'] as const) {
    const messages = fieldErrors[key]
    if (messages?.[0]) {
      errors[key] = messages[0]
    }
  }
  return errors
}

export function ResetPasswordForm() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ResetPasswordFormData, string>>
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clearFieldError = (field: keyof ResetPasswordFormData) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = resetPasswordSchema.safeParse({ password, confirmPassword })

    if (!result.success) {
      setFieldErrors(mapFieldErrors(result.error.flatten().fieldErrors))
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)

    const { error } = await supabase.auth.updateUser({
      password: result.data.password,
    })

    if (error) {
      setIsSubmitting(false)
      toast.error('Não foi possível redefinir a senha. Tente novamente.')
      return
    }

    clearPasswordRecoveryFlag()
    await supabase.auth.signOut()
    setIsSubmitting(false)
    navigate('/login', { replace: true, state: { passwordReset: true } })
  }

  return (
    <form
      noValidate
      className="animate-fade-up-delay-2 space-y-6"
      onSubmit={handleSubmit}
    >
      <p className="text-body-md text-on-surface-variant">
        Escolha uma nova senha para sua conta.
      </p>

      <TextField
        id="password"
        label="Nova senha"
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
        label="Confirmar nova senha"
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

      <Button type="submit" loading={isSubmitting} icon="lock_reset">
        Redefinir senha
      </Button>
    </form>
  )
}
