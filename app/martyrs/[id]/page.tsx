"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getMartyrByIdAction } from "./actions"
import { notFound } from "next/navigation"
import Image from "next/image"
import { useEffect, useState, use } from "react"
import type { Martyr } from "@/lib/types"
import {
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  BriefcaseIcon,
  UsersIcon,
  BookOpenIcon,
  ArrowLeft,
  PlusCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ContributionForm } from "@/components/contribution-form"

export default function MartyrPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [martyr, setMartyr] = useState<Martyr | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    async function fetchMartyr() {
      try {
        const martyrData = await getMartyrByIdAction(resolvedParams.id)
        setMartyr(martyrData)
        if (!martyrData) {
          notFound()
        }
      } catch (error) {
        console.error("Error fetching martyr:", error)
        notFound()
      } finally {
        setLoading(false)
      }
    }
    
    fetchMartyr()
  }, [resolvedParams.id])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!martyr) {
    notFound()
  }

  const handleAddMartyr = () => {
    if (user) {
      router.push("/add-martyr")
    } else {
      router.push("/login?returnTo=/add-martyr")
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all martyrs
          </Link>

          <Button onClick={handleAddMartyr}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Martyr
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column - Image and basic info */}
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="aspect-[3/4] relative mb-4 overflow-hidden rounded-md">
                  <Image
                    src={martyr.image || "/placeholder.svg?height=400&width=300"}
                    alt={martyr.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <h1 className="text-2xl font-bold mb-4">{martyr.name}</h1>

                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{new Date(martyr.dateOfDeath).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <MapPinIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{martyr.location}</span>
                  </div>

                  {martyr.age && (
                    <div className="flex items-center text-sm">
                      <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Age: {martyr.age}</span>
                    </div>
                  )}

                  {martyr.occupation && (
                    <div className="flex items-center text-sm">
                      <BriefcaseIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{martyr.occupation}</span>
                    </div>
                  )}

                  {martyr.familyStatus && (
                    <div className="flex items-center text-sm">
                      <UsersIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{martyr.familyStatus}</span>
                    </div>
                  )}
                </div>

                {martyr.cause && (
                  <div className="mt-4">
                    <Badge variant="outline" className="text-sm">
                      {martyr.cause}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column - Description, testimonials, sources */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Biography</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{martyr.description}</p>
              </CardContent>
            </Card>

            {martyr.testimonials && martyr.testimonials.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Testimonials</CardTitle>
                    <CardDescription>Remembrances from family, friends, and colleagues</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {martyr.testimonials.map((testimonial) => (
                      <div key={testimonial.id} className="p-4 rounded-lg bg-muted">
                        <blockquote className="italic mb-2">"{testimonial.content}"</blockquote>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">{testimonial.author}</span>
                          {testimonial.relationship && <span> - {testimonial.relationship}</span>}
                          {testimonial.date && <span>, {new Date(testimonial.date).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {martyr.sources && martyr.sources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sources</CardTitle>
                  <CardDescription>Documentation and references</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {martyr.sources.map((source, index) => (
                      <div key={index} className="flex items-start">
                        <BookOpenIcon className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          {source.url ? (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {source.name}
                            </a>
                          ) : (
                            <span>{source.name}</span>
                          )}
                          <div className="text-sm text-muted-foreground">
                            {new Date(source.date).toLocaleDateString()} - {source.type.charAt(0).toUpperCase() + source.type.slice(1)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contribution Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contribute to this Memorial</CardTitle>
                <CardDescription>
                  Help us preserve the memory of {martyr.name} by sharing your knowledge, photos, or testimonials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Your contributions help create a more complete picture of those who have been lost. All submissions
                  are reviewed by our team before being published.
                </p>
                <ContributionForm martyrId={martyr.id} martyrName={martyr.name} />
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to all martyrs
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href="/about">Learn more about this memorial</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
