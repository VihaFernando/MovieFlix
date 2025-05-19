"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Calendar,
  Star,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  User,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { TMDB_IMAGE_BASE_URL, POSTER_SIZES, BACKDROP_SIZES } from "@/lib/tmdb"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

interface TvShowDetailsPageProps {
  params: {
    id: string
  }
}

export default function TvShowDetailsPage({ params }: TvShowDetailsPageProps) {
  const [show, setShow] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [similarShows, setSimilarShows] = useState<any[]>([])
  const [selectedPerson, setSelectedPerson] = useState<any>(null)
  const [personShows, setPersonShows] = useState<any[]>([])
  const [personLoading, setPersonLoading] = useState(false)
  const [showAllCast, setShowAllCast] = useState(false)

  const fetchTvShowDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch TV show details
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${params.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&append_to_response=credits,videos&language=en-US`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch TV show details: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setShow(data)

      // Fetch similar TV shows
      const similarResponse = await fetch(
        `https://api.themoviedb.org/3/tv/${params.id}/similar?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US&page=1`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (similarResponse.ok) {
        const similarData = await similarResponse.json()
        setSimilarShows(similarData.results.slice(0, 10))
      }
    } catch (error) {
      console.error("Error fetching TV show details:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch TV show details")
    } finally {
      setLoading(false)
    }
  }

  const fetchPersonDetails = async (personId: number) => {
    setPersonLoading(true)
    try {
      // Fetch person details
      const personResponse = await fetch(
        `https://api.themoviedb.org/3/person/${personId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (personResponse.ok) {
        const personData = await personResponse.json()
        setSelectedPerson(personData)
      }

      // Fetch person TV shows
      const creditsResponse = await fetch(
        `https://api.themoviedb.org/3/person/${personId}/tv_credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (creditsResponse.ok) {
        const creditsData = await creditsResponse.json()
        setPersonShows(creditsData.cast.slice(0, 12))
      }
    } catch (error) {
      console.error("Error fetching person details:", error)
    } finally {
      setPersonLoading(false)
    }
  }

  useEffect(() => {
    fetchTvShowDetails()
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-[450px] rounded-lg" />
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="outline" className="mb-6 group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Button>
        </Link>

        <Alert variant="destructive" className="mb-6 animate-in fade-in-50 duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button variant="outline" size="sm" className="w-fit" onClick={fetchTvShowDetails}>
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!show) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">TV show not found</h1>
        <Link href="/">
          <Button className="mt-4 group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Button>
        </Link>
      </div>
    )
  }

  const backdropUrl = show.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/${BACKDROP_SIZES.large}${show.backdrop_path}` : null

  const posterUrl = show.poster_path
    ? `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZES.large}${show.poster_path}`
    : "/placeholder.svg?height=750&width=500"

  const trailer = show.videos?.results.find((video: any) => video.type === "Trailer" && video.site === "YouTube")

  // Filter to only include actors (not crew)
  const cast =
    show.credits?.cast?.filter(
      (person: any) =>
        person.known_for_department === "Acting" ||
        person.department === "Acting" ||
        person.job === "Actor" ||
        person.job === "Actress",
    ) || []

  // Initial display count and whether we need a "View More" button
  const initialCastCount = 12
  const hasMoreCast = cast.length > initialCastCount
  const displayedCast = showAllCast ? cast : cast.slice(0, initialCastCount)

  return (
    <>
      {backdropUrl && (
        <div className="relative h-[400px] w-full">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
          <Image src={backdropUrl || "/placeholder.svg"} alt={show.name} fill className="object-cover" priority />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 relative z-20">
        <Link href="/">
          <Button variant="outline" className="mb-6 group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative aspect-[2/3] md:aspect-auto md:h-auto rounded-lg overflow-hidden shadow-lg animate-in fade-in-50 slide-in-from-left-5 duration-500">
            <Image
              src={posterUrl || "/placeholder.svg"}
              alt={show.name}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>

          <div className="md:col-span-2 animate-in fade-in-50 slide-in-from-right-5 duration-500">
            <h1 className="text-3xl font-bold mb-2">{show.name}</h1>

            {show.tagline && <p className="text-xl italic text-muted-foreground mb-4">{show.tagline}</p>}

            <div className="flex flex-wrap gap-2 mb-4">
              {show.genres.map((genre: any) => (
                <Badge
                  key={genre.id}
                  variant="secondary"
                  className="transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {genre.name}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
              {show.first_air_date && (
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {new Date(show.first_air_date).toLocaleDateString()}
                </div>
              )}

              {show.number_of_seasons && (
                <div className="flex items-center">
                  <span className="font-medium">
                    {show.number_of_seasons} {show.number_of_seasons === 1 ? "Season" : "Seasons"}
                  </span>
                </div>
              )}

              <div className="flex items-center">
                <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                {show.vote_average.toFixed(1)} ({show.vote_count} votes)
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              <p className="text-muted-foreground">{show.overview}</p>
            </div>

            {trailer && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Trailer</h2>
                <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    title={`${show.name} Trailer`}
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cast Section */}
        {displayedCast.length > 0 && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Cast</h2>
              {hasMoreCast && (
                <Button
                  variant="outline"
                  onClick={() => setShowAllCast(!showAllCast)}
                  className="flex items-center gap-1"
                >
                  {showAllCast ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      View All Cast ({cast.length})
                    </>
                  )}
                </Button>
              )}
            </div>

            <div
              className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 ${showAllCast ? "" : "mb-4"}`}
            >
              {displayedCast.map((person: any) => {
                const profileUrl = person.profile_path
                  ? `${TMDB_IMAGE_BASE_URL}/w185${person.profile_path}`
                  : "/placeholder.svg?height=278&width=185"

                return (
                  <div
                    key={person.id}
                    className="text-center cursor-pointer group"
                    onClick={() => fetchPersonDetails(person.id)}
                  >
                    <div className="aspect-[2/3] relative mb-2 rounded-lg overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-105">
                      <Image
                        src={profileUrl || "/placeholder.svg"}
                        alt={person.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <User className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <p className="font-medium line-clamp-1 group-hover:text-primary transition-colors">{person.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{person.character}</p>
                  </div>
                )
              })}
            </div>

            {hasMoreCast && !showAllCast && (
              <div className="flex justify-center mt-4 mb-8">
                <Button variant="outline" onClick={() => setShowAllCast(true)} className="flex items-center gap-1">
                  <ChevronDown className="h-4 w-4" />
                  View All Cast ({cast.length})
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Seasons Section */}
        {show.seasons?.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Seasons</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {show.seasons
                .filter((season: any) => season.season_number > 0)
                .map((season: any) => {
                  const seasonPosterUrl = season.poster_path
                    ? `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZES.medium}${season.poster_path}`
                    : posterUrl || "/placeholder.svg?height=513&width=342"

                  return (
                    <Card key={season.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                      <div className="flex flex-col h-full">
                        <div className="aspect-[2/3] relative">
                          <Image
                            src={seasonPosterUrl || "/placeholder.svg"}
                            alt={`${show.name} - ${season.name}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        </div>
                        <CardContent className="p-4 flex-1 flex flex-col">
                          <h3 className="font-semibold">{season.name}</h3>
                          <div className="text-sm text-muted-foreground mt-1 mb-2">
                            {season.episode_count} episodes
                            {season.air_date && ` • ${new Date(season.air_date).getFullYear()}`}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                            {season.overview || `Season ${season.season_number} of ${show.name}`}
                          </p>
                        </CardContent>
                      </div>
                    </Card>
                  )
                })}
            </div>
          </div>
        )}

        {/* Similar Shows Section */}
        {similarShows.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Similar TV Shows</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {similarShows.map((show) => {
                const imageUrl = show.poster_path
                  ? `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZES.medium}${show.poster_path}`
                  : "/placeholder.svg?height=513&width=342"

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
                          {show.first_air_date && <span>{new Date(show.first_air_date).getFullYear()}</span>}
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                            <span>{show.vote_average.toFixed(1)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Person Modal */}
        {selectedPerson && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-background p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">{selectedPerson.name}</h2>
                <Button variant="ghost" size="icon" onClick={() => setSelectedPerson(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {personLoading ? (
                <div className="p-6 flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p>Loading...</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-lg mb-4">
                        <Image
                          src={
                            selectedPerson.profile_path
                              ? `${TMDB_IMAGE_BASE_URL}/w342${selectedPerson.profile_path}`
                              : "/placeholder.svg?height=513&width=342"
                          }
                          alt={selectedPerson.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-2">
                        {selectedPerson.birthday && (
                          <p className="text-sm">
                            <span className="font-semibold">Born:</span>{" "}
                            {new Date(selectedPerson.birthday).toLocaleDateString()}
                            {selectedPerson.place_of_birth && ` in ${selectedPerson.place_of_birth}`}
                          </p>
                        )}
                        {selectedPerson.known_for_department && (
                          <p className="text-sm">
                            <span className="font-semibold">Known for:</span> {selectedPerson.known_for_department}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <Tabs defaultValue="bio">
                        <TabsList className="mb-4">
                          <TabsTrigger value="bio">Biography</TabsTrigger>
                          <TabsTrigger value="shows">TV Shows</TabsTrigger>
                        </TabsList>

                        <TabsContent value="bio" className="space-y-4">
                          {selectedPerson.biography ? (
                            <p className="text-muted-foreground">{selectedPerson.biography}</p>
                          ) : (
                            <p className="text-muted-foreground">No biography available.</p>
                          )}
                        </TabsContent>

                        <TabsContent value="shows">
                          {personShows.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {personShows.map((show) => {
                                const imageUrl = show.poster_path
                                  ? `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZES.small}${show.poster_path}`
                                  : "/placeholder.svg?height=278&width=185"

                                return (
                                  <Link href={`/tv/${show.id}`} key={show.id} onClick={() => setSelectedPerson(null)}>
                                    <Card className="overflow-hidden h-full transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                      <div className="flex">
                                        <div className="w-1/3 relative">
                                          <Image
                                            src={imageUrl || "/placeholder.svg"}
                                            alt={show.name}
                                            width={92}
                                            height={138}
                                            className="object-cover h-full"
                                          />
                                        </div>
                                        <CardContent className="p-3 w-2/3">
                                          <h3 className="font-semibold line-clamp-1 text-sm">{show.name}</h3>
                                          <p className="text-xs text-muted-foreground line-clamp-1">
                                            {show.character && `as ${show.character}`}
                                          </p>
                                          {show.first_air_date && (
                                            <p className="text-xs mt-1">
                                              {new Date(show.first_air_date).getFullYear()}
                                            </p>
                                          )}
                                        </CardContent>
                                      </div>
                                    </Card>
                                  </Link>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No TV shows available.</p>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
