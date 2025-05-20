import MovieCard from "@/components/movie-card"

interface Movie {
  id: number
  title: string
  poster_path: string | null
  vote_average: number
  release_date?: string
}

interface MovieGridProps {
  movies: Movie[]
  title?: string
}

export default function MovieGrid({ movies, title }: MovieGridProps) {
  return (
    <div className="space-y-4">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}

      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            posterPath={movie.poster_path}
            voteAverage={movie.vote_average}
            releaseDate={movie.release_date}
          />
        ))}
      </div>
    </div>
  )
}
