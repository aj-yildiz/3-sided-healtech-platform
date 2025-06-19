import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../styles/globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { ClientLayoutWrapper } from "@/components/client-layout-wrapper"
import { Toaster } from "@/components/ui/toaster"

console.log('App mounted');
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Vastis - Physiotherapy Booking Platform",
  description: "Book physiotherapy appointments at nearby gyms",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
