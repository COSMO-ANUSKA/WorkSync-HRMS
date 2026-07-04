import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('send-notification Edge Function', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('rejects non-POST methods', async () => {
    const mod = await import(
      '../../../supabase/functions/send-notification/index.ts'
    );
    const res = await mod.default(new Request('http://localhost', { method: 'GET' }));
    expect(res.status).toBe(405);
    const body = await res.json();
    expect(body.error.code).toBe('METHOD_NOT_ALLOWED');
  });

  it('returns 400 for invalid JSON', async () => {
    const mod = await import(
      '../../../supabase/functions/send-notification/index.ts'
    );
    const res = await mod.default(
      new Request('http://localhost', {
        method: 'POST',
        headers: { Authorization: 'Bearer mock-jwt' },
        body: 'not-json',
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('INVALID_JSON');
  });

  it('returns 400 for missing fields', async () => {
    const mod = await import(
      '../../../supabase/functions/send-notification/index.ts'
    );
    const res = await mod.default(
      new Request('http://localhost', {
        method: 'POST',
        headers: { Authorization: 'Bearer mock-jwt' },
        body: JSON.stringify({ org_id: 'bad' }),
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
