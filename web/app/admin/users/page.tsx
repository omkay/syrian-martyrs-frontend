"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
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
  User,
  Shield,
  ShieldCheck,
  Mail,
  Calendar,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from "lucide-react"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  isVerified: boolean
  createdAt: string
  lastLoginAt: string | null
  profile?: {
    id: string
    bio: string | null
    location: string | null
    isVerified: boolean
  } | null
  contributions?: Array<{
    id: string
    type: string
    status: string
    createdAt: string
  }>
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [verifiedFilter, setVerifiedFilter] = useState("ALL")

  useEffect(() => {
    if (user) {
      loadUsers()
    }
  }, [user])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token
      
      const response = await fetch(`${apiUrl}/api/admin/users?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err: any) {
      console.error("Failed to load users:", err)
      setError(`Failed to load users: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token
      
      const response = await fetch(`${apiUrl}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Update local state
      setUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
      )
    } catch (err) {
      console.error("Failed to update user role:", err)
    }
  }

  const handleVerificationToggle = async (userId: string, isVerified: boolean) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token
      
      const response = await fetch(`${apiUrl}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVerified })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Update local state
      setUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, isVerified } : u)
      )
    } catch (err) {
      console.error("Failed to update user verification:", err)
    }
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter
    const matchesVerified = verifiedFilter === "ALL" || 
      (verifiedFilter === "VERIFIED" && user.isVerified) ||
      (verifiedFilter === "UNVERIFIED" && !user.isVerified)

    return matchesSearch && matchesRole && matchesVerified
  })

  const getRoleBadge = (role: string) => {
    const variants = {
      ADMIN: "destructive",
      MODERATOR: "secondary",
      USER: "outline"
    } as const

    return (
      <Badge variant={variants[role as keyof typeof variants] || "outline"}>
        {role}
      </Badge>
    )
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4" />
      case "MODERATOR":
        return <ShieldCheck className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  // Check if user has permission to manage users
  if (user && !hasPermission('EDIT_USERS', user.role)) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to manage users. Contact an administrator.
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
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground mt-2">
                Manage user accounts, roles, and permissions
              </p>
            </div>
            <Button onClick={loadUsers} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                <Shield className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'ADMIN').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Moderators</CardTitle>
                <ShieldCheck className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'MODERATOR').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.isVerified).length}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Roles</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MODERATOR">Moderator</SelectItem>
                      <SelectItem value="USER">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Verification Status</label>
                  <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Users</SelectItem>
                      <SelectItem value="VERIFIED">Verified Only</SelectItem>
                      <SelectItem value="UNVERIFIED">Unverified Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
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
            ) : filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No users found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getRoleIcon(user.role)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{user.name || 'No Name'}</h3>
                            {getRoleBadge(user.role)}
                            {user.isVerified ? (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <XCircle className="h-3 w-3 mr-1" />
                                Unverified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {user.contributions?.length || 0} contributions
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={user.role}
                          onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">User</SelectItem>
                            <SelectItem value="MODERATOR">Moderator</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant={user.isVerified ? "secondary" : "default"}
                          size="sm"
                          onClick={() => handleVerificationToggle(user.id, !user.isVerified)}
                        >
                          {user.isVerified ? "Unverify" : "Verify"}
                        </Button>
                      </div>
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
