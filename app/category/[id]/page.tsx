"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react"
import { getMoviesByGenre } from "@/lib/tmdb"
import MovieGrid from "@/components/movie-grid"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

const genreNames: Record<string, string> = {
  "28": "Action",
  "12": "Adventure",
  "16": "Animation",
  "35": "Comedy",
  "80": "Crime",
  "99": "Documentary",
  "18": "Drama",
  "10751": "Family",
  "14": "Fantasy",
  "36": "History",
  "27": "Horror",
  "10402": "Music",
  "9648": "Mystery",
  "10749": "Romance",
  "878": "Science Fiction",
  "10770": "TV Movie",
  "53": "Thriller",
  "10752": "War",
  "37": "Western",
}

interface CategoryPageProps {
  params: {
    id: string
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const genreName = genreNames[params.id] || "Unknown Genre"

  const fetchMoviesByGenre = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMoviesByGenre(Number.parseInt(params.id), page)
      setMovies(data.results)
      setTotalPages(data.total_pages > 500 ? 500 : data.total_pages) // TMDb API limits to 500 pages
    } catch (error) {
      console.error("Error fetching movies by genre:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch movies")
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMoviesByGenre()
  }, [params.id, page])

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1)
      window.scrollTo(0, 0)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/">
        <Button variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-8">{genreName} Movies</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button variant="outline" size="sm" className="w-fit" onClick={fetchMoviesByGenre}>
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full rounded-md" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : movies.length > 0 ? (
        <>
          <MovieGrid movies={movies} />

          <div className="flex justify-between items-center mt-8">
            <Button onClick={handlePreviousPage} disabled={page === 1} variant="outline">
              Previous
            </Button>

            <span className="text-muted-foreground">
              Page {page} of {totalPages}
            </span>

            <Button onClick={handleNextPage} disabled={page === totalPages} variant="outline">
              Next
            </Button>
          </div>
        </>
      ) : !error ? (
        <p className="text-center py-8 text-muted-foreground">No movies found for this genre.</p>
      ) : null}
    </div>
  )
}
