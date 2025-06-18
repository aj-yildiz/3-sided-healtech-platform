"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type UserRole } from "@/contexts/auth-context"

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { userRole, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!userRole) {
        router.push("/login")
      } else if (!allowedRoles.includes(userRole)) {
        // Redirect to the appropriate dashboard based on role
        switch (userRole) {
          case "admin":
            router.push("/admin/dashboard")
            break
          case "doctor":
            router.push("/doctor/dashboard")
            break
          case "gym":
            router.push("/gym/dashboard")
            break
          case "patient":
            router.push("/patient/dashboard")
            break
          default:
            router.push("/")
        }
      }
    }
  }, [userRole, loading, router, allowedRoles])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return null
  }

  return <>{children}</>
}
