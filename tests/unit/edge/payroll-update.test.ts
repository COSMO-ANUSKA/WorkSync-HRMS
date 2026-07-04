import { describe, it, expect } from 'vitest';

describe('payroll-update Edge Function', () => {
  it('rejects non-POST methods', async () => {
    const mod = await import(
      '../../../supabase/functions/payroll-update/index.ts'
    );
    const res = await mod.default(new Request('http://localhost', { method: 'GET' }));
    expect(res.status).toBe(405);
    const body = await res.json();
    expect(body.error.code).toBe('METHOD_NOT_ALLOWED');
  });

  it('returns 401 without Authorization header', async () => {
    const mod = await import(
      '../../../supabase/functions/payroll-update/index.ts'
    );
    const res = await mod.default(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ employee_id: '12345678-1234-1234-1234-123456789012' }),
      })
    );
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 400 for invalid body', async () => {
    const mod = await import(
      '../../../supabase/functions/payroll-update/index.ts'
    );
    const res = await mod.default(
      new Request('http://localhost', {
        method: 'POST',
        headers: { Authorization: 'Bearer test-jwt' },
        body: JSON.stringify({ base_salary: 'not-a-number' }),
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
