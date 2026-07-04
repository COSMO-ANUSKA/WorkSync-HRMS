import { SupabaseClient } from '@supabase/supabase-js';

export interface NotificationPayload {
  org_id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
}

export interface NotificationChannel {
  send(payload: NotificationPayload): Promise<void>;
}

export class InAppNotificationChannel implements NotificationChannel {
  constructor(private admin: SupabaseClient) {}

  async send(payload: NotificationPayload): Promise<void> {
    const { error } = await this.admin.from('notifications').insert({
      org_id: payload.org_id,
      user_id: payload.user_id,
      type: payload.type,
      title: payload.title,
      message: payload.message,
    });

    if (error) {
      throw new Error(`Failed to write in-app notification: ${error.message}`);
    }
  }
}

export async function dispatchNotification(
  admin: SupabaseClient,
  payload: NotificationPayload,
  channel: NotificationChannel = new InAppNotificationChannel(admin)
): Promise<void> {
  await channel.send(payload);
}
