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
    console.log('[AuthProvider] useEffect START');

    const setData = async () => {
      console.log('[AuthProvider] setData called');
      // Debug log for typeof window before getSession
      console.log('[AuthProvider] typeof window before getSession:', typeof window);
      // Before getSession
      console.log('[AuthProvider] before getSession');
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('[AuthProvider] after getSession', session, error);
      if (error) {
        console.error('[AuthProvider] getSession error:', error);
        setLoading(false);
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch user role
        console.log('[AuthProvider]');
        console.log('[AuthProvider] typeof window (setData):', typeof window);
        console.log('[AuthProvider] before fetch user_roles');
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Supabase query timeout')), 5000)
        );
        const { data: roleData, error: roleError } = await Promise.race([
          supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .maybeSingle(),
          timeout,
        ]);
        console.log('[AuthProvider] after fetch user_roles', roleData, roleError);
        if (roleError) {
          console.error('[AuthProvider] user_roles error:', roleError);
        }
        const role = (roleData?.role as UserRole) || null;
        setUserRole(role);
        console.log('[AuthProvider] userRole:', role);
        // Fetch user profile based on role
        if (role) {
          let profileData = null;
          if (role === "patient") {
            console.log('[AuthProvider] before fetch patients');
            const { data, error } = await supabase
              .from("patients")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .maybeSingle();
            console.log('[AuthProvider] after fetch patients', data, error);
            if (error) console.error('[AuthProvider] patients error:', error);
            profileData = data;
          } else if (role === "doctor") {
            console.log('[AuthProvider] before fetch doctors');
            const { data, error } = await supabase
              .from("doctors")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .maybeSingle();
            console.log('[AuthProvider] after fetch doctors', data, error);
            if (error) console.error('[AuthProvider] doctors error:', error);
            profileData = data;
          } else if (role === "gym") {
            console.log('[AuthProvider] before fetch gyms');
            const { data, error } = await supabase
              .from("gyms")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .maybeSingle();
            console.log('[AuthProvider] after fetch gyms', data, error);
            if (error) console.error('[AuthProvider] gyms error:', error);
            profileData = data;
          } else if (role === "admin") {
            console.log('[AuthProvider] before fetch admin');
            const { data, error } = await supabase
              .from("admin")
              .select("id, name, email")
              .eq("user_id", session.user.id)
              .maybeSingle();
            console.log('[AuthProvider] after fetch admin', data, error);
            if (error) console.error('[AuthProvider] admin error:', error);
            profileData = data;
          }
          setUserProfile(profileData);
          console.log('[AuthProvider] userProfile:', profileData);
        }
      }
      setLoading(false);
      console.log('[AuthProvider] setLoading(false)');
      // Debug logs
      console.log('[AuthProvider] user:', session?.user ?? null);
      console.log('[AuthProvider] userRole:', session?.user ? (await supabase.from("user_roles").select("role").eq("user_id", session.user.id).maybeSingle()).data?.role : null);
      console.log('[AuthProvider] userProfile:', session?.user ? (await supabase.from("patients").select("id, name, email").eq("user_id", session.user.id).maybeSingle()).data : null);
      console.log('[AuthProvider] loading:', false);
    };

    // Add a log before calling setData
    console.log('[AuthProvider] before setData');
    setData().then(() => {
      console.log('[AuthProvider] setData finished');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[AuthProvider] onAuthStateChange event:', _event, session);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('[AuthProvider] typeof window (onAuthStateChange):', typeof window);
        console.log('[AuthProvider] before fetch user_roles (onAuthStateChange)');
        
        try {
          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .single();
            
          console.log('[AuthProvider] after fetch user_roles (onAuthStateChange)', roleData, roleError);
          
          if (roleError) {
            console.error('[AuthProvider] user_roles error:', roleError);
            // If no role found, set to null and continue
            setUserRole(null);
            setUserProfile(null);
            setLoading(false);
            return;
          }
          
          const role = (roleData?.role as UserRole) || null;
          setUserRole(role);
          console.log('[AuthProvider] userRole:', role);
          
          if (role) {
            let profileData = null;
            if (role === "patient") {
              console.log('[AuthProvider] before fetch patients (onAuthStateChange)');
              const { data, error } = await supabase
                .from("patients")
                .select("id, name, email")
                .eq("user_id", session.user.id)
                .single();
              console.log('[AuthProvider] after fetch patients (onAuthStateChange)', data, error);
              if (error) {
                console.error('[AuthProvider] patients error:', error);
                // Create patient record if it doesn't exist
                if (error.code === 'PGRST116') {
                  const { data: newPatient } = await supabase
                    .from("patients")
                    .insert({
                      user_id: session.user.id,
                      name: session.user.email || '',
                      email: session.user.email || ''
                    })
                    .select("id, name, email")
                    .single();
                  profileData = newPatient;
                }
              } else {
                profileData = data;
              }
            } else if (role === "doctor") {
              console.log('[AuthProvider] before fetch doctors (onAuthStateChange)');
              const { data, error } = await supabase
                .from("doctors")
                .select("id, name, email")
                .eq("user_id", session.user.id)
                .single();
              console.log('[AuthProvider] after fetch doctors (onAuthStateChange)', data, error);
              if (error) {
                console.error('[AuthProvider] doctors error:', error);
                if (error.code === 'PGRST116') {
                  const { data: newDoctor } = await supabase
                    .from("doctors")
                    .insert({
                      user_id: session.user.id,
                      name: session.user.email || '',
                      email: session.user.email || '',
                      specialization: ''
                    })
                    .select("id, name, email")
                    .single();
                  profileData = newDoctor;
                }
              } else {
                profileData = data;
              }
            } else if (role === "gym") {
              console.log('[AuthProvider] before fetch gyms (onAuthStateChange)');
              const { data, error } = await supabase
                .from("gyms")
                .select("id, name, email")
                .eq("user_id", session.user.id)
                .single();
              console.log('[AuthProvider] after fetch gyms (onAuthStateChange)', data, error);
              if (error) {
                console.error('[AuthProvider] gyms error:', error);
                if (error.code === 'PGRST116') {
                  const { data: newGym } = await supabase
                    .from("gyms")
                    .insert({
                      user_id: session.user.id,
                      name: session.user.email || '',
                      email: session.user.email || '',
                      address: ''
                    })
                    .select("id, name, email")
                    .single();
                  profileData = newGym;
                }
              } else {
                profileData = data;
              }
            } else if (role === "admin") {
              console.log('[AuthProvider] before fetch admin (onAuthStateChange)');
              const { data, error } = await supabase
                .from("admin")
                .select("id, name, email")
                .eq("user_id", session.user.id)
                .single();
              console.log('[AuthProvider] after fetch admin (onAuthStateChange)', data, error);
              if (error) console.error('[AuthProvider] admin error:', error);
              profileData = data;
            }
            setUserProfile(profileData);
            console.log('[AuthProvider] userProfile:', profileData);
          } else {
            setUserProfile(null);
          }
        } catch (error) {
          console.error('[AuthProvider] Error in auth state change:', error);
          setUserRole(null);
          setUserProfile(null);
        }
      } else {
        setUserRole(null);
        setUserProfile(null);
      }
      setLoading(false);
      console.log('[AuthProvider] setLoading(false) from onAuthStateChange');
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
      console.log('[AuthProvider] unsubscribed');
    };
  }, [router, supabase]);

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
