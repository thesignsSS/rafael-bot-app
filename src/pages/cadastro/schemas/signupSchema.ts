import { z } from 'zod'

export const signupSchema = z
  .object({
    fullName: z.string().min(1, 'Informe seu nome completo'),
    email: z
      .string()
      .min(1, 'Informe seu e-mail')
      .email('E-mail inválido'),
    password: z
      .string()
      .min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
    acceptedTerms: z.literal(true, { message: 'Você precisa aceitar os termos' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type SignupFormData = z.infer<typeof signupSchema>
