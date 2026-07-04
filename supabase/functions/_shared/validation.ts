import { z } from 'https://deno.land/x/zod@v3.23.4/mod.ts';

export { z };

export function parseBody<T>(
  body: unknown,
  schema: z.ZodType<T>
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
