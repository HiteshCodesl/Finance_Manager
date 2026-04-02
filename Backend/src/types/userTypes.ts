import z from "zod"

export const signupSchema = z.object({
    email: z.string(),
    name: z.string(),
    password: z.string().min(4).max(16),
    role: z.string()
})

export const loginSchema = z.object({
    email: z.string(),
    password: z.string().min(4).max(16)
})