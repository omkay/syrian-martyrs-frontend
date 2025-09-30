"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar, 
  MapPin, 
  FileText,
  Image,
  ExternalLink,
  AlertCircle,
  Shield,
  ShieldCheck
} from "lucide-react"

interface Martyr {
  id: string
  name: string
  dateOfDeath: string
  location: string
  cause?: string
  description?: string
  image?: string
  age?: number
  gender?: string
  occupation?: string
  familyStatus?: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
  testimonials: Array<{
    id: string
    content: string
    author: string
    isVerified: boolean
  }>
  sources: Array<{
    id: string
    name: string
    type: string
    url?: string
  }>
  contributions: Array<{
    id: string
    type: string
    status: string
    createdAt: string
  }>
  _count: {
    testimonials: number
    sources: number
    contributions: number
  }
}

interface MartyrVerificationProps {
  martyr: Martyr
  onVerificationChange: (martyrId: string, isVerified: boolean, notes?: string) => Promise<void>
  isLoading?: boolean
}

export function MartyrVerification({ 
  martyr, 
  onVerificationChange, 
  isLoading = false 
}: MartyrVerificationProps) {
  const [notes, setNotes] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [verificationAction, setVerificationAction] = useState<"verify" | "unverify">("verify")

  const handleVerification = async (action: "verify" | "unverify") => {
    setVerificationAction(action)
    setIsDialogOpen(true)
  }

  const confirmVerification = async () => {
    await onVerificationChange(martyr.id, verificationAction === "verify", notes)
    setIsDialogOpen(false)
    setNotes("")
  }

  const getGenderIcon = (gender?: string) => {
    switch (gender) {
      case "MALE":
        return "♂"
      case "FEMALE":
        return "♀"
      default:
        return "?"
    }
  }

  const getVerificationBadge = (isVerified: boolean) => {
    return (
      <Badge variant={isVerified ? "default" : "secondary"}>
        {isVerified ? (
          <>
            <ShieldCheck className="h-4 w-4 mr-1" />
            Verified
          </>
        ) : (
          <>
            <Shield className="h-4 w-4 mr-1" />
            Unverified
          </>
        )}
      </Badge>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <CardTitle className="text-lg">{martyr.name}</CardTitle>
          </div>
          {getVerificationBadge(martyr.isVerified)}
        </div>
        <CardDescription>
          {martyr.age && `${martyr.age} years old`}
          {martyr.gender && ` • ${getGenderIcon(martyr.gender)} ${martyr.gender}`}
          {martyr.occupation && ` • ${martyr.occupation}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Date of Death</Label>
            <p className="text-sm text-muted-foreground">
              {new Date(martyr.dateOfDeath).toLocaleDateString()}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium">Location</Label>
            <p className="text-sm text-muted-foreground">{martyr.location}</p>
          </div>
          {martyr.cause && (
            <div>
              <Label className="text-sm font-medium">Cause</Label>
              <p className="text-sm text-muted-foreground">{martyr.cause}</p>
            </div>
          )}
          {martyr.familyStatus && (
            <div>
              <Label className="text-sm font-medium">Family Status</Label>
              <p className="text-sm text-muted-foreground">{martyr.familyStatus}</p>
            </div>
          )}
        </div>

        {martyr.description && (
          <div>
            <Label className="text-sm font-medium">Description</Label>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {martyr.description}
            </p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{martyr._count.testimonials}</div>
            <div className="text-sm text-muted-foreground">Testimonials</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{martyr._count.sources}</div>
            <div className="text-sm text-muted-foreground">Sources</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{martyr._count.contributions}</div>
            <div className="text-sm text-muted-foreground">Contributions</div>
          </div>
        </div>

        {/* Recent Testimonials */}
        {martyr.testimonials.length > 0 && (
          <div>
            <Label className="text-sm font-medium">Recent Testimonials</Label>
            <div className="space-y-2 mt-2">
              {martyr.testimonials.slice(0, 2).map((testimonial) => (
                <div key={testimonial.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{testimonial.author}</span>
                    <Badge variant={testimonial.isVerified ? "default" : "secondary"} className="text-xs">
                      {testimonial.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {testimonial.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Sources */}
        {martyr.sources.length > 0 && (
          <div>
            <Label className="text-sm font-medium">Sources</Label>
            <div className="space-y-2 mt-2">
              {martyr.sources.slice(0, 2).map((source) => (
                <div key={source.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{source.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {source.type}
                    </Badge>
                  </div>
                  {source.url && (
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Source
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification Actions */}
        <div className="flex space-x-2">
          {!martyr.isVerified ? (
            <Dialog open={isDialogOpen && verificationAction === "verify"} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => handleVerification("verify")}
                  variant="default"
                  size="sm"
                  disabled={isLoading}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Verify Martyr
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Verify Martyr</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to verify this martyr? This will mark them as verified in the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="verify-notes">Verification Notes (optional)</Label>
                    <Textarea
                      id="verify-notes"
                      placeholder="Add any notes about this verification..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={confirmVerification} disabled={isLoading}>
                    Verify Martyr
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={isDialogOpen && verificationAction === "unverify"} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => handleVerification("unverify")}
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Unverify Martyr
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Unverify Martyr</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to unverify this martyr? This will remove their verified status.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="unverify-notes">Reason for unverification (optional)</Label>
                    <Textarea
                      id="unverify-notes"
                      placeholder="Add any notes about why this martyr is being unverified..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={confirmVerification} 
                    disabled={isLoading}
                  >
                    Unverify Martyr
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Metadata */}
        <div className="text-xs text-muted-foreground border-t pt-4">
          <div>Created: {new Date(martyr.createdAt).toLocaleString()}</div>
          <div>Last Updated: {new Date(martyr.updatedAt).toLocaleString()}</div>
        </div>
      </CardContent>
    </Card>
  )
}
