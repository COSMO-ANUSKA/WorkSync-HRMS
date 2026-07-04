import { z } from '../_shared/validation.ts';
import { getAdminClient } from '../_shared/supabase-client.ts';
import { corsResponse, errorResponse, corsHeaders } from '../_shared/cors.ts';

const BulkActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('bulk_leave_approve'),
    request_ids: z.array(z.string().uuid()).min(1).max(100),
    review_comment: z.string().max(500).optional(),
  }),
  z.object({
    action: z.literal('report_dashboard'),
    org_id: z.string().uuid(),
  }),
]);

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

  const parsed = BulkActionSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, 'VALIDATION_ERROR', 'Schema validation failed', {
      issues: parsed.error.issues,
    });
  }

  try {
    const admin = getAdminClient();

    const { data: caller } = await admin.auth.getUser(jwt);
    const callerId = caller.user?.id;
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

    const data = parsed.data;

    if (data.action === 'bulk_leave_approve') {
      const { data: updated, error: updateErr } = await admin
        .from('leave_requests')
        .update({
          status: 'approved',
          reviewed_by: callerId,
          reviewed_at: new Date().toISOString(),
          review_comment: data.review_comment ?? null,
        })
        .in('id', data.request_ids)
        .eq('org_id', callerProfile.org_id)
        .eq('status', 'pending')          // only approve requests still awaiting review
        .select('id, employee_id, org_id');

      if (updateErr) {
        return errorResponse(500, 'BULK_APPROVE_FAILED', updateErr.message);
      }

      const notifications = (updated ?? []).map((row) => ({
        org_id: row.org_id,
        user_id: row.employee_id,
        type: 'leave_status_change',
        title: 'Leave request approved',
        message: 'Your leave request has been approved.',
      }));

      if (notifications.length > 0) {
        await admin.from('notifications').insert(notifications);
      }

      return corsResponse(200, { ok: true, approved: updated?.length ?? 0 });
    }

    if (data.action === 'report_dashboard') {
      const { data: stats, error: statsErr } = await admin.rpc(
        'get_dashboard_stats',
        { p_org_id: data.org_id }
      );

      if (statsErr) {
        return errorResponse(500, 'DASHBOARD_STATS_FAILED', statsErr.message);
      }

      return corsResponse(200, { ok: true, stats });
    }

    return errorResponse(400, 'UNKNOWN_ACTION', 'Unsupported action');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse(500, 'INTERNAL_ERROR', message);
  }
}
