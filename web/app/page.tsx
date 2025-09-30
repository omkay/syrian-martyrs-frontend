import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { MartyrsList } from "@/components/martyrs-list"
import { Footer } from "@/components/footer"
import { getMartyrs } from "./actions"

export default async function Home() {
  const martyrs = await getMartyrs(20) // Load first 20 martyrs

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <MartyrsList initialMartyrs={martyrs} />
      <Footer />
    </main>
  )
}
