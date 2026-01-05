"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSupabaseBrowserClient, setSupabaseAuthStoragePreference } from "@/lib/supabase/client"
import { signInSchema, type SignInValues } from "@/lib/validators/auth"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const signupStatus = searchParams.get("signup")
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
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

  const onSubmit = async (values: SignInValues) => {
    setSubmitError(null)

    const storagePreference = values.rememberMe ? "local" : "session"
    setSupabaseAuthStoragePreference(storagePreference)
    const supabase = getSupabaseBrowserClient(storagePreference)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (signInError) {
      setSubmitError(signInError.message)
      return
    }

    const user = signInData.user ?? signInData.session?.user
    if (user) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (!profileError && !profileData) {
        const fallbackFirstName = user.user_metadata?.first_name ?? "User"
        const fallbackLastName = user.user_metadata?.last_name ?? "Profile"
        const fallbackPhone = user.user_metadata?.phone ?? null

        await supabase.from("profiles").insert({
          user_id: user.id,
          first_name: fallbackFirstName,
          last_name: fallbackLastName,
          email: user.email ?? values.email,
          phone: fallbackPhone,
        })
      }
    }

    router.replace("/")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to access Bamboo Reports.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="rememberMe"
                render={({ field }) => (
                  <Checkbox
                    id="rememberMe"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                )}
              />
              <Label htmlFor="rememberMe" className="text-sm font-normal text-muted-foreground">
                Remember me
              </Label>
            </div>
            {submitError ? (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}
            {signupStatus === "success" ? (
              <Alert>
                <AlertDescription>
                  Account created. Please sign in to continue.
                </AlertDescription>
              </Alert>
            ) : null}
            {signupStatus === "pending" ? (
              <Alert>
                <AlertDescription>
                  Check your email to confirm your account, then sign in.
                </AlertDescription>
              </Alert>
            ) : null}
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
          <div className="mt-4 text-sm text-muted-foreground">
            New here?{" "}
            <Link className="text-primary hover:underline" href="/signup">
              Create an account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SignInForm />
    </Suspense>
  )
}
