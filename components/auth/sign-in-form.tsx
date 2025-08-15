"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail } from "lucide-react"
import { signInWithOTP } from "@/lib/auth/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full h-11 bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87] text-white font-medium"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending magic link...
        </>
      ) : (
        <>
          <Mail className="mr-2 h-4 w-4" />
          Send magic link
        </>
      )}
    </Button>
  )
}

export default function SignInForm() {
  const [state, formAction] = useActionState(signInWithOTP, null)

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">DevStack Companion</h1>
        <p className="mt-2 text-muted-foreground">Track your development tools and subscriptions</p>
      </div>

      <Card className="border-2 border-transparent bg-gradient-to-r from-[#002F71] to-[#0A4BA0] p-[2px]">
        <div className="bg-background rounded-[calc(var(--radius)-2px)]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Sign in</CardTitle>
            <CardDescription>Enter your email to receive a magic link</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              {state?.error && (
                <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-md text-sm">
                  {state.error}
                </div>
              )}

              {state?.success && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-600 dark:text-green-400 px-4 py-3 rounded-md text-sm">
                  {state.success}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email address
                </label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required className="h-11" />
              </div>

              <SubmitButton />
            </form>
          </CardContent>
        </div>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>By signing in, you agree to our terms of service and privacy policy.</p>
      </div>
    </div>
  )
}
