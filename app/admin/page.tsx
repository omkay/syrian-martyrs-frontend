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

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
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

  if (!user || user.role !== "admin") {
    return null // Will redirect in useEffect
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <Tabs defaultValue="contributions">
          <TabsList className="mb-4">
            <TabsTrigger value="contributions">Pending Contributions</TabsTrigger>
            <TabsTrigger value="martyrs">Manage Martyrs</TabsTrigger>
            <TabsTrigger value="users">Manage Users</TabsTrigger>
          </TabsList>

          <TabsContent value="contributions">
            <Card>
              <CardHeader>
                <CardTitle>Pending Contributions</CardTitle>
                <CardDescription>Review and approve user-submitted content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">New Testimonial for Ahmad Khalid</h3>
                        <p className="text-sm text-muted-foreground">Submitted by: Sarah Johnson (sarah@example.com)</p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded dark:bg-yellow-900 dark:text-yellow-200">
                        Pending
                      </span>
                    </div>
                    <p className="text-sm mb-3">
                      "Ahmad was a dedicated teacher who inspired many students. His passion for education was evident
                      in everything he did."
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="default">
                        Approve
                      </Button>
                      <Button size="sm" variant="outline">
                        Reject
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">Photo Submission for Layla Ibrahim</h3>
                        <p className="text-sm text-muted-foreground">
                          Submitted by: Mohammed Ali (mohammed@example.com)
                        </p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded dark:bg-yellow-900 dark:text-yellow-200">
                        Pending
                      </span>
                    </div>
                    <p className="text-sm mb-3">
                      "A photo of Layla during her medical school graduation ceremony in 2010."
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="default">
                        Approve
                      </Button>
                      <Button size="sm" variant="outline">
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="martyrs">
            <Card>
              <CardHeader>
                <CardTitle>Manage Martyrs</CardTitle>
                <CardDescription>Add, edit, or remove martyr profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-4">
                  <Button>Add New Martyr</Button>
                </div>

                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Location</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-3">Ahmad Khalid</td>
                        <td className="p-3">March 15, 2011</td>
                        <td className="p-3">Daraa</td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive">
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Layla Ibrahim</td>
                        <td className="p-3">April 22, 2011</td>
                        <td className="p-3">Homs</td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive">
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
                <CardDescription>View and manage user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Role</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-3">Admin User</td>
                        <td className="p-3">admin@example.com</td>
                        <td className="p-3">Admin</td>
                        <td className="p-3">
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Regular User</td>
                        <td className="p-3">user@example.com</td>
                        <td className="p-3">User</td>
                        <td className="p-3">
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
