"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getContributionsByUser } from "@/lib/db"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  FileText, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Plus
} from "lucide-react"

interface Contribution {
  id: string
  type: string
  status: string
  content: any
  notes?: string
  createdAt: string
  updatedAt: string
  martyr?: {
    id: string
    name: string
  }
  profile?: {
    id: string
    userId: string
  }
}

export default function ContributionsPage() {
  const { user } = useAuth()
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadContributions()
    }
  }, [user])

  const loadContributions = async () => {
    try {
      setIsLoading(true)
      // Load only MARTYR_ADDITION and TESTIMONIAL_ADDITION contributions
      const response = await fetch(`/api/contributions?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setContributions(data)
      } else {
        setError("Failed to load contributions")
      }
    } catch (err) {
      setError("Failed to load contributions")
    } finally {
      setIsLoading(false)
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
      case "TESTIMONIAL_ADDITION":
        return <FileText className="h-5 w-5" />
      case "MARTYR_ADDITION":
        return <Edit className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getContributionTitle = (type: string) => {
    switch (type) {
      case "TESTIMONIAL_ADDITION":
        return "Testimonial"
      case "MARTYR_ADDITION":
        return "Created Martyr Profile"
      default:
        return "Contribution"
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>
                Please log in to view your contributions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/login">Login</a>
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Contributions</h1>
            <p className="text-muted-foreground mt-2">
              View and manage your contributions to the Syrian Martyrs Memorial
            </p>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="martyrs">Martyrs</TabsTrigger>
              <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">All Contributions</h2>
                <div className="space-x-2">
                  <Button asChild>
                    <a href="/add-martyr">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Martyr
                    </a>
                  </Button>
                </div>
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
              ) : contributions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No contributions yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start contributing to the Syrian Martyrs Memorial by creating martyr profiles or adding testimonials.
                    </p>
                    <div className="space-y-2">
                      <Button asChild>
                        <a href="/add-martyr">Add Martyr Profile</a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href="/search">Browse Martyrs to Add Testimonials</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {contributions.map((contribution) => (
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
                          Submitted on {new Date(contribution.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {contribution.martyr && (
                            <p className="text-sm text-muted-foreground">
                              Related to: <strong>{contribution.martyr.name}</strong>
                            </p>
                          )}
                          {contribution.notes && (
                            <p className="text-sm">{contribution.notes}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>


            <TabsContent value="martyrs" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Martyr Profiles</h2>
                <Button asChild>
                  <a href="/add-martyr">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Martyr
                  </a>
                </Button>
              </div>
              
              {contributions.filter(c => c.type === 'MARTYR_ADDITION').length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Edit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Martyr Profiles</h3>
                    <p className="text-muted-foreground mb-4">
                      Create new martyr profiles to help preserve their memory and share their stories.
                    </p>
                    <Button asChild>
                      <a href="/add-martyr">Add Martyr Profile</a>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {contributions.filter(c => c.type === 'MARTYR_ADDITION').map((contribution) => (
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
                          Submitted on {new Date(contribution.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {contribution.martyr && (
                            <p className="text-sm text-muted-foreground">
                              Related to: <strong>{contribution.martyr.name}</strong>
                            </p>
                          )}
                          {contribution.notes && (
                            <p className="text-sm">{contribution.notes}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="testimonials" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Testimonial Contributions</h2>
                <Button variant="outline" asChild>
                  <a href="/search">Browse Martyrs</a>
                </Button>
              </div>
              
              {contributions.filter(c => c.type === 'TESTIMONIAL_ADDITION').length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Testimonials Added</h3>
                    <p className="text-muted-foreground mb-4">
                      Share personal stories and memories about martyrs to help preserve their legacy.
                    </p>
                    <Button variant="outline" asChild>
                      <a href="/search">Browse Martyrs to Add Testimonials</a>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {contributions.filter(c => c.type === 'TESTIMONIAL_ADDITION').map((contribution) => (
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
                          Submitted on {new Date(contribution.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {contribution.martyr && (
                            <p className="text-sm text-muted-foreground">
                              Related to: <strong>{contribution.martyr.name}</strong>
                            </p>
                          )}
                          {contribution.notes && (
                            <p className="text-sm">{contribution.notes}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </main>
  )
}