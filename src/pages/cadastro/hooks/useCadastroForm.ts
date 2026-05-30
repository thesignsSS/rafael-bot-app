import { useCallback, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { mapFieldErrors } from '../../../lib/mapFieldErrors'
import { supabase } from '../../../lib/supabase'
import { signupSchema, type SignupFormData } from '../schemas/signupSchema'

type UseCadastroFormOptions = {
  onSignupPending: (email: string) => void
}

export function useCadastroForm({ onSignupPending }: UseCadastroFormOptions) {
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

  const clearFieldError = useCallback((field: keyof SignupFormData) => {
    setFieldErrors((prev) =>
      prev[field] ? { ...prev, [field]: undefined } : prev,
    )
  }, [])

  const handleFullNameChange = useCallback(
    (value: string) => {
      setFullName(value)
      clearFieldError('fullName')
    },
    [clearFieldError],
  )

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

  const handleConfirmPasswordChange = useCallback(
    (value: string) => {
      setConfirmPassword(value)
      clearFieldError('confirmPassword')
    },
    [clearFieldError],
  )

  const handleAcceptedTermsChange = useCallback(
    (checked: boolean) => {
      setAcceptedTerms(checked)
      clearFieldError('acceptedTerms')
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

      const result = signupSchema.safeParse({
        fullName,
        email,
        password,
        confirmPassword,
        acceptedTerms,
      })

      if (!result.success) {
        setFieldErrors(
          mapFieldErrors(
            ['fullName', 'email', 'password', 'confirmPassword', 'acceptedTerms'],
            result.error.flatten().fieldErrors,
          ),
        )
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
    },
    [
      fullName,
      email,
      password,
      confirmPassword,
      acceptedTerms,
      navigate,
      onSignupPending,
    ],
  )

  return {
    fullName,
    email,
    password,
    confirmPassword,
    acceptedTerms,
    showPassword,
    showConfirmPassword,
    fieldErrors,
    isSubmitting,
    handleSubmit,
    handleFullNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleAcceptedTermsChange,
    toggleShowPassword,
    toggleShowConfirmPassword,
  }
}
