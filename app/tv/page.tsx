"use client"

import { useState, useEffect } from "react"
import { Tv, RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { TMDB_IMAGE_BASE_URL, POSTER_SIZES } from "@/lib/tmdb"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export default function TvShowsPage() {
  const [shows, setShows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchTvShows = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/popular?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&page=${page}&language=en-US`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch TV shows: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setShows(data.results)
      setTotalPages(data.total_pages > 500 ? 500 : data.total_pages)
    } catch (error) {
      console.error("Error fetching TV shows:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch TV shows")
      setShows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTvShows()
  }, [page])

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
      <div className="flex items-center mb-8">
        <Tv className="mr-3 h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Popular TV Shows</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 animate-in fade-in-50 duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button variant="outline" size="sm" className="w-fit" onClick={fetchTvShows}>
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <Skeleton className="aspect-[2/3] w-full rounded-md" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : shows.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in fade-in-50 duration-300">
            {shows.map((show) => {
              const imageUrl = show.poster_path
                ? `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZES.medium}${show.poster_path}`
                : "/placeholder.svg?height=513&width=342"

              const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : null

              return (
                <Link href={`/tv/${show.id}`} key={show.id}>
                  <Card className="overflow-hidden h-full transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="aspect-[2/3] relative">
                      <Image
                        src={imageUrl || "/placeholder.svg"}
                        alt={show.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                        priority={false}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-1">{show.name}</h3>
                      <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                        {year && <span>{year}</span>}
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{show.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          <div className="flex justify-between items-center mt-8">
            <Button
              onClick={handlePreviousPage}
              disabled={page === 1}
              variant="outline"
              className="transition-transform hover:-translate-x-1"
            >
              Previous
            </Button>

            <span className="text-muted-foreground">
              Page {page} of {totalPages}
            </span>

            <Button
              onClick={handleNextPage}
              disabled={page === totalPages}
              variant="outline"
              className="transition-transform hover:translate-x-1"
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No TV shows found.</p>
        </div>
      )}
    </div>
  )
}
