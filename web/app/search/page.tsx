import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MartyrsList } from "@/components/martyrs-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="container py-12">
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Advanced Search</CardTitle>
            <Button asChild>
              <Link href="/add-martyr">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Martyr
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Use the search functionality below to find specific records in our database of Syrian martyrs. If you
              don't find the person you're looking for, you can add a new profile.
            </p>
          </CardContent>
        </Card>

        <MartyrsList />
      </section>
      <Footer />
    </main>
  )
}
