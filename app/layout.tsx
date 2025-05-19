import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { Film } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CineShift - Browse Movies",
  description: "Browse and discover movies from TMDb",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="py-8 border-t">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="flex items-center gap-2 mb-4 md:mb-0">
                    <Film className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      CineShift
                    </span>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-sm text-muted-foreground mb-2">
                      This product uses the TMDb API but is not endorsed or certified by TMDb.
                    </p>
                    <p className="text-sm font-medium">Developed by Vihanga Fernando</p>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
