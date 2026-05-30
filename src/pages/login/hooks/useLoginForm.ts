import { useCallback, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { mapFieldErrors } from '../../../lib/mapFieldErrors'
import { supabase } from '../../../lib/supabase'
import { loginSchema, type LoginFormData } from '../schemas/loginSchema'

function getLoginErrorMessage(error: { code?: string; message?: string }): string {
  if (
    error.code === 'email_not_confirmed' ||
    error.message === 'Email not confirmed'
  ) {
    return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.'
  }

  return 'E-mail ou senha incorretos'
}

export function useLoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clearFieldError = useCallback((field: keyof LoginFormData) => {
    setFieldErrors((prev) =>
      prev[field] ? { ...prev, [field]: undefined } : prev,
    )
  }, [])

  const handleEmailChange = useCallback(
    (value: string) => {
      setEmail(value)
      clearFieldError('email')
    },
    [clearFieldError],
  )

  const handlePasswordChange = useCallback(
    (value: string) => {
      setPassword(value)
      clearFieldError('password')
    },
    [clearFieldError],
  )

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const result = loginSchema.safeParse({ email, password })

      if (!result.success) {
        setFieldErrors(
          mapFieldErrors(['email', 'password'], result.error.flatten().fieldErrors),
        )
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
    },
    [email, password, navigate],
  )

  return {
    email,
    password,
    showPassword,
    fieldErrors,
    isSubmitting,
    handleSubmit,
    handleEmailChange,
    handlePasswordChange,
    toggleShowPassword,
  }
}
