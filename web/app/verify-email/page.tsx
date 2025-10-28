"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { verifyEmail } from "@/app/actions"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const token = searchParams.get('token')

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error')
        setMessage('No verification token provided')
        return
      }

      try {
        const result = await verifyEmail(token)
        if (result.success) {
          setStatus('success')
          setMessage(result.message)
        } else {
          setStatus('error')
          setMessage(result.message)
        }
      } catch (error) {
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again.')
      }
    }

    verifyToken()
  }, [token])

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container py-12 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
            <CardDescription>
              {status === 'loading' && 'Verifying your email address...'}
              {status === 'success' && 'Email verification complete'}
              {status === 'error' && 'Email verification failed'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {status === 'loading' && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}

            {status === 'success' && (
              <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
                <Button 
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Button 
                    onClick={() => router.push('/signup')}
                    className="w-full"
                  >
                    Create New Account
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/login')}
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </main>
  )
}
