import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { MartyrsList } from "@/components/martyrs-list"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <MartyrsList />
      <Footer />
    </main>
  )
}
