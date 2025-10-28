"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MartyrVerification } from "@/components/admin/martyr-verification"
import { hasPermission } from "@/lib/role-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle,
  Shield,
  ShieldCheck,
  User,
  Calendar,
  MapPin
} from "lucide-react"

interface MartyrAddition {
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
    isVerified: boolean
  }
}

export default function AdminMartyrsPage() {
  const { user } = useAuth()
  const [martyrAdditions, setMartyrAdditions] = useState<MartyrAddition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  useEffect(() => {
    if (user) {
      loadMartyrAdditions()
    }
  }, [user])

  const loadMartyrAdditions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token
      
      // Get all contributions and filter for MARTYR_ADDITION type
      const response = await fetch(`${apiUrl}/api/admin/contributions?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Contributions data received:", data)
      
      // Filter for only MARTYR_ADDITION type contributions
      const martyrAdditions = (data.contributions || []).filter(
        (contrib: any) => contrib.type === 'MARTYR_ADDITION'
      )
      
      console.log("Martyr additions filtered:", martyrAdditions)
      setMartyrAdditions(martyrAdditions)
    } catch (err: any) {
      console.error("Failed to load martyr additions:", err)
      setError(`Failed to load martyr additions: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (contributionId: string, newStatus: string, notes?: string) => {
    try {
      // TODO: Replace with actual API call
      console.log(`Updating contribution ${contributionId} status to ${newStatus}`, { notes })
      
      // Update local state
      setMartyrAdditions(prev => 
        prev.map(addition => 
          addition.id === contributionId 
            ? { ...addition, status: newStatus, notes: notes || addition.notes }
            : addition
        )
      )
      
    } catch (err) {
      console.error("Failed to update contribution status:", err)
    }
  }

  // Filter martyr additions based on search and filters
  const filteredMartyrAdditions = martyrAdditions.filter(addition => {
    const martyrData = addition.content?.martyrData || {}
    const matchesSearch = 
      (martyrData.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (martyrData.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (martyrData.occupation || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      addition.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addition.user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "ALL" || addition.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Check if user has permission to manage martyrs
  if (user && !hasPermission('EDIT_MARTYRS', user.role)) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to manage martyrs. Contact an administrator.
            </AlertDescription>
          </Alert>
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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Martyr Additions Management</h1>
              <p className="text-muted-foreground mt-2">
                Review and approve new martyr profiles submitted by users
              </p>
            </div>
            <Button onClick={loadMartyrAdditions} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{martyrAdditions.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Shield className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {martyrAdditions.filter(m => m.status === 'PENDING').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <ShieldCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {martyrAdditions.filter(m => m.status === 'APPROVED').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <Shield className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {martyrAdditions.filter(m => m.status === 'REJECTED').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, location, or occupation..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Martyr Additions List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : filteredMartyrAdditions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No martyr additions found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              filteredMartyrAdditions.map((addition) => (
                <Card key={addition.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {addition.content?.martyrData?.name || 'Unknown Martyr'}
                        </CardTitle>
                        <CardDescription>
                          Submitted by {addition.user.name} ({addition.user.email})
                        </CardDescription>
                      </div>
                      <Badge variant={
                        addition.status === 'APPROVED' ? 'default' :
                        addition.status === 'REJECTED' ? 'destructive' :
                        addition.status === 'UNDER_REVIEW' ? 'secondary' : 'outline'
                      }>
                        {addition.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Martyr Details</h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p><strong>Age:</strong> {addition.content?.martyrData?.age || 'N/A'}</p>
                          <p><strong>Location:</strong> {addition.content?.martyrData?.location || 'N/A'}</p>
                          <p><strong>Cause:</strong> {addition.content?.martyrData?.cause || 'N/A'}</p>
                          <p><strong>Occupation:</strong> {addition.content?.martyrData?.occupation || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">
                          {addition.content?.martyrData?.description || 'No description provided'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusChange(addition.id, 'APPROVED')}
                        disabled={addition.status === 'APPROVED'}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleStatusChange(addition.id, 'REJECTED')}
                        disabled={addition.status === 'REJECTED'}
                      >
                        Reject
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleStatusChange(addition.id, 'UNDER_REVIEW')}
                        disabled={addition.status === 'UNDER_REVIEW'}
                      >
                        Mark for Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
