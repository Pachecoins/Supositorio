import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { JobUpdate, JobUpdateType, WorkerIntent } from '@/lib/types';

export async function listJobUpdates(jobId: string): Promise<JobUpdate[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('job_updates')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as JobUpdate[];
}

export interface CreateJobUpdateInput {
  job_id: string;
  worker_id?: string | null;
  type: JobUpdateType;
  content?: string | null;
  media_url?: string | null;
  detected_intent?: WorkerIntent | null;
}

export async function createJobUpdate(input: CreateJobUpdateInput): Promise<JobUpdate> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('job_updates')
    .insert({
      job_id: input.job_id,
      worker_id: input.worker_id ?? null,
      type: input.type,
      content: input.content ?? null,
      media_url: input.media_url ?? null,
      detected_intent: input.detected_intent ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as JobUpdate;
}
