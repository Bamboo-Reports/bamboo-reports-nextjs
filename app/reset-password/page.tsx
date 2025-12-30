"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      setHasSession(!!data.session)
    }

    checkSession()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!hasSession) {
      setError("This reset link is invalid or expired.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setError(error.message)
        return
      }

      setMessage("Password updated successfully. Redirecting to sign in...")
      setTimeout(() => {
        router.push("/signin")
        router.refresh()
      }, 1500)
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Password update error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center" style={{ fontFamily: "'Google Sans', 'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
            Set a new password
          </CardTitle>
          <CardDescription className="text-center">
            Choose a new password for your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdate}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {message && (
              <Alert className="border-green-500 text-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            {hasSession === null && (
              <Alert>
                <AlertDescription>Checking your reset link...</AlertDescription>
              </Alert>
            )}
            {hasSession === false && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This reset link is invalid or expired. Request a new one.
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter a new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || !hasSession}
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading || !hasSession}
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading || !hasSession}>
              {loading ? "Updating password..." : "Update password"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Need a new link?{" "}
              <Link href="/forgot-password" className="text-primary hover:underline">
                Request another reset
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
