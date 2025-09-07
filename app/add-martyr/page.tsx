"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { addMartyr } from "@/app/actions"
import Link from "next/link"

export default function AddMartyrPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formState, setFormState] = useState<{
    success?: boolean
    message?: string
  } | null>(null)
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user && !redirecting) {
      setRedirecting(true) // Prevent multiple redirects
      router.push("/login?returnTo=/add-martyr")
    }
  }, [user, isLoading, router, redirecting])

  if (isLoading || (!user && redirecting)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFormState(null)

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const result = await addMartyr(formData)
      setFormState(result)

      if (result.success) {
        // Reset form on success
        form.reset()

        // Redirect after delay
        setTimeout(() => {
          router.push("/search")
        }, 3000)
      }
    } catch (error) {
      setFormState({
        success: false,
        message: "An error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <Link
          href="/search"
          className="inline-flex items-center mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to search
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add New Martyr Profile</CardTitle>
            <CardDescription>
              Create a new profile to honor and remember someone who has lost their life. All submissions will be
              reviewed before being published.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {formState && (
              <Alert variant={formState.success ? "default" : "destructive"} className="mb-6">
                {formState.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{formState.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{formState.message}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form fields remain the same */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" name="name" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date of Martyrdom *</Label>
                  <Input 
                    id="date" 
                    name="date" 
                    type="date" 
                    required 
                    placeholder="Select date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" name="location" placeholder="City, Region" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" name="age" type="number" min="0" max="120" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select name="gender">
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input id="occupation" name="occupation" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="familyStatus">Family Status</Label>
                  <Input id="familyStatus" name="familyStatus" placeholder="e.g., Married with two children" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cause">Cause of Death</Label>
                <Input id="cause" name="cause" placeholder="e.g., Peaceful Protest, Shelling, etc." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Biography/Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide details about this person's life, circumstances of their death, and their legacy..."
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://example.com/photo.jpg" />
                <p className="text-xs text-muted-foreground">
                  If you have a photo, provide a URL. Otherwise, a placeholder will be used.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Source Information *</Label>
                <Textarea
                  id="source"
                  name="source"
                  placeholder="Provide information about your sources (news articles, reports, personal knowledge, etc.)"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="submitterRelationship">Your Relationship to the Deceased</Label>
                <Input
                  id="submitterRelationship"
                  name="submitterRelationship"
                  placeholder="Family member, friend, researcher, etc."
                />
              </div>

              <p className="text-sm text-muted-foreground">
                Fields marked with * are required. Your submission will be reviewed for accuracy and completeness before
                being published.
              </p>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" asChild>
                  <Link href="/search">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Profile"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </main>
  )
}
