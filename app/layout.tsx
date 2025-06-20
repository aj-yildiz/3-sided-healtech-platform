import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../styles/globals.css"
import DebugClientWrapper from '@/components/DebugClientWrapper'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Vastis - Healthcare Platform",
  description: "Connect with healthcare providers at nearby gyms",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DebugClientWrapper>{children}</DebugClientWrapper>
      </body>
    </html>
  )
}
