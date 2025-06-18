"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"

export type UserRole = "patient" | "doctor" | "gym" | "admin" | null

type UserProfile = {
  id: number
  name: string
  email: string
} | null

type AuthContextType = {
  user: User | null
  session: Session | null
  userRole: UserRole
  userProfile: UserProfile
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, role: UserRole) => Promise<{ error: any }>
  signOut: () => Promise<void>
  loading: boolean
  checkAccess: (allowedRoles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [userProfile, setUserProfile] = useState<UserProfile>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const setData = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        // Fetch user role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single()

        const role = (roleData?.role as UserRole) || null
        setUserRole(role)

        // Fetch user profile based on role
        if (role) {
          let profileData = null

          if (role === "patient") {
            const { data } = await supabase
              .from("patients")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .single()
            profileData = data
          } else if (role === "doctor") {
            const { data } = await supabase
              .from("doctors")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .single()
            profileData = data
          } else if (role === "gym") {
            const { data } = await supabase
              .from("gyms")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .single()
            profileData = data
          } else if (role === "admin") {
            const { data } = await supabase
              .from("admin")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .single()
            profileData = data
          }

          setUserProfile(profileData)
        }
      }

      setLoading(false)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        // Fetch user role when auth state changes
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single()

        const role = (roleData?.role as UserRole) || null
        setUserRole(role)

        // Fetch user profile based on role
        if (role) {
          let profileData = null

          if (role === "patient") {
            const { data } = await supabase
              .from("patients")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .single()
            profileData = data
          } else if (role === "doctor") {
            const { data } = await supabase
              .from("doctors")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .single()
            profileData = data
          } else if (role === "gym") {
            const { data } = await supabase
              .from("gyms")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .single()
            profileData = data
          } else if (role === "admin") {
            const { data } = await supabase
              .from("admin")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .single()
            profileData = data
          }

          setUserProfile(profileData)
        } else {
          setUserProfile(null)
        }
      } else {
        setUserRole(null)
        setUserProfile(null)
      }

      setLoading(false)
      router.refresh()
    })

    setData()

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { error }
  }

  const signUp = async (email: string, password: string, role: UserRole) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })

      if (error) {
        return { error }
      }

      if (!data.user) {
        return { error: new Error("Failed to create user") }
      }

      // Create user role entry
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: data.user.id,
        role: role as string,
      })

      if (roleError) {
        console.error("Error creating user role:", roleError)
        return { error: roleError }
      }

      return { error: null }
    } catch (err) {
      console.error("Error in signUp:", err)
      return { error: err as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const checkAccess = (allowedRoles: UserRole[]) => {
    return userRole ? allowedRoles.includes(userRole) : false
  }

  const value = {
    user,
    session,
    userRole,
    userProfile,
    signIn,
    signUp,
    signOut,
    loading,
    checkAccess,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
