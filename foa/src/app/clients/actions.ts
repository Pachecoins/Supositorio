'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/db/clients';

export async function createClientAction(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const address = String(formData.get('address') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();

  if (!name || !phone || !address) {
    throw new Error('Nombre, teléfono y dirección son obligatorios.');
  }

  await createClient({ name, phone, address, notes: notes || null });

  revalidatePath('/clients');
  redirect('/clients');
}
