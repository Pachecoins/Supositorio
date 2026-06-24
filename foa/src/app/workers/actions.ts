'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createWorker } from '@/lib/db/workers';

export async function createWorkerAction(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const zone = String(formData.get('zone') ?? '').trim();
  const skillsRaw = String(formData.get('skills') ?? '').trim();
  const availability = String(formData.get('availability') ?? '').trim();
  const rateRaw = String(formData.get('rate') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();

  if (!name || !phone || !zone) {
    throw new Error('Nombre, teléfono y zona son obligatorios.');
  }

  const skills = skillsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  await createWorker({
    name,
    phone,
    zone,
    skills,
    availability: availability || null,
    rate: rateRaw ? Number(rateRaw) : null,
    notes: notes || null,
  });

  revalidatePath('/workers');
  redirect('/workers');
}
