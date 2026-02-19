"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { captureEvent, identifyUser } from "@/lib/analytics/client"
import { ANALYTICS_EVENTS } from "@/lib/analytics/events"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { signUpSchema, type SignUpValues } from "@/lib/validators/auth"

export default function SignUpPage() {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    },
  })

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/")
      }
    })
  }, [router])

  const onSubmit = async (values: SignUpValues) => {
    setSubmitError(null)
    const supabase = getSupabaseBrowserClient()
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          first_name: values.firstName,
          last_name: values.lastName,
          phone: values.phone || null,
        },
      },
    })

    if (signUpError) {
      setSubmitError(signUpError.message)
      captureEvent(ANALYTICS_EVENTS.AUTH_SIGN_UP_FAILED, {
        auth_provider: "email",
        email_domain: values.email.includes("@") ? values.email.split("@")[1] : null,
        error_message: signUpError.message,
      })
      return
    }

    const userId = signUpData.user?.id
    if (!userId) {
      setSubmitError("Signup succeeded but the user record was missing.")
      captureEvent(ANALYTICS_EVENTS.AUTH_SIGN_UP_FAILED, {
        auth_provider: "email",
        email_domain: values.email.includes("@") ? values.email.split("@")[1] : null,
        error_message: "Missing user ID after signup",
      })
      return
    }

    if (signUpData.session) {
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: userId,
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phone || null,
      })

      if (profileError) {
        setSubmitError(profileError.message)
        captureEvent(ANALYTICS_EVENTS.AUTH_SIGN_UP_FAILED, {
          auth_provider: "email",
          email_domain: values.email.includes("@") ? values.email.split("@")[1] : null,
          error_message: profileError.message,
        })
        return
      }

      identifyUser({
        id: userId,
        email: values.email,
        authProvider: "email",
      })
      captureEvent(ANALYTICS_EVENTS.AUTH_SIGN_UP_SUCCEEDED, {
        auth_provider: "email",
        email_domain: values.email.includes("@") ? values.email.split("@")[1] : null,
        requires_email_confirmation: false,
      })
      await supabase.auth.signOut()
      router.replace("/signin?signup=success")
      return
    }

    captureEvent(ANALYTICS_EVENTS.AUTH_SIGN_UP_SUCCEEDED, {
      auth_provider: "email",
      email_domain: values.email.includes("@") ? values.email.split("@")[1] : null,
      requires_email_confirmation: true,
    })
    router.replace("/signin?signup=pending")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <p className="text-sm text-muted-foreground">Join Bamboo Reports with email and password.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  required
                  {...register("firstName")}
                />
                {errors.firstName ? (
                  <p className="text-xs text-destructive">{errors.firstName.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  required
                  {...register("lastName")}
                />
                {errors.lastName ? (
                  <p className="text-xs text-destructive">{errors.lastName.message}</p>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                {...register("phone")}
              />
              {errors.phone ? (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : null}
            </div>
            {submitError ? (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
          <div className="mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="text-primary hover:underline" href="/signin">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
