import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import type { RegisterCredentials } from '@/schemas/auth'
import { registerSchema } from '@/schemas/auth'
import { cn } from '@/lib/utils'

import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Form

import LoadingSpinner from '@/components/loading-spinner'

export const Route = createFileRoute('/(auth)/register/')({
  component: RegisterPage,
})

function RegisterPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<RegisterCredentials>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',

    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
  })

  function onSubmit(_data: RegisterCredentials) {
    try {
      setErrorMessage(null)
    } catch (error) {
      console.error('Registration error:', error)

      // Handle specific error types
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Registration failed. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative p-4">
        {/* Background Image with Rounded Borders */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden ">
          <img
            src="/images/locations/nice.png"
            alt="Travel destination"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center ">
        <div className="w-full max-w-md space-y-2">
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex items-center justify-center  ">
            <img
              src="/logo-transparent.png"
              alt="Embark Logo"
              className="size-20"
            />
            <p className=" text-orange-800 font-serif text-3xl">Embark</p>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold text-gray-900">
              Start your journey
            </h1>
            <p className="text-gray-600">
              Create your account to begin planning amazing trips
            </p>
          </div>

          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
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

                          <FormControl>
                            <Input
                              placeholder="john@example.com"
                              className={
                                form.formState.errors.email
                                  ? cn(
                                      ' border-red-500 h-11',
                                      'focus-visible:ring-red-500',
                                      'focus-visible:border-red-500',
                                    )
                                  : 'h-11'
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John"
                                className="h-11"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Doe"
                                className="h-11"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Create a secure password"
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm your password"
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 text-base "
                    disabled={!form.formState.isValid}
                  >
                    {form.formState.isSubmitting ? (
                      <LoadingSpinner text="Creating account..." />
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                search={{ redirect: undefined }}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
