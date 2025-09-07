"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function ContributionsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
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

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Your Contributions</h1>

        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Contributions</CardTitle>
                <CardDescription>Contributions awaiting review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">Testimonial for Ahmad Khalid</h3>
                        <p className="text-sm text-muted-foreground">Submitted on: April 5, 2023</p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded dark:bg-yellow-900 dark:text-yellow-200">
                        Pending
                      </span>
                    </div>
                    <p className="text-sm">
                      "I knew Ahmad from university. He was always passionate about education and helping others."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Contributions</CardTitle>
                <CardDescription>Contributions that have been published</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">Photo for Layla Ibrahim</h3>
                        <p className="text-sm text-muted-foreground">Submitted on: March 12, 2023</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-200">
                        Approved
                      </span>
                    </div>
                    <p className="text-sm">"A photo of Layla volunteering at a local clinic in 2010."</p>
                    <div className="mt-2">
                      <Button size="sm" variant="outline">
                        View on Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Contributions</CardTitle>
                <CardDescription>Contributions that were not approved</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">Document for Mohammed Al-Sayid</h3>
                        <p className="text-sm text-muted-foreground">Submitted on: February 8, 2023</p>
                      </div>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded dark:bg-red-900 dark:text-red-200">
                        Rejected
                      </span>
                    </div>
                    <p className="text-sm mb-2">"News article about the incident in Aleppo."</p>
                    <div className="p-3 bg-muted rounded-md text-sm">
                      <p className="font-medium">Reason for rejection:</p>
                      <p>
                        The document could not be verified from reliable sources. Please provide additional
                        verification.
                      </p>
                    </div>
                    <div className="mt-2">
                      <Button size="sm" variant="outline">
                        Edit & Resubmit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </main>
  )
}
