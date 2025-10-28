import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function MartyrNotFound() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container py-24 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4">Martyr Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          We couldn't find the record you're looking for. It may have been removed or the ID might be incorrect.
        </p>

        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Memorial
          </Link>
        </Button>
      </div>

      <Footer />
    </main>
  )
}
