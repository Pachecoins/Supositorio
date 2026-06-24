'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createJob } from '@/lib/db/jobs';
import type { JobPriority, RequiredEvidence } from '@/lib/types';

export async function createJobAction(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const client_id = String(formData.get('client_id') ?? '').trim();
  const address = String(formData.get('address') ?? '').trim();
  const scheduled_date = String(formData.get('scheduled_date') ?? '').trim();
  const scheduled_time = String(formData.get('scheduled_time') ?? '').trim();
  const skillsRaw = String(formData.get('required_skills') ?? '').trim();
  const priority = String(formData.get('priority') ?? 'normal') as JobPriority;
  const required_evidence = formData.getAll('required_evidence').map((v) => String(v)) as RequiredEvidence[];
  const admin_notes = String(formData.get('admin_notes') ?? '').trim();

  if (!title || !client_id || !address) {
    throw new Error('Título, cliente y dirección son obligatorios.');
  }

  const required_skills = skillsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const job = await createJob({
    title,
    description: description || null,
    client_id,
    address,
    scheduled_date: scheduled_date || null,
    scheduled_time: scheduled_time || null,
    required_skills,
    priority,
    required_evidence,
    admin_notes: admin_notes || null,
  });

  revalidatePath('/jobs');
  redirect(`/jobs/${job.id}`);
}
