import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a browser client that properly handles session persistence
// This uses cookies for session storage which works better with Next.js SSR
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

