"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ContributionFormProps {
  martyrId: string
  martyrName: string
}

export function ContributionForm({ martyrId, martyrName }: ContributionFormProps) {
  const [open, setOpen] = useState(false)
  const [contributionType, setContributionType] = useState<string>("TESTIMONIAL_ADDITION")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formState, setFormState] = useState<{
    success?: boolean
    message?: string
  } | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Redirect to login if not logged in
    if (!user) {
      router.push("/login")
      return
    }

    setIsSubmitting(true)
    setFormState(null)

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      // Extract form data
      const relationship = formData.get("relationship") as string
      const content = formData.get("content") as string
      const url = formData.get("url") as string
      const notes = formData.get("notes") as string

      // Validation
      if (contributionType === 'TESTIMONIAL_ADDITION' && (!content || content.length < 10)) {
        setFormState({
          success: false,
          message: "Testimonial must be at least 10 characters"
        })
        return
      }

      // Get JWT token from user object
      const token = (user as any)?.token
      if (!token) {
        setFormState({
          success: false,
          message: "You must be logged in to submit a contribution"
        })
        return
      }

      // Prepare contribution data based on type
      let contributionContent: any = {}
      
      if (contributionType === 'TESTIMONIAL_ADDITION') {
        contributionContent = {
          content,
          author: user.name,
          relationship: relationship || 'Unknown'
        }
      } else if (contributionType === 'PHOTO_ADDITION') {
        contributionContent = {
          url: url || '',
          description: content || ''
        }
      } else if (contributionType === 'DOCUMENT_ADDITION') {
        contributionContent = {
          url: url || '',
          description: content || ''
        }
      } else {
        contributionContent = {
          content: content || '',
          relationship: relationship || ''
        }
      }

      // Call API to create contribution
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/contributions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: contributionType,
          content: contributionContent,
          martyrId: martyrId,
          notes: notes || `Submitted by ${user.name}`
        })
      })

      const result = await response.json()

      if (!response.ok) {
        setFormState({
          success: false,
          message: result.error || "Failed to submit contribution"
        })
        return
      }

      setFormState({
        success: true,
        message: result.message || "Thank you for your contribution. It has been submitted for review.",
      })

      // Reset form on success
      form.reset()
      setContributionType("TESTIMONIAL_ADDITION")

      // Close dialog after delay
      setTimeout(() => setOpen(false), 3000)
    } catch (error) {
      console.error("Error submitting contribution:", error)
      setFormState({
        success: false,
        message: "An error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    // If trying to open and not logged in, redirect to login
    if (newOpen && !user) {
      router.push("/login")
      return
    }

    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">{user ? "Contribute to this profile" : "Login to contribute"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contribute to {martyrName}&apos;s Profile</DialogTitle>
          <DialogDescription>
            Add your testimonial, photos, or additional information to help preserve their memory. All submissions will
            be reviewed before being published.
          </DialogDescription>
        </DialogHeader>

        {formState && (
          <Alert variant={formState.success ? "default" : "destructive"} className="my-4">
            {formState.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{formState.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{formState.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="contributionType">Contribution Type</Label>
            <Select name="contributionType" value={contributionType} onValueChange={setContributionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type of contribution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TESTIMONIAL_ADDITION">Personal Testimonial</SelectItem>
                <SelectItem value="PHOTO_ADDITION">Photo</SelectItem>
                <SelectItem value="DOCUMENT_ADDITION">Document or Link</SelectItem>
                <SelectItem value="OTHER">Additional Information</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User info is auto-filled from account */}
          <input type="hidden" name="name" value={user?.name || ""} />
          <input type="hidden" name="email" value={user?.email || ""} />

          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship to {martyrName}</Label>
            <Input id="relationship" name="relationship" placeholder="Family member, friend, colleague, etc." />
          </div>

          {contributionType === "TESTIMONIAL_ADDITION" && (
            <div className="space-y-2">
              <Label htmlFor="content">Your Testimonial</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Share your memories or knowledge about this person..."
                rows={5}
                required
              />
            </div>
          )}

          {contributionType === "PHOTO_ADDITION" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="url">Photo URL</Label>
                <Input id="url" name="url" type="url" placeholder="https://example.com/photo.jpg" />
                <p className="text-xs text-muted-foreground">Provide a URL to the photo or describe how to obtain it</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Photo Description</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Describe the photo, when it was taken, who is in it, etc."
                  rows={3}
                  required
                />
              </div>
            </>
          )}

          {contributionType === "DOCUMENT_ADDITION" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="url">Document or Link URL</Label>
                <Input id="url" name="url" type="url" placeholder="https://example.com/document.pdf" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Document Description</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Describe what this document contains and its relevance"
                  rows={3}
                  required
                />
              </div>
            </>
          )}

          {contributionType === "OTHER" && (
            <div className="space-y-2">
              <Label htmlFor="content">Additional Information</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Share additional information, corrections, or details about this person..."
                rows={5}
                required
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Contribution"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
