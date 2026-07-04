import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';

describe.skipIf(!SUPABASE_ANON_KEY)('auth flow integration', () => {
  let client: SupabaseClient;

  beforeAll(() => {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  });

  it('rejects unauthenticated attendance select', async () => {
    const { error } = await client.from('attendance').select('*');
    expect(error).toBeTruthy();
  });

  it('rejects unauthenticated leave request create', async () => {
    const { error } = await client.from('leave_requests').insert({
      employee_id: '00000000-0000-0000-0000-000000000001',
      org_id: '00000000-0000-0000-0000-000000000001',
      leave_type: 'casual',
      start_date: '2026-01-01',
      end_date: '2026-01-02',
      reason: 'test',
    });
    expect(error).toBeTruthy();
  });

  it('rejects unauthenticated payroll select', async () => {
    const { error } = await client.from('payroll').select('*');
    expect(error).toBeTruthy();
  });
});
