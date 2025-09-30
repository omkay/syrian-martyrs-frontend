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
  Clock, 
  Eye, 
  User, 
  Calendar, 
  MapPin, 
  FileText,
  Image,
  ExternalLink,
  AlertCircle
} from "lucide-react"

interface Contribution {
  id: string
  type: string
  status: string
  content: any
  notes?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  martyr?: {
    id: string
    name: string
  }
  profile?: {
    id: string
    userId: string
  }
}

interface ContributionReviewProps {
  contribution: Contribution
  onStatusChange: (contributionId: string, newStatus: string, notes?: string) => Promise<void>
  isLoading?: boolean
}

export function ContributionReview({ 
  contribution, 
  onStatusChange, 
  isLoading = false 
}: ContributionReviewProps) {
  const [notes, setNotes] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | "review">("approve")

  const handleAction = async (action: "approve" | "reject" | "review") => {
    setActionType(action)
    setIsDialogOpen(true)
  }

  const confirmAction = async () => {
    await onStatusChange(contribution.id, actionType.toUpperCase(), notes)
    setIsDialogOpen(false)
    setNotes("")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "UNDER_REVIEW":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      APPROVED: "default",
      REJECTED: "destructive", 
      PENDING: "secondary",
      UNDER_REVIEW: "outline"
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {getStatusIcon(status)}
        <span className="ml-1">{status.replace('_', ' ')}</span>
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "MARTYR_ADDITION":
      case "MARTYR_UPDATE":
        return <User className="h-4 w-4" />
      case "TESTIMONIAL_ADDITION":
        return <FileText className="h-4 w-4" />
      case "PHOTO_ADDITION":
        return <Image className="h-4 w-4" />
      case "SOURCE_ADDITION":
        return <ExternalLink className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const renderContentPreview = () => {
    const { content, type } = contribution

    switch (type) {
      case "MARTYR_ADDITION":
      case "MARTYR_UPDATE":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm text-muted-foreground">{content.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Age</Label>
                <p className="text-sm text-muted-foreground">{content.age || 'N/A'}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Date of Death</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(content.dateOfDeath).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Location</Label>
              <p className="text-sm text-muted-foreground">{content.location}</p>
            </div>
            {content.cause && (
              <div>
                <Label className="text-sm font-medium">Cause</Label>
                <p className="text-sm text-muted-foreground">{content.cause}</p>
              </div>
            )}
            {content.description && (
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground">{content.description}</p>
              </div>
            )}
          </div>
        )

      case "TESTIMONIAL_ADDITION":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Author</Label>
              <p className="text-sm text-muted-foreground">{content.author}</p>
            </div>
            {content.relationship && (
              <div>
                <Label className="text-sm font-medium">Relationship</Label>
                <p className="text-sm text-muted-foreground">{content.relationship}</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium">Content</Label>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {content.content}
              </p>
            </div>
          </div>
        )

      case "PHOTO_ADDITION":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Image URL</Label>
              <p className="text-sm text-muted-foreground break-all">{content.imageUrl}</p>
            </div>
            {content.description && (
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground">{content.description}</p>
              </div>
            )}
          </div>
        )

      case "SOURCE_ADDITION":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Source Name</Label>
              <p className="text-sm text-muted-foreground">{content.name}</p>
            </div>
            {content.url && (
              <div>
                <Label className="text-sm font-medium">URL</Label>
                <p className="text-sm text-muted-foreground break-all">{content.url}</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <p className="text-sm text-muted-foreground">{content.type}</p>
            </div>
          </div>
        )

      default:
        return (
          <div>
            <Label className="text-sm font-medium">Content</Label>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
              {JSON.stringify(content, null, 2)}
            </pre>
          </div>
        )
    }
  }

  const canApprove = contribution.status === "PENDING" || contribution.status === "UNDER_REVIEW"
  const canReject = contribution.status === "PENDING" || contribution.status === "UNDER_REVIEW"
  const canReview = contribution.status === "PENDING"

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getTypeIcon(contribution.type)}
            <CardTitle className="text-lg">
              {contribution.type.replace(/_/g, ' ')}
            </CardTitle>
          </div>
          {getStatusBadge(contribution.status)}
        </div>
        <CardDescription>
          Submitted by {contribution.user.name} ({contribution.user.email})
          <br />
          <span className="text-xs text-muted-foreground">
            {new Date(contribution.createdAt).toLocaleString()}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Content Preview */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">Content Preview</h4>
          {renderContentPreview()}
        </div>

        {/* Existing Notes */}
        {contribution.notes && (
          <div>
            <Label className="text-sm font-medium">Current Notes</Label>
            <p className="text-sm text-muted-foreground">{contribution.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        {canApprove || canReject || canReview ? (
          <div className="flex space-x-2">
            {canApprove && (
              <Dialog open={isDialogOpen && actionType === "approve"} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => handleAction("approve")}
                    variant="default"
                    size="sm"
                    disabled={isLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Approve Contribution</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to approve this contribution? This action will apply the changes to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="approve-notes">Notes (optional)</Label>
                      <Textarea
                        id="approve-notes"
                        placeholder="Add any notes about this approval..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={confirmAction} disabled={isLoading}>
                      Approve Contribution
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {canReject && (
              <Dialog open={isDialogOpen && actionType === "reject"} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => handleAction("reject")}
                    variant="destructive"
                    size="sm"
                    disabled={isLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Contribution</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to reject this contribution? Please provide a reason.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reject-reason">Reason for rejection *</Label>
                      <Textarea
                        id="reject-reason"
                        placeholder="Please explain why this contribution is being rejected..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={confirmAction} 
                      disabled={isLoading || !notes.trim()}
                    >
                      Reject Contribution
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {canReview && (
              <Dialog open={isDialogOpen && actionType === "review"} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => handleAction("review")}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Mark for Review
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mark for Review</DialogTitle>
                    <DialogDescription>
                      Mark this contribution as under review. You can add notes about what needs to be reviewed.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="review-notes">Review Notes (optional)</Label>
                      <Textarea
                        id="review-notes"
                        placeholder="Add notes about what needs to be reviewed..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={confirmAction} disabled={isLoading}>
                      Mark for Review
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This contribution has already been processed and cannot be modified.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
