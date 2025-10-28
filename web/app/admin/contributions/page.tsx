"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContributionsList } from "@/components/admin/contributions-list"
import { hasPermission } from "@/lib/role-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function AdminContributionsPage() {
  const { user } = useAuth()
  const [contributions, setContributions] = useState<any[]>([])
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
      setError(null)
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token
      
      const response = await fetch(`${apiUrl}/api/admin/contributions`, {
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
      
      // The API returns { contributions: [...], pagination: {...} }
      const allContributions = data.contributions || []
      
      // Filter out martyr additions - only show testimonials, corrections, etc.
      const filteredContributions = allContributions.filter((contrib: any) => 
        contrib.type !== 'MARTYR_ADDITION'
      )
      
      console.log("Filtered contributions (excluding martyr additions):", filteredContributions)
      setContributions(filteredContributions)
    } catch (err: any) {
      console.error("Failed to load contributions:", err)
      setError(`Failed to load contributions: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user has permission to view contributions
  if (user && !hasPermission('VIEW_ALL_CONTRIBUTIONS', user.role, user.isVerified)) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to view contributions. Contact an administrator.
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
          {/* Debug information */}
          <div className="mb-4 p-4 bg-gray-100 rounded">
            <h3 className="font-bold">Debug Information:</h3>
            <p>Contributions loaded: {contributions.length}</p>
            <p>Is loading: {isLoading ? 'Yes' : 'No'}</p>
            <p>Error: {error || 'None'}</p>
            <p>User role: {user?.role}</p>
          </div>
          
          <ContributionsList 
            initialContributions={contributions}
            onRefresh={loadContributions}
          />
        </div>
      </div>

      <Footer />
    </main>
  )
}