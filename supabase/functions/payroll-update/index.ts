import { z } from '../_shared/validation.ts';
import { getAdminClient } from '../_shared/supabase-client.ts';
import {
  dispatchNotification,
  NotificationPayload,
} from '../_shared/notification.ts';
import { corsResponse, errorResponse, corsHeaders } from '../_shared/cors.ts';

const UpdatePayrollSchema = z.object({
  employee_id: z.string().uuid(),
  base_salary: z.number().min(0).optional(),
  allowances: z.number().min(0).optional(),
  deductions: z.number().min(0).optional(),
  currency: z.string().length(3).default('INR'),
  effective_from: z.string().optional(),
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

  const parsed = UpdatePayrollSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, 'VALIDATION_ERROR', 'Schema validation failed', {
      issues: parsed.error.issues,
    });
  }

  const data = parsed.data;

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

    const updateFields: Record<string, unknown> = {
      updated_by: callerId,
      updated_at: new Date().toISOString(),
    };
    if (data.base_salary !== undefined) updateFields.base_salary = data.base_salary;
    if (data.allowances !== undefined) updateFields.allowances = data.allowances;
    if (data.deductions !== undefined) updateFields.deductions = data.deductions;
    if (data.currency !== undefined) updateFields.currency = data.currency;
    if (data.effective_from !== undefined) updateFields.effective_from = data.effective_from;

    const { data: existing } = await admin
      .from('payroll')
      .select('id')
      .eq('employee_id', data.employee_id)
      .eq('org_id', callerProfile.org_id)   // ensure the record belongs to the caller's org
      .maybeSingle();

    let result;
    if (existing) {
      result = await admin
        .from('payroll')
        .update(updateFields)
        .eq('employee_id', data.employee_id)
        .select()
        .single();
    } else {
      result = await admin
        .from('payroll')
        .insert({
          org_id: callerProfile.org_id,
          employee_id: data.employee_id,
          ...updateFields,
        })
        .select()
        .single();
    }

    if (result.error) {
      return errorResponse(500, 'PAYROLL_UPDATE_FAILED', result.error.message);
    }

    await admin.from('audit_log').insert({
      org_id: callerProfile.org_id,
      actor_id: callerId,
      table_name: 'payroll',
      record_id: result.data.id,
      action: 'payroll_update',
      new_data: result.data,
    });

    const notificationPayload: NotificationPayload = {
      org_id: callerProfile.org_id,
      user_id: data.employee_id,
      type: 'payroll_update',
      title: 'Payroll updated',
      message: 'Your payroll details have been updated.',
    };
    await dispatchNotification(admin, notificationPayload);

    return corsResponse(200, { ok: true, payroll: result.data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse(500, 'INTERNAL_ERROR', message);
  }
}
