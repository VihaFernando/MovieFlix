import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { TMDB_IMAGE_BASE_URL, POSTER_SIZES } from "@/lib/tmdb"
import { Card, CardContent } from "@/components/ui/card"

interface MovieCardProps {
  id: number
  title: string
  posterPath: string | null
  voteAverage: number
  releaseDate?: string
}

export default function MovieCard({ id, title, posterPath, voteAverage, releaseDate }: MovieCardProps) {
  const imageUrl = posterPath
    ? `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZES.medium}${posterPath}`
    : "/placeholder.svg?height=513&width=342"

  const year = releaseDate ? new Date(releaseDate).getFullYear() : null

  return (
    <Link href={`/movie/${id}`}>
      <Card className="overflow-hidden h-full transition-all duration-300 hover:scale-105 hover:shadow-lg group">
        <div className="aspect-[2/3] relative overflow-hidden">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <p className="text-white font-medium line-clamp-2">{title}</p>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1">{title}</h3>
          <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
            {year && <span>{year}</span>}
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
              <span>{voteAverage.toFixed(1)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
