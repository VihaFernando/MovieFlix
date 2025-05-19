"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, X, Loader2, Film, Tv } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useClickAway } from "@/hooks/use-click-away"
import Image from "next/image"
import Link from "next/link"
import { TMDB_IMAGE_BASE_URL, POSTER_SIZES } from "@/lib/tmdb"

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<{
    movies: any[]
    tvShows: any[]
  }>({
    movies: [],
    tvShows: [],
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useClickAway(searchContainerRef, () => {
    if (isOpen && query.length === 0) {
      setIsOpen(false)
    }
    setShowSuggestions(false)
  })

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Don't search if query is too short
    if (query.length < 2) {
      setSuggestions({ movies: [], tvShows: [] })
      setShowSuggestions(false)
      return
    }

    // Set a new timeout to debounce the search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true)
      setShowSuggestions(true)

      try {
        // Search for movies
        const movieResponse = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1&language=en-US`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        // Search for TV shows
        const tvResponse = await fetch(
          `https://api.themoviedb.org/3/search/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1&language=en-US`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        if (movieResponse.ok && tvResponse.ok) {
          const movieData = await movieResponse.json()
          const tvData = await tvResponse.json()

          setSuggestions({
            movies: movieData.results.slice(0, 3),
            tvShows: tvData.results.slice(0, 3),
          })
        }
      } catch (error) {
        console.error("Error fetching search suggestions:", error)
      } finally {
        setIsLoading(false)
      }
    }, 500) // 500ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsLoading(true)
      setShowSuggestions(false)
      router.push(`/search?query=${encodeURIComponent(query.trim())}`)
      // Reset loading after navigation
      setTimeout(() => setIsLoading(false), 500)
    }
  }

  const hasSuggestions = suggestions.movies.length > 0 || suggestions.tvShows.length > 0

  return (
    <div ref={searchContainerRef} className="relative">
      {!isOpen ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Open search"
        >
          <Search className="h-5 w-5" />
        </Button>
      ) : (
        <form onSubmit={handleSearch} className="flex items-center">
          <div className="relative">
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search movies & TV shows..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-[200px] md:w-[300px] pr-8 animate-in fade-in slide-in-from-top-5 duration-300"
              onFocus={() => {
                if (query.length >= 2) {
                  setShowSuggestions(true)
                }
              }}
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full w-8 p-0"
                onClick={() => {
                  setQuery("")
                  setSuggestions({ movies: [], tvShows: [] })
                }}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-[400px] overflow-auto animate-in fade-in-50 slide-in-from-top-2 duration-200">
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Searching...</span>
                  </div>
                ) : hasSuggestions ? (
                  <>
                    {suggestions.movies.length > 0 && (
                      <div className="p-2">
                        <div className="flex items-center px-2 py-1.5 text-sm font-medium text-muted-foreground">
                          <Film className="h-4 w-4 mr-2" />
                          Movies
                        </div>
                        {suggestions.movies.map((movie) => (
                          <Link
                            key={movie.id}
                            href={`/movie/${movie.id}`}
                            className="flex items-center p-2 hover:bg-accent rounded-md transition-colors"
                            onClick={() => {
                              setShowSuggestions(false)
                              setIsOpen(false)
                            }}
                          >
                            <div className="w-10 h-15 relative flex-shrink-0 rounded overflow-hidden">
                              <Image
                                src={
                                  movie.poster_path
                                    ? `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZES.small}${movie.poster_path}`
                                    : "/placeholder.svg?height=60&width=40"
                                }
                                alt={movie.title}
                                width={40}
                                height={60}
                                className="object-cover"
                              />
                            </div>
                            <div className="ml-3 flex-1 overflow-hidden">
                              <p className="font-medium truncate">{movie.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {movie.release_date ? new Date(movie.release_date).getFullYear() : "Unknown year"}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {suggestions.tvShows.length > 0 && (
                      <div className="p-2 border-t">
                        <div className="flex items-center px-2 py-1.5 text-sm font-medium text-muted-foreground">
                          <Tv className="h-4 w-4 mr-2" />
                          TV Shows
                        </div>
                        {suggestions.tvShows.map((show) => (
                          <Link
                            key={show.id}
                            href={`/tv/${show.id}`}
                            className="flex items-center p-2 hover:bg-accent rounded-md transition-colors"
                            onClick={() => {
                              setShowSuggestions(false)
                              setIsOpen(false)
                            }}
                          >
                            <div className="w-10 h-15 relative flex-shrink-0 rounded overflow-hidden">
                              <Image
                                src={
                                  show.poster_path
                                    ? `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZES.small}${show.poster_path}`
                                    : "/placeholder.svg?height=60&width=40"
                                }
                                alt={show.name}
                                width={40}
                                height={60}
                                className="object-cover"
                              />
                            </div>
                            <div className="ml-3 flex-1 overflow-hidden">
                              <p className="font-medium truncate">{show.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {show.first_air_date ? new Date(show.first_air_date).getFullYear() : "Unknown year"}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    <div className="p-2 border-t">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-primary"
                        size="sm"
                        onClick={handleSearch}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        View all results for "{query}"
                      </Button>
                    </div>
                  </>
                ) : query.length >= 2 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>No results found for "{query}"</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          <Button type="submit" variant="ghost" size="icon" disabled={isLoading || !query.trim()} className="ml-1">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          </Button>
        </form>
      )}
    </div>
  )
}
