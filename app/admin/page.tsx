"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, Clock, CheckCircle, Users, FileText, TrendingUp, Shield, AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

interface AdminStats {
  martyrs: {
    total: number
    verified: number
    unverified: number
    verificationRate: number
  }
  contributions: {
    total: number
    pending: number
    approved: number
    rejected: number
    approvalRate: number
  }
  users: {
    total: number
    admins: number
    moderators: number
    regular: number
  }
  recentActivity: {
    contributions: any[]
    martyrs: any[]
  }
}

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)

  // Load admin statistics
  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    try {
      setStatsLoading(true)
      setStatsError(null)
      
      const response = await fetch('/api/admin/stats')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error("Failed to load admin stats:", err)
      setStatsError(`Failed to load statistics: ${err.message}`)
    } finally {
      setStatsLoading(false)
    }
  }

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || user.role !== "ADMIN") {
    return null // Will redirect in useEffect
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Overview Section */}
        <div className="mb-8">
          {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading statistics...</span>
              </div>
            ) : statsError ? (
              <div className="flex items-center justify-center py-8">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <span className="ml-2 text-red-500">{statsError}</span>
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Martyrs</CardTitle>
                      <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.martyrs.total}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.martyrs.verificationRate}% verified
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Contributions</CardTitle>
                      <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.contributions.pending}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.contributions.approvalRate}% approval rate
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Verified Martyrs</CardTitle>
                      <Shield className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.martyrs.verified}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.martyrs.unverified} unverified
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.users.total}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.users.admins} admins, {stats.users.moderators} moderators
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contributions Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Total</span>
                          <Badge variant="outline">{stats.contributions.total}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Approved</span>
                          <Badge variant="default">{stats.contributions.approved}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Rejected</span>
                          <Badge variant="destructive">{stats.contributions.rejected}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">User Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Admins</span>
                          <Badge variant="destructive">{stats.users.admins}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Moderators</span>
                          <Badge variant="secondary">{stats.users.moderators}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Users</span>
                          <Badge variant="outline">{stats.users.regular}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Verification Rate</span>
                          <Badge variant={stats.martyrs.verificationRate > 80 ? "default" : "secondary"}>
                            {stats.martyrs.verificationRate}%
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Approval Rate</span>
                          <Badge variant={stats.contributions.approvalRate > 70 ? "default" : "secondary"}>
                            {stats.contributions.approvalRate}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : null}
        </div>

          {/* Action Cards */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Admin Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Review Contributions
                  </CardTitle>
                  <CardDescription>
                    Review and approve user testimonials and corrections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage user-submitted testimonials, corrections, and other contributions to the memorial.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/admin/contributions">
                      Go to Contributions
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Manage Martyrs
                  </CardTitle>
                  <CardDescription>
                    Review and approve new martyr profiles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Review martyr additions submitted by users and manage martyr verification status.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/admin/martyrs">
                      Go to Martyrs
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Manage Users
                  </CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage user accounts, roles, permissions, and verification status.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/admin/users">
                      Go to Users
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
      </div>

      <Footer />
    </main>
  )
}