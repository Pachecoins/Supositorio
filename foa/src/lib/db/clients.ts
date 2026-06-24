import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Client } from '@/lib/types';

export async function listClients(): Promise<Client[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Client[];
}

export async function getClient(id: string): Promise<Client | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Client | null;
}

export interface CreateClientInput {
  name: string;
  phone: string;
  address: string;
  notes?: string | null;
}

export async function createClient(input: CreateClientInput): Promise<Client> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('clients')
    .insert({
      name: input.name,
      phone: input.phone,
      address: input.address,
      notes: input.notes ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as Client;
}
