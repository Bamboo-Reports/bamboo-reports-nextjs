"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [role, setRole] = useState("")
  const [companySize, setCompanySize] = useState("")
  const [useCase, setUseCase] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setAwaitingConfirmation(false)
    setLoading(true)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const metadata = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        company_name: companyName.trim(),
        role: role.trim(),
        company_size: companySize.trim(),
        use_case: useCase.trim(),
      }
      const filteredMetadata = Object.fromEntries(
        Object.entries(metadata).filter(([, value]) => value)
      )
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: filteredMetadata,
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user?.identities?.length === 0) {
        setError("An account with this email already exists.")
        return
      }

      if (data.session) {
        setSuccessMessage("Account created successfully! Redirecting...")
        setTimeout(() => {
          router.push("/loading")
        }, 2000)
      } else {
        setSuccessMessage("Check your email to confirm your account, then sign in.")
        setAwaitingConfirmation(true)
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Sign up error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError("Enter your email to resend confirmation.")
      return
    }

    setError(null)
    setResendLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccessMessage("Confirmation email resent. Check your inbox.")
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Resend confirmation error:", error)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center" style={{ fontFamily: "'Google Sans', 'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
            Bamboo Reports
          </CardTitle>
          <CardDescription className="text-center">
            Create an account to access GCC Explorer dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert className="border-green-500 text-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            {awaitingConfirmation && (
              <p className="text-sm text-center text-muted-foreground">
                Already confirmed?{" "}
                <Link href="/signin" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            )}
            {awaitingConfirmation && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResend}
                disabled={loading || resendLoading}
              >
                {resendLoading ? "Resending..." : "Resend confirmation email"}
              </Button>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Ada"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Lovelace"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company name</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Bamboo Reports"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={loading}
                autoComplete="organization"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role (optional)</Label>
              <Input
                id="role"
                type="text"
                placeholder="Analyst, Ops, CTO"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                autoComplete="organization-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companySize">Company size (optional)</Label>
              <Input
                id="companySize"
                type="text"
                placeholder="1-10, 11-50, 51-200"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="useCase">Primary use case (optional)</Label>
              <Input
                id="useCase"
                type="text"
                placeholder="Quarterly reporting, team analytics"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
