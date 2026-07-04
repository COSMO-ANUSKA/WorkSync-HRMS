import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';

describe.skipIf(!SUPABASE_ANON_KEY)('notification flow integration', () => {
  let client: SupabaseClient;

  beforeAll(() => {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  });

  it('rejects anonymous notification reads', async () => {
    const { error } = await client.from('notifications').select('*');
    expect(error).toBeTruthy();
  });

  it('rejects anonymous audit log reads', async () => {
    const { error } = await client.from('audit_log').select('*');
    expect(error).toBeTruthy();
  });
});
