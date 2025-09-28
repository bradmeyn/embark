import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Lock, Mail } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { LoginCredentials } from '@/schemas/auth'
import { loginSchema } from '@/schemas/auth'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { Alert, AlertDescription } from '@/components/ui/alert'

// Form

import LoadingSpinner from '@/components/loading-spinner'

export const Route = createFileRoute('/(auth)/login/')({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || undefined,
  }),
})

function LoginPage() {
  const navigate = useNavigate()

  const [loginError, setLoginError] = useState('')

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(data: LoginCredentials) {
    try {
      setLoginError('')

      // Use redirect from search params or default to dashboard
      const redirectTo = search.redirect || '/dashboard'
      navigate({ to: redirectTo, replace: true })
    } catch (error) {
      console.error('Login error', error)
      setLoginError(
        error instanceof Error
          ? error.message
          : 'Failed to sign in. Please check your credentials and try again.',
      )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="py-6 px-8 border-b ">
        <Link to="/" className="text-xl font-bold text-white">
          CRM
        </Link>
      </header>

      <main className="container max-w-md mx-auto py-12">
        <Card>
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loginError && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input
                              placeholder="john@example.com"
                              className="pl-9"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password"
                              className="pl-9"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!form.formState.isValid}
                >
                  {form.formState.isSubmitting ? (
                    <LoadingSpinner text="Signing in..." />
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="justify-center">
            <div className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Create one
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
