"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  User, 
  FileText, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Eye,
  ThumbsUp,
  ThumbsDown
} from "lucide-react"
import { hasPermission } from "@/lib/role-utils"

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

export default function AdminContributionsPage() {
  const { user } = useAuth()
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null)

  useEffect(() => {
    if (user) {
      loadContributions()
    }
  }, [user])

  const loadContributions = async () => {
    try {
      setIsLoading(true)
      // This would be a client-side action in a real app
      // For now, we'll simulate the data
      setContributions([])
    } catch (err) {
      setError("Failed to load contributions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (contributionId: string, newStatus: string) => {
    try {
      // This would call an action to update the status
      console.log(`Updating contribution ${contributionId} to ${newStatus}`)
      // Reload contributions after update
      await loadContributions()
    } catch (err) {
      console.error("Failed to update contribution status:", err)
    }
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
    switch (status) {
      case "APPROVED":
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>
      case "UNDER_REVIEW":
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Under Review</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getContributionIcon = (type: string) => {
    switch (type) {
      case "PROFILE_CREATION":
      case "PROFILE_UPDATE":
        return <User className="h-5 w-5" />
      case "TESTIMONIAL_ADDITION":
        return <FileText className="h-5 w-5" />
      case "MARTYR_ADDITION":
      case "MARTYR_UPDATE":
        return <Edit className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getContributionTitle = (type: string) => {
    switch (type) {
      case "PROFILE_CREATION":
        return "Profile Creation"
      case "PROFILE_UPDATE":
        return "Profile Update"
      case "PROFILE_VERIFICATION":
        return "Profile Verification Request"
      case "TESTIMONIAL_ADDITION":
        return "Testimonial"
      case "MARTYR_ADDITION":
        return "Martyr Profile Addition"
      case "MARTYR_UPDATE":
        return "Martyr Profile Update"
      case "SOURCE_ADDITION":
        return "Source Addition"
      case "CORRECTION":
        return "Correction"
      default:
        return "Contribution"
    }
  }

  // Check if user has admin permissions
  if (!user || !hasPermission("ACCESS_ADMIN_PANEL", user.role)) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to access the admin panel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/">Go Home</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Contributions Management</h1>
            <p className="text-muted-foreground mt-2">
              Review and manage user contributions to the Syrian Martyrs Memorial
            </p>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="under-review">Under Review</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Pending Contributions</h2>
                <Badge variant="secondary">{contributions.filter(c => c.status === "PENDING").length} items</Badge>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading contributions...</p>
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : contributions.filter(c => c.status === "PENDING").length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No pending contributions</h3>
                    <p className="text-muted-foreground">
                      All contributions have been reviewed. Great job!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {contributions
                    .filter(c => c.status === "PENDING")
                    .map((contribution) => (
                    <Card key={contribution.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getContributionIcon(contribution.type)}
                            <CardTitle className="text-lg">
                              {getContributionTitle(contribution.type)}
                            </CardTitle>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(contribution.status)}
                            {getStatusBadge(contribution.status)}
                          </div>
                        </div>
                        <CardDescription>
                          Submitted by {contribution.user.name} ({contribution.user.email}) on {new Date(contribution.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {contribution.martyr && (
                            <p className="text-sm text-muted-foreground">
                              Related to: <strong>{contribution.martyr.name}</strong>
                            </p>
                          )}
                          {contribution.notes && (
                            <p className="text-sm">{contribution.notes}</p>
                          )}
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedContribution(contribution)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleStatusUpdate(contribution.id, "UNDER_REVIEW")}
                            >
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Mark for Review
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleStatusUpdate(contribution.id, "APPROVED")}
                            >
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusUpdate(contribution.id, "REJECTED")}
                            >
                              <ThumbsDown className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="under-review" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Under Review</h2>
                <Badge variant="outline" className="border-blue-500 text-blue-700">
                  {contributions.filter(c => c.status === "UNDER_REVIEW").length} items
                </Badge>
              </div>
              
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Under Review Contributions</h3>
                  <p className="text-muted-foreground">
                    Contributions that are currently being reviewed by the moderation team.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="approved" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Approved Contributions</h2>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {contributions.filter(c => c.status === "APPROVED").length} items
                </Badge>
              </div>
              
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Approved Contributions</h3>
                  <p className="text-muted-foreground">
                    Contributions that have been approved and are now live on the site.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rejected" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Rejected Contributions</h2>
                <Badge variant="destructive">
                  {contributions.filter(c => c.status === "REJECTED").length} items
                </Badge>
              </div>
              
              <Card>
                <CardContent className="text-center py-12">
                  <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Rejected Contributions</h3>
                  <p className="text-muted-foreground">
                    Contributions that have been rejected and will not be published.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </main>
  )
}

