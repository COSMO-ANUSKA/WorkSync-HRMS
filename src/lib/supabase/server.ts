import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const isDummy = cookieStore.get('worksync-dummy-auth')?.value === 'true'

  if (isDummy) {
    return createDummyServerClient()
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return createDemoServerClient()
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

function createDummyServerClient() {
  const dummyUser = {
    id: 'dummy-user-id-0000-000000000000',
    email: 'dummyopen00@gmail.com',
    role: 'authenticated',
    aud: 'authenticated',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { role: 'admin' },
    created_at: new Date().toISOString(),
  }

  const noopQuery = {
    select() { return noopQuery; },
    insert() { return noopQuery; },
    update() { return noopQuery; },
    delete() { return noopQuery; },
    eq() { return noopQuery; },
    in() { return noopQuery; },
    order() { return noopQuery; },
    range() { return noopQuery; },
    limit() { return noopQuery; },
    ilike() { return noopQuery; },
    maybeSingle: async () => ({ data: { id: 'dummy-user-id-0000-000000000000', email: 'dummyopen00@gmail.com', role: 'admin' }, error: null }),
    single: async () => ({ data: { id: 'dummy-user-id-0000-000000000000', email: 'dummyopen00@gmail.com', role: 'admin' }, error: null }),
  } as any

  return {
    auth: {
      async getUser() { return { data: { user: dummyUser }, error: null }; },
      async signInWithPassword() { return { data: { user: dummyUser, session: { access_token: 'dummy', user: dummyUser } }, error: null }; },
      async signUp() { return { data: { user: dummyUser, session: { access_token: 'dummy', user: dummyUser } }, error: null }; },
      async signOut() { return { data: null, error: null }; },
    },
    from() { return noopQuery; },
    rpc: async () => ({ data: null, error: null }),
    functions: { invoke: async () => ({ data: { ok: true }, error: null }) },
  } as unknown as ReturnType<typeof createServerClient>;
}

function createDemoServerClient() {
  return {
    auth: {
      async getUser() { return { data: { user: null }, error: null }; },
      async signInWithPassword() { return { data: { user: null, session: null }, error: null }; },
      async signUp() { return { data: { user: null, session: null }, error: null }; },
      async signOut() { return { data: null, error: null }; },
    },
  } as unknown as ReturnType<typeof createServerClient>;
}
