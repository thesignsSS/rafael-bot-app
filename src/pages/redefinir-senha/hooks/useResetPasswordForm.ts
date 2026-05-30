import { useCallback, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { clearPasswordRecoveryFlag } from '../../../hooks/usePasswordRecoveryAccess'
import { mapFieldErrors } from '../../../lib/mapFieldErrors'
import { supabase } from '../../../lib/supabase'
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '../schemas/resetPasswordSchema'

export function useResetPasswordForm() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ResetPasswordFormData, string>>
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clearFieldError = useCallback((field: keyof ResetPasswordFormData) => {
    setFieldErrors((prev) =>
      prev[field] ? { ...prev, [field]: undefined } : prev,
    )
  }, [])

  const handlePasswordChange = useCallback(
    (value: string) => {
      setPassword(value)
      clearFieldError('password')
    },
    [clearFieldError],
  )

  const handleConfirmPasswordChange = useCallback(
    (value: string) => {
      setConfirmPassword(value)
      clearFieldError('confirmPassword')
    },
    [clearFieldError],
  )

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev)
  }, [])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const result = resetPasswordSchema.safeParse({ password, confirmPassword })

      if (!result.success) {
        setFieldErrors(
          mapFieldErrors(
            ['password', 'confirmPassword'],
            result.error.flatten().fieldErrors,
          ),
        )
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
    },
    [password, confirmPassword, navigate],
  )

  return {
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    fieldErrors,
    isSubmitting,
    handleSubmit,
    handlePasswordChange,
    handleConfirmPasswordChange,
    toggleShowPassword,
    toggleShowConfirmPassword,
  }
}
