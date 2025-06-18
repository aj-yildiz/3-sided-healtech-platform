import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
// import { cookies } from "next/headers"

// Check if the required environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is required")
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required")
}

// Create a singleton for the client-side Supabase client
let clientInstance: ReturnType<typeof createClient<Database>> | null = null

// Create a single supabase client for the browser
export const createClientComponentClient = () => {
  if (clientInstance) return clientInstance

  try {
    clientInstance = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      },
    )

    return clientInstance
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    // Create a minimal client that will show errors properly
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "fallback-key",
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      },
    )
  }
}

// Create a single supabase client for server components
export const createServerComponentClient = () => {
  const cookieStore = cookies()
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

// Create a single supabase admin client for server actions
export const createServerActionClient = (options?: { cookies: () => ReturnType<typeof cookies> }) => {
  const cookieStore = options?.cookies ? options.cookies() : cookies()

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: { path: string; maxAge: number; domain?: string }) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: { path: string; domain?: string }) {
        cookieStore.set({ name, value: "", ...options, maxAge: 0 })
      },
    },
  })
}
