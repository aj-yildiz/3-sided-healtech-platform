"use client"

import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"

export function LoadingScreen() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const authData = useAuth()
      setLoading(authData.loading)
    } catch (error) {
      // If useAuth throws an error (not in context), set loading to false
      setLoading(false)
    }
  }, [])

  if (!loading) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-lg font-medium">Loading...</p>
      </div>
    </div>
  )
}
