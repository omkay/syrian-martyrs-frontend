"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { submitProfileContribution } from "@/app/actions"
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
import { AlertCircle, CheckCircle2, User, Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ProfileContributionFormProps {
  userId?: string
  existingProfile?: boolean
  redirectToMartyrId?: string // Optional martyr ID to redirect to
}

export function ProfileContributionForm({ userId, existingProfile = false, redirectToMartyrId }: ProfileContributionFormProps) {
  const [open, setOpen] = useState(false)
  const [contributionType, setContributionType] = useState<string>("profile_creation")
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
    formData.append("userId", userId || user.id)
    formData.append("contributionType", contributionType)

    try {
      const result = await submitProfileContribution(formData)
      setFormState(result)

      if (result.success) {
        // Reset form on success
        form.reset()
        setContributionType("profile_creation")

        // Close dialog and redirect to martyrs page after delay
        setTimeout(() => {
          setOpen(false)
          if (redirectToMartyrId) {
            router.push(`/martyrs/${redirectToMartyrId}`) // Redirect to specific martyr profile
          } else {
            router.push("/search") // Redirect to martyrs search/listing page
          }
        }, 2000)
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

  const getContributionTypeOptions = () => {
    if (existingProfile) {
      return [
        { value: "profile_update", label: "Update Profile Information" },
        { value: "profile_verification", label: "Request Profile Verification" },
        { value: "correction", label: "Report Correction" }
      ]
    } else {
      return [
        { value: "profile_creation", label: "Create New Profile" },
        { value: "profile_verification", label: "Request Profile Verification" }
      ]
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          {existingProfile ? (
            <>
              <User className="h-4 w-4 mr-2" />
              Update Profile
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Profile
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingProfile ? "Update Profile" : "Create New Profile"}
          </DialogTitle>
          <DialogDescription>
            {existingProfile 
              ? "Update your profile information or request verification. All changes will be reviewed before being published."
              : "Create a new profile to share your story and connect with the community. All submissions will be reviewed before being published."
            }
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
                {getContributionTypeOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User info is auto-filled from account */}
          <input type="hidden" name="name" value={user?.name || ""} />
          <input type="hidden" name="email" value={user?.email || ""} />

          {(contributionType === "profile_creation" || contributionType === "profile_update") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio/About Me</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself, your background, and your connection to the Syrian community..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="City, Country (e.g., Damascus, Syria or Berlin, Germany)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialLinks">Social Media Links (Optional)</Label>
                <Textarea
                  id="socialLinks"
                  name="socialLinks"
                  placeholder="Facebook, Twitter, Instagram, LinkedIn URLs (one per line)"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Enter one social media URL per line
                </p>
              </div>
            </>
          )}

          {contributionType === "profile_verification" && (
            <div className="space-y-2">
              <Label htmlFor="verificationReason">Why should this profile be verified?</Label>
              <Textarea
                id="verificationReason"
                name="verificationReason"
                placeholder="Explain why this profile should be verified. Include any relevant information, documents, or connections that support verification..."
                rows={4}
                required
              />
            </div>
          )}

          {contributionType === "correction" && (
            <div className="space-y-2">
              <Label htmlFor="correctionDetails">What needs to be corrected?</Label>
              <Textarea
                id="correctionDetails"
                name="correctionDetails"
                placeholder="Describe what information is incorrect and what the correct information should be..."
                rows={4}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any additional information or context..."
              rows={2}
            />
          </div>

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
