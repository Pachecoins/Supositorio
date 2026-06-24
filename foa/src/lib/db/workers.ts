import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Worker } from '@/lib/types';

export async function listWorkers(): Promise<Worker[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('workers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Worker[];
}

export async function getWorker(id: string): Promise<Worker | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('workers').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Worker | null;
}

export interface CreateWorkerInput {
  name: string;
  phone: string;
  zone: string;
  skills: string[];
  availability?: string | null;
  rate?: number | null;
  notes?: string | null;
}

export async function createWorker(input: CreateWorkerInput): Promise<Worker> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('workers')
    .insert({
      name: input.name,
      phone: input.phone,
      zone: input.zone,
      skills: input.skills,
      availability: input.availability ?? null,
      rate: input.rate ?? null,
      notes: input.notes ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as Worker;
}

export async function listAvailableWorkers(): Promise<Worker[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('workers').select('*').eq('status', 'available');
  if (error) throw error;
  return data as Worker[];
}
