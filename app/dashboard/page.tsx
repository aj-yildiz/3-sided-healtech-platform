"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Dashboard() {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login")
      } else if (userRole === "patient") {
        router.replace("/patient/dashboard")
      } else if (userRole === "doctor") {
        router.replace("/doctor/dashboard")
      } else if (userRole === "gym") {
        router.replace("/gym/dashboard")
      } else {
        router.replace("/login")
      }
    }
  }, [user, userRole, loading, router])

  return <div className="flex min-h-screen items-center justify-center text-lg">Loading your dashboard...</div>
} 