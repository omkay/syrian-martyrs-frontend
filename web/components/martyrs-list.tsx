"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ImageIcon, Search, PlusCircle } from "lucide-react"
import { MartyrCard } from "./martyr-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { searchMartyrsAction } from "@/app/actions"
import type { Martyr } from "@/lib/types"

interface MartyrsListProps {
  onAddMartyr?: () => void
  initialMartyrs?: Martyr[]
}

export function MartyrsList({ onAddMartyr, initialMartyrs = [] }: MartyrsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false)
  const [martyrs, setMartyrs] = useState<Martyr[]>(initialMartyrs)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchTerm !== "") {
        setIsLoading(true)
        try {
          const searchResults = await searchMartyrsAction(searchTerm)
          setMartyrs(searchResults)
        } catch (error) {
          console.error("Search error:", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setMartyrs(initialMartyrs)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, initialMartyrs])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real implementation, this would process the image and perform facial recognition
    // For now, we'll just show a message
    if (e.target.files && e.target.files[0]) {
      alert("Image search functionality would be implemented here")
      setIsImageSearchOpen(false)
    }
  }

  const handleAddMartyr = () => {
    if (user) {
      router.push("/add-martyr")
    } else {
      router.push("/login?returnTo=/add-martyr")
    }
  }

  return (
    <section className="container py-12">
      <Card>
        <CardHeader>
          <CardTitle>Martyrs Database</CardTitle>
          <div className="mt-4 flex w-full gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Dialog open={isImageSearchOpen} onOpenChange={setIsImageSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" title="Search by image">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Search by Image</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    Upload an image to search for matching faces in our database.
                  </p>
                  <Input type="file" accept="image/*" onChange={handleImageUpload} />
                  <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, WEBP</p>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              onClick={handleAddMartyr}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="icon"
              title="Add new martyr profile"
            >
              +
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Searching...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {martyrs.map((martyr) => (
                  <MartyrCard key={martyr.id} martyr={martyr} />
                ))}
              </div>
              {martyrs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "No martyrs found matching your search criteria." : "No martyrs found in the database."}
                  </p>
                  <div className="flex justify-center">
                    <Button onClick={handleAddMartyr}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New Martyr
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
