"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Film, Menu, X, ChevronDown, Tv } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import SearchBar from "@/components/search-bar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mainGenres = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
]

const genreCategories = [
  {
    name: "Popular Genres",
    genres: [
      { id: 12, name: "Adventure", icon: "🌄" },
      { id: 16, name: "Animation", icon: "🎬" },
      { id: 14, name: "Fantasy", icon: "🧙" },
      { id: 878, name: "Science Fiction", icon: "🚀" },
    ],
  },
  {
    name: "Specialized Genres",
    genres: [
      { id: 80, name: "Crime", icon: "🔍" },
      { id: 99, name: "Documentary", icon: "📽️" },
      { id: 36, name: "History", icon: "📜" },
      { id: 10402, name: "Music", icon: "🎵" },
    ],
  },
  {
    name: "More Genres",
    genres: [
      { id: 9648, name: "Mystery", icon: "🔎" },
      { id: 53, name: "Thriller", icon: "😱" },
      { id: 10752, name: "War", icon: "⚔️" },
      { id: 37, name: "Western", icon: "🤠" },
    ],
  },
]

export default function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center ml-4 md:ml-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
          <Film className="h-6 w-6 transition-transform group-hover:rotate-12 duration-300" />
          <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">CineShift</span>
        </Link>

        <Button
          variant="ghost"
          className="ml-auto md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </Button>

        <nav
          className={cn(
            "md:flex items-center gap-6 md:ml-10",
            isMenuOpen
              ? "flex flex-col items-start gap-6 absolute inset-x-0 top-16 bg-background border-b px-6 py-8 w-full max-h-[calc(100vh-4rem)] overflow-y-auto md:static md:flex-row md:items-center md:border-0 md:p-0 md:bg-transparent md:max-h-none md:overflow-visible animate-in slide-in-from-top-5 duration-300 ease-out"
              : "hidden"
          )}
        >
          <Link
            href="/"
            className={cn(
              "text-base md:text-sm font-medium transition-colors hover:text-primary relative group py-2",
              pathname === "/"
                ? "text-primary after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:bg-primary"
                : "text-muted-foreground",
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            <span>Home</span>
            <span className="absolute bottom-[-4px] left-0 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>

          {mainGenres.map((genre) => (
            <Link
              key={genre.id}
              href={`/category/${genre.id}`}
              className={cn(
                "text-base md:text-sm font-medium transition-colors hover:text-primary relative group py-2",
                pathname === `/category/${genre.id}`
                  ? "text-primary after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:bg-primary"
                  : "text-muted-foreground",
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              <span>{genre.name}</span>
              <span className="absolute bottom-[-4px] left-0 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}

          <Link
            href="/tv"
            className={cn(
              "text-base md:text-sm font-medium transition-colors hover:text-primary relative group flex items-center py-2",
              pathname === "/tv"
                ? "text-primary after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:bg-primary"
                : "text-muted-foreground",
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            <Tv className="h-4 w-4 md:h-3.5 md:w-3.5 mr-2" />
            <span>TV Shows</span>
            <span className="absolute bottom-[-4px] left-0 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-base md:text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-2 py-2"
              >
                <span>Explore</span>
                <ChevronDown className="h-5 w-5 md:h-4 md:w-4 transition-transform group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="bottom"
              className="w-[220px] p-3 max-h-[calc(100vh-8rem)] overflow-y-auto md:max-h-none md:overflow-visible"
            >
              {genreCategories.map((category, index) => (
                <div key={category.name}>
                  {index > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuLabel className="text-base md:text-sm font-semibold">{category.name}</DropdownMenuLabel>
                  {category.genres.map((genre) => (
                    <DropdownMenuItem key={genre.id} asChild className="cursor-pointer text-base md:text-sm py-2">
                      <Link href={`/category/${genre.id}`} className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                        <span className="mr-3">{genre.icon}</span>
                        {genre.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center mr-4 md:mr-0 md:ml-6">
          <SearchBar />
        </div>
      </div>
    </header>
  )
}