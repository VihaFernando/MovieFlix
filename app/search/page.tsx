"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, RefreshCw, AlertCircle, Search, Film, Tv } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MovieGrid from "@/components/movie-grid"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { TMDB_IMAGE_BASE_URL, POSTER_SIZES } from "@/lib/tmdb"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("query") || ""
  const [movies, setMovies] = useState<any[]>([])
  const [tvShows, setTvShows] = useState<any[]>([])
  const [loading, setLoading] = useState({
    movies: true,
    tvShows: true,
  })
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState({
    movies: 1,
    tvShows: 1,
  })
  const [totalPages, setTotalPages] = useState({
    movies: 1,
    tvShows: 1,
  })
  const [activeTab, setActiveTab] = useState("movies")

  const searchContent = async () => {
    if (!query) return

    setError(null)

    // Search movies
    setLoading((prev) => ({ ...prev, movies: true }))
    try {
      const movieResponse = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page.movies}&language=en-US`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!movieResponse.ok) {
        throw new Error(`Movie search failed: ${movieResponse.status} ${movieResponse.statusText}`)
      }

      const movieData = await movieResponse.json()
      setMovies(movieData.results)
      setTotalPages((prev) => ({
        ...prev,
        movies: movieData.total_pages > 500 ? 500 : movieData.total_pages,
      }))
    } catch (error) {
      console.error("Error searching movies:", error)
      setError(error instanceof Error ? error.message : "Failed to search movies")
    } finally {
      setLoading((prev) => ({ ...prev, movies: false }))
    }

    // Search TV shows
    setLoading((prev) => ({ ...prev, tvShows: true }))
    try {
      const tvResponse = await fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page.tvShows}&language=en-US`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!tvResponse.ok) {
        throw new Error(`TV search failed: ${tvResponse.status} ${tvResponse.statusText}`)
      }

      const tvData = await tvResponse.json()
      setTvShows(tvData.results)
      setTotalPages((prev) => ({
        ...prev,
        tvShows: tvData.total_pages > 500 ? 500 : tvData.total_pages,
      }))
    } catch (error) {
      console.error("Error searching TV shows:", error)
    } finally {
      setLoading((prev) => ({ ...prev, tvShows: false }))
    }
  }

  useEffect(() => {
    if (query) {
      searchContent()
    }
  }, [query, page.movies, page.tvShows])

  const handlePreviousPage = () => {
    if (activeTab === "movies" && page.movies > 1) {
      setPage((prev) => ({ ...prev, movies: prev.movies - 1 }))
      window.scrollTo(0, 0)
    } else if (activeTab === "tvShows" && page.tvShows > 1) {
      setPage((prev) => ({ ...prev, tvShows: prev.tvShows - 1 }))
      window.scrollTo(0, 0)
    }
  }

  const handleNextPage = () => {
    if (activeTab === "movies" && page.movies < totalPages.movies) {
      setPage((prev) => ({ ...prev, movies: prev.movies + 1 }))
      window.scrollTo(0, 0)
    } else if (activeTab === "tvShows" && page.tvShows < totalPages.tvShows) {
      setPage((prev) => ({ ...prev, tvShows: prev.tvShows + 1 }))
      window.scrollTo(0, 0)
    }
  }

  const currentPage = activeTab === "movies" ? page.movies : page.tvShows
  const currentTotalPages = activeTab === "movies" ? totalPages.movies : totalPages.tvShows
  const isLoading = activeTab === "movies" ? loading.movies : loading.tvShows

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/">
        <Button variant="outline" className="mb-6 group">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Button>
      </Link>

      <div className="flex items-center mb-8">
        <Search className="mr-3 h-6 w-6 text-muted-foreground" />
        <h1 className="text-3xl font-bold">{query ? `Search results for "${query}"` : "Search"}</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 animate-in fade-in-50 duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button variant="outline" size="sm" className="w-fit" onClick={searchContent}>
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {query && (
        <Tabs defaultValue="movies" className="mb-8" onValueChange={(value) => setActiveTab(value)}>
          <TabsList>
            <TabsTrigger value="movies" className="flex items-center gap-1">
              <Film className="h-4 w-4" />
              Movies {movies.length > 0 && `(${movies.length})`}
            </TabsTrigger>
            <TabsTrigger value="tvShows" className="flex items-center gap-1">
              <Tv className="h-4 w-4" />
              TV Shows {tvShows.length > 0 && `(${tvShows.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies" className="mt-6">
            {loading.movies ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="space-y-2 animate-pulse">
                    <Skeleton className="aspect-[2/3] w-full rounded-md" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : movies.length > 0 ? (
              <div className="animate-in fade-in-50 duration-300">
                <MovieGrid movies={movies} />
              </div>
            ) : (
              <div className="text-center py-12 animate-in fade-in-50 duration-300">
                <div className="mx-auto w-16 h-16 mb-4 text-muted-foreground">
                  <Film className="w-full h-full" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No movies found</h2>
                <p className="text-muted-foreground mb-6">Try a different search term or browse our categories</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tvShows" className="mt-6">
            {loading.tvShows ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="space-y-2 animate-pulse">
                    <Skeleton className="aspect-[2/3] w-full rounded-md" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : tvShows.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in fade-in-50 duration-300">
                {tvShows.map((show) => {
                  const imageUrl = show.poster_path
                    ? `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZES.medium}${show.poster_path}`
                    : "/placeholder.svg?height=513&width=342"

                  const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : null

                  return (
                    <Link href={`/tv/${show.id}`} key={show.id}>
                      <Card className="overflow-hidden h-full transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                        <div className="aspect-[2/3] relative overflow-hidden">
                          <Image
                            src={imageUrl || "/placeholder.svg"}
                            alt={show.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <p className="text-white font-medium line-clamp-2">{show.name}</p>
                          </div>
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
            ) : (
              <div className="text-center py-12 animate-in fade-in-50 duration-300">
                <div className="mx-auto w-16 h-16 mb-4 text-muted-foreground">
                  <Tv className="w-full h-full" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No TV shows found</h2>
                <p className="text-muted-foreground mb-6">Try a different search term or browse our categories</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {query && !isLoading && (activeTab === "movies" ? movies.length > 0 : tvShows.length > 0) && (
        <div className="flex justify-between items-center mt-8">
          <Button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            variant="outline"
            className="transition-transform hover:-translate-x-1"
          >
            Previous
          </Button>

          <span className="text-muted-foreground">
            Page {currentPage} of {currentTotalPages}
          </span>

          <Button
            onClick={handleNextPage}
            disabled={currentPage === currentTotalPages}
            variant="outline"
            className="transition-transform hover:translate-x-1"
          >
            Next
          </Button>
        </div>
      )}

      {!query && (
        <div className="text-center py-16 animate-in fade-in-50 duration-300">
          <div className="mx-auto w-20 h-20 mb-6 text-muted-foreground">
            <Search className="w-full h-full" />
          </div>
          <h2 className="text-2xl font-semibold mb-3">Search for movies and TV shows</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Enter a search term in the search bar above to find your favorite movies and TV shows
          </p>
        </div>
      )}
    </div>
  )
}
