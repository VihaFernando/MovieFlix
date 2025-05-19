"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getTrendingMovies, getMoviesByMood } from "@/lib/tmdb"
import MovieGrid from "@/components/movie-grid"
import MoodFilter from "@/components/mood-filter"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw, TrendingUp, FlameIcon as Fire, Award, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  const [trendingMovies, setTrendingMovies] = useState<any[]>([])
  const [popularMovies, setPopularMovies] = useState<any[]>([])
  const [topRatedMovies, setTopRatedMovies] = useState<any[]>([])
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([])
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [moodMovies, setMoodMovies] = useState<any[]>([])
  const [loading, setLoading] = useState({
    trending: true,
    mood: false,
    popular: true,
    topRated: true,
    upcoming: true,
  })
  const [error, setError] = useState<string | null>(null)

  const fetchTrendingMovies = async () => {
    setLoading((prev) => ({ ...prev, trending: true }))
    setError(null)
    try {
      const data = await getTrendingMovies("day")
      setTrendingMovies(data.results)
    } catch (error) {
      console.error("Error fetching trending movies:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch trending movies")
    } finally {
      setLoading((prev) => ({ ...prev, trending: false }))
    }
  }

  const fetchMoodMovies = async (mood: string) => {
    if (!mood) return

    setLoading((prev) => ({ ...prev, mood: true }))
    try {
      const data = await getMoviesByMood(mood)
      setMoodMovies(data.results)
    } catch (error) {
      console.error(`Error fetching ${mood} movies:`, error)
    } finally {
      setLoading((prev) => ({ ...prev, mood: false }))
    }
  }

  const fetchAdditionalSections = async () => {
    try {
      // Fetch popular movies
      setLoading((prev) => ({ ...prev, popular: true }))
      const popularResponse = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US&page=1`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (popularResponse.ok) {
        const popularData = await popularResponse.json()
        setPopularMovies(popularData.results)
      }
      setLoading((prev) => ({ ...prev, popular: false }))

      // Fetch top rated movies
      setLoading((prev) => ({ ...prev, topRated: true }))
      const topRatedResponse = await fetch(
        `https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US&page=1`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (topRatedResponse.ok) {
        const topRatedData = await topRatedResponse.json()
        setTopRatedMovies(topRatedData.results)
      }
      setLoading((prev) => ({ ...prev, topRated: false }))

      // Fetch upcoming movies
      setLoading((prev) => ({ ...prev, upcoming: true }))
      const upcomingResponse = await fetch(
        `https://api.themoviedb.org/3/movie/upcoming?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US&page=1`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (upcomingResponse.ok) {
        const upcomingData = await upcomingResponse.json()
        setUpcomingMovies(upcomingData.results)
      }
      setLoading((prev) => ({ ...prev, upcoming: false }))
    } catch (error) {
      console.error("Error fetching additional sections:", error)
    }
  }

  useEffect(() => {
    fetchTrendingMovies()
    fetchAdditionalSections()
  }, [])

  useEffect(() => {
    if (selectedMood) {
      fetchMoodMovies(selectedMood)
    }
  }, [selectedMood])

  const handleMoodSelect = (mood: string | null) => {
    setSelectedMood(mood)
  }

  const renderMovieSection = (
    title: string,
    movies: any[],
    isLoading: boolean,
    icon: React.ReactNode,
    viewAllLink?: string,
  ) => (
    <section className="mb-12 animate-in fade-in-50 duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          {icon}
          <h2 className="text-2xl font-bold ml-2">{title}</h2>
        </div>
        {viewAllLink && (
          <Link href={viewAllLink}>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <Skeleton className="aspect-[2/3] w-full rounded-md" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.slice(0, 10).map((movie) => (
            <Link href={`/movie/${movie.id}`} key={movie.id}>
              <div className="overflow-hidden h-full transition-all duration-300 hover:scale-105 hover:shadow-lg group rounded-lg border bg-card text-card-foreground">
                <div className="aspect-[2/3] relative overflow-hidden">
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                        : "/placeholder.svg?height=513&width=342"
                    }
                    alt={movie.title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white font-medium line-clamp-2">{movie.title}</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-1">{movie.title}</h3>
                  <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                    {movie.release_date && <span>{new Date(movie.release_date).getFullYear()}</span>}
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
                      <span>{movie.vote_average.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center py-8 text-muted-foreground">No movies found.</p>
      )}
    </section>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-3xl font-bold mb-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
          {selectedMood ? `${selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)} Movies` : "Discover Movies"}
        </h1>

        <MoodFilter onMoodSelect={handleMoodSelect} selectedMood={selectedMood} />

        {error && (
          <Alert variant="destructive" className="mb-6 animate-in fade-in-50 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>{error}</p>
              <Button variant="outline" size="sm" className="w-fit" onClick={fetchTrendingMovies}>
                <RefreshCw className="mr-2 h-4 w-4" /> Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {selectedMood ? (
          loading.mood ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2 animate-pulse">
                  <Skeleton className="aspect-[2/3] w-full rounded-md" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : moodMovies.length > 0 ? (
            <div className="animate-in fade-in-50 duration-300">
              <MovieGrid movies={moodMovies} />
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No movies found for this mood. Try a different selection.
            </p>
          )
        ) : (
          renderMovieSection(
            "Trending Today",
            trendingMovies,
            loading.trending,
            <TrendingUp className="h-6 w-6 text-primary" />,
          )
        )}
      </section>

      {!selectedMood && (
        <>
          {renderMovieSection(
            "Popular Movies",
            popularMovies,
            loading.popular,
            <Fire className="h-6 w-6 text-orange-500" />,
            "/category/popular",
          )}

          {renderMovieSection(
            "Top Rated",
            topRatedMovies,
            loading.topRated,
            <Award className="h-6 w-6 text-yellow-500" />,
            "/category/top-rated",
          )}

          {renderMovieSection(
            "Coming Soon",
            upcomingMovies,
            loading.upcoming,
            <Clock className="h-6 w-6 text-blue-500" />,
            "/category/upcoming",
          )}
        </>
      )}
    </div>
  )
}
