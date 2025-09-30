import { createServerFn } from '@tanstack/react-start'

import { loginSchema, registerSchema } from '@/lib/schemas/auth'

export const registerUser = createServerFn({ method: 'POST' })
  .inputValidator((data) => registerSchema.parse(data))
  .handler(async ({ data }) => {
    console.log('Registering user:', data)
    await Promise.resolve((() => {})())
    return { success: true, message: 'User registered successfully' }
    // data is fully typed and validated
  })

export const loginUser = createServerFn({ method: 'POST' })
  .inputValidator((data) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    // data is fully typed and validated
    console.log('Logging in user:', data)
    return `Logged in user: ${data.email}`
  })
