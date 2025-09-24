"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Rocket, Check, Zap, BarChart3 } from "lucide-react"
import { signupForBeta } from "@/lib/beta/actions"

interface BetaSignupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function BetaSignupModal({ open, onOpenChange }: BetaSignupModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSignup = async () => {
    setIsLoading(true)
    
    try {
      const result = await signupForBeta()
      
      if (result.success) {
        setIsSuccess(true)
        // Close modal after showing success for a moment
        setTimeout(() => {
          onOpenChange(false)
          setIsSuccess(false)
        }, 2000)
      } else {
        // Handle error - could add toast notification here
        console.error("Beta signup failed:", result.error)
      }
    } catch (error) {
      console.error("Beta signup error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-blue-600" />
            Early Paid Beta Access
          </DialogTitle>
          <DialogDescription className="text-base">
            Get unlimited tool tracking and advanced insights with our paid beta.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">You're signed up!</h3>
            <p className="text-sm text-green-700">
              We'll notify you when the paid beta launches.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="h-3 w-3 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Track unlimited tools on your dashboard</p>
                  <p className="text-xs text-muted-foreground">No more 10-tool limit</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BarChart3 className="h-3 w-3 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Advanced analytics and insights</p>
                  <p className="text-xs text-muted-foreground">Detailed spending patterns and optimization tips</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Rocket className="h-3 w-3 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Early access to new features</p>
                  <p className="text-xs text-muted-foreground">Be the first to try upcoming functionality</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-800">
                Sign up now to be notified when the beta launches!
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                onClick={handleSignup} 
                disabled={isLoading}
                className="bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing Up...
                  </>
                ) : (
                  "Sign Me Up"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
