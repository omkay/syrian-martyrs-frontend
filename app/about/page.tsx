import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="container py-12 md:py-24 lg:py-32">
        <div className="mx-auto max-w-3xl space-y-8">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">About This Memorial</h1>

          <p className="text-muted-foreground">
            The Syrian Martyrs Memorial is dedicated to preserving the memory of those who have lost their lives during
            the Syrian conflict that began in 2011.
          </p>

          <h2 className="text-2xl font-bold tracking-tight">Our Mission</h2>
          <p className="text-muted-foreground">
            Our mission is to document and honor the lives of Syrian civilians and others who have died as a result of
            the conflict. We aim to provide a space for remembrance, reflection, and education about the human cost of
            the Syrian crisis.
          </p>

          <h2 className="text-2xl font-bold tracking-tight">The Database</h2>
          <p className="text-muted-foreground">
            Our database includes information about individuals from all backgrounds and affiliations who have lost
            their lives. We strive for accuracy and comprehensiveness in our documentation, relying on verified reports
            from human rights organizations, news sources, and family testimonies.
          </p>

          <h2 className="text-2xl font-bold tracking-tight">Contributing</h2>
          <p className="text-muted-foreground">
            If you have information about someone who should be included in this memorial, or if you notice any
            inaccuracies in our records, please contact us. We are committed to maintaining the dignity and accuracy of
            each person's memory.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  )
}
