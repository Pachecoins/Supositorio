import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Job, JobPriority, JobStatus, JobWithRelations, RequiredEvidence } from '@/lib/types';

const JOB_SELECT_WITH_RELATIONS = '*, client:clients(*), worker:workers(*)';

export async function listJobs(): Promise<JobWithRelations[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('jobs')
    .select(JOB_SELECT_WITH_RELATIONS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as JobWithRelations[];
}

export async function getJobWithRelations(id: string): Promise<JobWithRelations | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('jobs')
    .select(JOB_SELECT_WITH_RELATIONS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as JobWithRelations | null;
}

export interface CreateJobInput {
  title: string;
  description?: string | null;
  client_id: string;
  address: string;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  required_skills: string[];
  priority: JobPriority;
  required_evidence: RequiredEvidence[];
  admin_notes?: string | null;
}

export async function createJob(input: CreateJobInput): Promise<Job> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      title: input.title,
      description: input.description ?? null,
      client_id: input.client_id,
      address: input.address,
      scheduled_date: input.scheduled_date ?? null,
      scheduled_time: input.scheduled_time ?? null,
      required_skills: input.required_skills,
      priority: input.priority,
      required_evidence: input.required_evidence,
      admin_notes: input.admin_notes ?? null,
      status: 'draft' satisfies JobStatus,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as Job;
}

export async function assignWorkerToJob(jobId: string, workerId: string): Promise<Job> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('jobs')
    .update({ assigned_worker_id: workerId, status: 'scheduled' satisfies JobStatus })
    .eq('id', jobId)
    .select('*')
    .single();
  if (error) throw error;
  return data as Job;
}

export async function updateJobStatus(jobId: string, status: JobStatus): Promise<Job> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', jobId)
    .select('*')
    .single();
  if (error) throw error;
  return data as Job;
}
