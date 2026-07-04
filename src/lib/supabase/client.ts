import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Mock client for UI-only build without backend env vars
    return {
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
      from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null }) }) }) })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export const supabase = createClient()
