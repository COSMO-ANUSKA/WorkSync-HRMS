import { z } from '../_shared/validation.ts';
import { getAdminClient } from '../_shared/supabase-client.ts';
import {
  dispatchNotification,
  NotificationPayload,
} from '../_shared/notification.ts';
import { corsResponse, errorResponse, corsHeaders } from '../_shared/cors.ts';

const SendNotificationSchema = z.object({
  org_id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
});

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return errorResponse(405, 'METHOD_NOT_ALLOWED', 'Use POST');
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return errorResponse(401, 'UNAUTHORIZED', 'Missing Authorization header');
  }
  const jwt = authHeader.split(' ')[1] ?? '';
  if (!jwt) {
    return errorResponse(401, 'UNAUTHORIZED', 'Malformed Authorization header');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'INVALID_JSON', 'Request body must be JSON');
  }

  const parsed = SendNotificationSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, 'VALIDATION_ERROR', 'Schema validation failed', {
      issues: parsed.error.issues,
    });
  }

  const payload: NotificationPayload = parsed.data;

  try {
    const admin = getAdminClient();

    // Verify the caller is a valid authenticated admin
    const { data: caller } = await admin.auth.getUser(jwt);
    const callerId = caller.data?.user?.id;
    if (!callerId) {
      return errorResponse(401, 'UNAUTHORIZED', 'Invalid token');
    }

    const { data: callerProfile, error: callerErr } = await admin
      .from('profiles')
      .select('org_id, role')
      .eq('id', callerId)
      .single();

    if (callerErr || !callerProfile) {
      return errorResponse(403, 'FORBIDDEN', 'No profile for caller');
    }
    if (callerProfile.role !== 'admin') {
      return errorResponse(403, 'FORBIDDEN', 'Admin privileges required');
    }

    await dispatchNotification(admin, payload);
    return corsResponse(200, { ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse(500, 'NOTIFICATION_DISPATCH_FAILED', message);
  }
}
