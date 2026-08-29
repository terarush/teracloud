import { z } from "zod"
import { validation } from "@/lib/i18n-validation"

// === Requests ===

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { error: validation.required })
    .email({ error: validation.invalidEmail }),
  password: z
    .string()
    .min(1, { error: validation.required })
    .min(8, { error: validation.passwordMin }),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, { error: validation.required })
      .min(3, { error: () => validation.minLength(3) })
      .max(50, { error: () => validation.maxLength(50) }),
    email: z
      .string()
      .min(1, { error: validation.required })
      .email({ error: validation.invalidEmail }),
    password: z
      .string()
      .min(1, { error: validation.required })
      .min(8, { error: validation.passwordMin })
      .regex(/[A-Z]/, { error: validation.passwordUpper })
      .regex(/[a-z]/, { error: validation.passwordLower })
      .regex(/[0-9]/, { error: validation.passwordNumber }),
    confirmPassword: z.string().min(1, { error: validation.required }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: validation.passwordsDontMatch,
    path: ["confirmPassword"],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { error: validation.required })
    .email({ error: validation.invalidEmail }),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { error: validation.required }),
    password: z
      .string()
      .min(1, { error: validation.required })
      .min(8, { error: validation.passwordMin })
      .regex(/[A-Z]/, { error: validation.passwordUpper })
      .regex(/[a-z]/, { error: validation.passwordLower })
      .regex(/[0-9]/, { error: validation.passwordNumber }),
    confirmPassword: z.string().min(1, { error: validation.required }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: validation.passwordsDontMatch,
    path: ["confirmPassword"],
  })

export const usernameSchema = z.object({
  username: z
    .string()
    .min(1, { error: validation.required })
    .min(3, { error: () => validation.minLength(3) })
    .max(20, { error: () => validation.maxLength(20) })
    .regex(/^[a-zA-Z0-9_]+$/, { error: validation.invalidCharacters }),
})

export type UsernameFormData = z.infer<typeof usernameSchema>