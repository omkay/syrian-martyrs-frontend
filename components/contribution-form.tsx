"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { submitContribution } from "@/app/actions"
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
  const [contributionType, setContributionType] = useState<string>("testimonial")
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
    formData.append("martyrId", martyrId)

    try {
      const result = await submitContribution(formData)
      setFormState(result)

      if (result.success) {
        // Reset form on success
        form.reset()
        setContributionType("testimonial")

        // Close dialog after delay
        setTimeout(() => setOpen(false), 3000)
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
                <SelectItem value="testimonial">Personal Testimonial</SelectItem>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="document">Document or Link</SelectItem>
                <SelectItem value="information">Additional Information</SelectItem>
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

          {contributionType === "testimonial" && (
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

          {contributionType === "photo" && (
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

          {contributionType === "document" && (
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

          {contributionType === "information" && (
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
