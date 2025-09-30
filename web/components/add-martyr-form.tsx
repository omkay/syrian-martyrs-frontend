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
import { AlertCircle, CheckCircle2, PlusCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { addMartyr } from "@/app/actions"

export function AddMartyrForm() {
  const [open, setOpen] = useState(false)
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
      const result = await addMartyr(formData)
      setFormState(result)

      if (result.success) {
        // Reset form on success
        form.reset()

        // Close dialog after delay
        setTimeout(() => {
          setOpen(false)
          // Refresh the page to show the new martyr
          router.refresh()
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
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Martyr
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Martyr Profile</DialogTitle>
          <DialogDescription>
            Create a new profile to honor and remember someone who has lost their life. All submissions will be reviewed
            before being published.
          </DialogDescription>
        </DialogHeader>

        {formState && (
          <Alert variant={formState.success ? "default" : "destructive"} className="my-4">
            {formState.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{formState.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{formState.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
