"use client"

import { useState, useEffect } from "react"
import { ContributionReview } from "./contribution-review"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye
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

interface ContributionsListProps {
  initialContributions?: Contribution[]
  onRefresh?: () => void
}

export function ContributionsList({ 
  initialContributions = [], 
  onRefresh 
}: ContributionsListProps) {
  const [contributions, setContributions] = useState<Contribution[]>(initialContributions)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null)

  // Update contributions when initialContributions changes
  useEffect(() => {
    console.log("ContributionsList: initialContributions changed:", initialContributions)
    setContributions(initialContributions)
  }, [initialContributions])

  // Filter contributions based on search and filters
  const filteredContributions = contributions.filter(contribution => {
    const matchesSearch = 
      contribution.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contribution.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contribution.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contribution.martyr?.name || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "ALL" || contribution.status === statusFilter
    const matchesType = typeFilter === "ALL" || contribution.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const handleStatusChange = async (contributionId: string, newStatus: string, notes?: string) => {
    try {
      setIsLoading(true)
      
      // Here you would make the API call to update the contribution
      // For now, we'll simulate the update
      console.log(`Updating contribution ${contributionId} to ${newStatus}`, { notes })
      
      // Update local state
      setContributions(prev => 
        prev.map(contribution => 
          contribution.id === contributionId 
            ? { ...contribution, status: newStatus, notes: notes || contribution.notes }
            : contribution
        )
      )
      
      // Close the selected contribution if it was updated
      if (selectedContribution?.id === contributionId) {
        setSelectedContribution(null)
      }
      
    } catch (err) {
      console.error("Failed to update contribution status:", err)
      setError("Failed to update contribution status")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusCounts = () => {
    const counts = {
      PENDING: 0,
      UNDER_REVIEW: 0,
      APPROVED: 0,
      REJECTED: 0
    }
    
    contributions.forEach(contribution => {
      if (counts.hasOwnProperty(contribution.status)) {
        counts[contribution.status as keyof typeof counts]++
      }
    })
    
    return counts
  }

  const statusCounts = getStatusCounts()

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contributions Management</h2>
          <p className="text-muted-foreground">
            Review and manage user contributions to the Syrian Martyrs Memorial
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.PENDING}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.UNDER_REVIEW}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.APPROVED}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.REJECTED}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, type, or martyr..."
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
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="MARTYR_ADDITION">Martyr Addition</SelectItem>
                  <SelectItem value="MARTYR_UPDATE">Martyr Update</SelectItem>
                  <SelectItem value="TESTIMONIAL_ADDITION">Testimonial Addition</SelectItem>
                  <SelectItem value="PHOTO_ADDITION">Photo Addition</SelectItem>
                  <SelectItem value="SOURCE_ADDITION">Source Addition</SelectItem>
                  <SelectItem value="PROFILE_CREATION">Profile Creation</SelectItem>
                  <SelectItem value="PROFILE_UPDATE">Profile Update</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contributions List */}
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
        ) : filteredContributions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No contributions found matching your criteria.</p>
              <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
                <p>Debug: Total contributions: {contributions.length}</p>
                <p>Search term: "{searchTerm}"</p>
                <p>Status filter: {statusFilter}</p>
                <p>Type filter: {typeFilter}</p>
                <p>Filtered count: {filteredContributions.length}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredContributions.map((contribution) => (
            <ContributionReview
              key={contribution.id}
              contribution={contribution}
              onStatusChange={handleStatusChange}
              isLoading={isLoading}
            />
          ))
        )}
      </div>
    </div>
  )
}
