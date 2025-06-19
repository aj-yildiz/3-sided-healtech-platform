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
    console.log('[AuthProvider] useEffect start, loading:', loading)
    const setData = async () => {
      console.log('[AuthProvider] setData called')
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error) {
        console.error('[AuthProvider] getSession error:', error)
        setLoading(false)
        return
      }
      console.log('[AuthProvider] session:', session)
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        // Fetch user role
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single()
        if (roleError) {
          console.error('[AuthProvider] user_roles error:', roleError)
        }
        const role = (roleData?.role as UserRole) || null
        setUserRole(role)
        console.log('[AuthProvider] userRole:', role)

        // Fetch user profile based on role
        if (role) {
          let profileData = null
          if (role === "patient") {
            const { data, error } = await supabase
              .from("patients")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .single()
            if (error) console.error('[AuthProvider] patients error:', error)
            profileData = data
          } else if (role === "doctor") {
            const { data, error } = await supabase
              .from("doctors")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .single()
            if (error) console.error('[AuthProvider] doctors error:', error)
            profileData = data
          } else if (role === "gym") {
            const { data, error } = await supabase
              .from("gyms")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .single()
            if (error) console.error('[AuthProvider] gyms error:', error)
            profileData = data
          } else if (role === "admin") {
            const { data, error } = await supabase
              .from("admin")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .single()
            if (error) console.error('[AuthProvider] admin error:', error)
            profileData = data
          }
          setUserProfile(profileData)
          console.log('[AuthProvider] userProfile:', profileData)
        }
      }
      setLoading(false)
      console.log('[AuthProvider] setLoading(false)')
      // Debug logs
      console.log('[AuthProvider] user:', session?.user ?? null)
      console.log('[AuthProvider] userRole:', role)
      console.log('[AuthProvider] userProfile:', profileData)
      console.log('[AuthProvider] loading:', loading)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[AuthProvider] onAuthStateChange event:', _event, session)
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single()
        if (roleError) {
          console.error('[AuthProvider] user_roles error:', roleError)
        }
        const role = (roleData?.role as UserRole) || null
        setUserRole(role)
        console.log('[AuthProvider] userRole:', role)
        if (role) {
          let profileData = null
          if (role === "patient") {
            const { data, error } = await supabase
              .from("patients")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .single()
            if (error) console.error('[AuthProvider] patients error:', error)
            profileData = data
          } else if (role === "doctor") {
            const { data, error } = await supabase
              .from("doctors")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .single()
            if (error) console.error('[AuthProvider] doctors error:', error)
            profileData = data
          } else if (role === "gym") {
            const { data, error } = await supabase
              .from("gyms")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .single()
            if (error) console.error('[AuthProvider] gyms error:', error)
            profileData = data
          } else if (role === "admin") {
            const { data, error } = await supabase
              .from("admin")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .single()
            if (error) console.error('[AuthProvider] admin error:', error)
            profileData = data
          }
          setUserProfile(profileData)
          console.log('[AuthProvider] userProfile:', profileData)
        } else {
          setUserProfile(null)
        }
      } else {
        setUserRole(null)
        setUserProfile(null)
      }
      setLoading(false)
      console.log('[AuthProvider] setLoading(false) from onAuthStateChange')
      router.refresh()
      // Debug logs
      console.log('[AuthProvider] user:', session?.user ?? null)
      console.log('[AuthProvider] userRole:', role)
      console.log('[AuthProvider] userProfile:', profileData)
      console.log('[AuthProvider] loading:', loading)
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

      if (error || !data.user) {
        return { error: error || new Error("Failed to create user") }
      }

      const userId = data.user.id

      // 1. Insert role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: role as string,
      })

      if (roleError) {
        return { error: roleError }
      }

      // 2. Insert into role-specific table
      if (role === "patient") {
        await supabase.from("patients").insert({
          user_id: userId,
          email: email,
          name: "",
        })
      } else if (role === "doctor") {
        await supabase.from("doctors").insert({
          user_id: userId,
          email: email,
          name: "",
          specialization: "",
        })
      } else if (role === "gym") {
        await supabase.from("gyms").insert({
          user_id: userId,
          email: email,
          name: "",
          address: "",
        })
      }

      return { error: null }
    } catch (err) {
      console.error("Error in signUp:", err)
      return { error: err as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setUserRole(null)
    setUserProfile(null)
    setLoading(false)
    // Force a hard reload to clear any cached state
    window.location.href = "/"
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
