"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SignupForm } from "@/components/signup-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function SignupPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  // If already logged in, redirect to home
  useEffect(() => {
    if (user && !redirecting) {
      setRedirecting(true)
      router.push("/")
    }
  }, [user, router, redirecting])

  const handleSignupSuccess = () => {
    // Optionally redirect to login page or show success message
    // For now, the form handles the success state
  }

  const handleSignupError = (message: string) => {
    // Handle error if needed
    console.error("Signup error:", message)
  }

  // Don't render anything while redirecting to prevent flash
  if (user && redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container py-12 flex justify-center">
        <div className="w-full max-w-md space-y-6">
          <SignupForm 
            onSuccess={handleSignupSuccess}
            onError={handleSignupError}
          />
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/login")}
                  className="w-full"
                >
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </main>
  )
}
