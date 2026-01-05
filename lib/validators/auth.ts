import { z } from "zod"

const optionalPhoneSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value
  }
  const trimmed = value.trim()
  return trimmed.length === 0 ? undefined : trimmed
}, z.string().min(7, "Phone number is too short.").max(20, "Phone number is too long."))

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  rememberMe: z.boolean().default(true),
})

export const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.string().trim().email("Enter a valid email."),
  phone: optionalPhoneSchema.optional(),
  password: z.string().min(6, "Password must be at least 6 characters."),
})

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
