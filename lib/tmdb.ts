// TMDb API configuration
const API_BASE_URL = "https://api.themoviedb.org/3"
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const API_READ_ACCESS_TOKEN = process.env.TMDB_API_READ_ACCESS_TOKEN

// Image URLs
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"
export const POSTER_SIZES = {
  small: "w185",
  medium: "w342",
  large: "w500",
  original: "original",
}

export const BACKDROP_SIZES = {
  small: "w300",
  medium: "w780",
  large: "w1280",
  original: "original",
}

export const PROFILE_SIZES = {
  small: "w45",
  medium: "w185",
  large: "h632",
  original: "original",
}

// Mood to genre mapping
export const MOOD_TO_GENRE = {
  happy: [35, 10751, 12], // Comedy, Family, Adventure
  sad: [18, 10749], // Drama, Romance
  scary: [27, 53, 9648], // Horror, Thriller, Mystery
  inspired: [36, 99, 28], // History, Documentary, Action
}

// Fetch options with authorization
const fetchOptions = {
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_READ_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
}

// API functions
export async function getTrendingMovies(timeWindow = "day") {
  try {
    const response = await fetch(
      `${API_BASE_URL}/trending/movie/${timeWindow}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("TMDb API Error:", errorData)
      throw new Error(`Failed to fetch trending movies: ${response.status} ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error in getTrendingMovies:", error)
    throw error
  }
}

export async function getMoviesByGenre(genreId: number, page = 1) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=${genreId}&page=${page}&language=en-US`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("TMDb API Error:", errorData)
      throw new Error(`Failed to fetch movies for genre ${genreId}: ${response.status} ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error(`Error in getMoviesByGenre for genre ${genreId}:`, error)
    throw error
  }
}

export async function getMoviesByMood(mood: string, page = 1) {
  try {
    const genreIds = MOOD_TO_GENRE[mood as keyof typeof MOOD_TO_GENRE]

    if (!genreIds) {
      throw new Error(`Invalid mood: ${mood}`)
    }

    const response = await fetch(
      `${API_BASE_URL}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=${genreIds.join(",")}&page=${page}&language=en-US`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("TMDb API Error:", errorData)
      throw new Error(`Failed to fetch movies for mood ${mood}: ${response.status} ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error(`Error in getMoviesByMood for mood ${mood}:`, error)
    throw error
  }
}

export async function getMovieDetails(movieId: number) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/movie/${movieId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&append_to_response=credits,videos&language=en-US`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("TMDb API Error:", errorData)
      throw new Error(`Failed to fetch details for movie ${movieId}: ${response.status} ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error(`Error in getMovieDetails for movie ${movieId}:`, error)
    throw error
  }
}

export async function getGenres() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/genre/movie/list?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("TMDb API Error:", errorData)
      throw new Error(`Failed to fetch genres: ${response.status} ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error in getGenres:", error)
    throw error
  }
}
