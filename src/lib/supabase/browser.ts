import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return createDemoClient();
  }

  return createBrowserClient<Database>(url, anonKey);
}

function createDemoClient() {
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
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
  } as any;

  return {
    auth: {
      async getUser() { return { data: { user: null }, error: null }; },
      async signInWithPassword() { return { data: { user: null, session: null }, error: null }; },
      async signUp() { return { data: { user: null, session: null }, error: null }; },
      async signOut() { return { data: null, error: null }; },
    },
    from() { return noopQuery; },
    rpc: async () => ({ data: null, error: null }),
    functions: { invoke: async () => ({ data: { ok: true }, error: null }) },
  } as unknown as ReturnType<typeof createBrowserClient<Database>>;
}

export const supabase = createClient();
