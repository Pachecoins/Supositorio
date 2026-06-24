import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { MessageChannel, MessageDirection, MessageLog } from '@/lib/types';

export async function listMessageLogs(jobId: string): Promise<MessageLog[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('message_logs')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as MessageLog[];
}

export interface CreateMessageLogInput {
  job_id: string;
  worker_id?: string | null;
  direction: MessageDirection;
  channel?: MessageChannel;
  content: string;
  raw_payload?: Record<string, unknown> | null;
}

export async function createMessageLog(input: CreateMessageLogInput): Promise<MessageLog> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('message_logs')
    .insert({
      job_id: input.job_id,
      worker_id: input.worker_id ?? null,
      direction: input.direction,
      channel: input.channel ?? 'whatsapp_simulator',
      content: input.content,
      raw_payload: input.raw_payload ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as MessageLog;
}
