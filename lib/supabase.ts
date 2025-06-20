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

console.log('[Supabase] URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('[Supabase] ANON KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

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
  // Only import cookies on server side
  if (typeof window !== 'undefined') {
    throw new Error('createServerComponentClient should only be used on server side')
  }
  
  try {
    const { cookies } = require('next/headers')
    const cookieStore = cookies()
    return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })
  } catch (error) {
    console.error('Error creating server component client:', error)
    // Fallback to basic client
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
}

// Create a single supabase admin client for server actions
export const createServerActionClient = (options?: { cookies: () => any }) => {
  // Only import cookies on server side
  if (typeof window !== 'undefined') {
    throw new Error('createServerActionClient should only be used on server side')
  }
  
  try {
    const { cookies } = require('next/headers')
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
  } catch (error) {
    console.error('Error creating server action client:', error)
    // Fallback to basic client
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
}
