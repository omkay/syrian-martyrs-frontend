import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Martyr } from "@/lib/types"
import { CalendarIcon, MapPinIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface MartyrCardProps {
  martyr: Martyr
}

export function MartyrCard({ martyr }: MartyrCardProps) {
  return (
    <Link href={`/martyrs/${martyr.id}`} className="block h-full transition-all hover:scale-[1.02]">
      <Card className="h-full hover:shadow-md transition-all">
        <CardHeader>
          <CardTitle>{martyr.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="mr-1 h-4 w-4" />
            <span>{martyr.dateOfDeath.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPinIcon className="mr-1 h-4 w-4" />
            <span>{martyr.location}</span>
          </div>
          {martyr.cause && <Badge variant="outline">{martyr.cause}</Badge>}
          {martyr.description && <p className="text-sm mt-2 line-clamp-2">{martyr.description}</p>}
        </CardContent>
      </Card>
    </Link>
  )
}
