'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Field';
import type { Worker } from '@/lib/types';
import { assignWorkerAction } from '@/app/jobs/actions';

export function AssignWorkerForm({ jobId, workers }: { jobId: string; workers: Worker[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex items-center gap-2"
      action={(formData: FormData) => {
        const workerId = String(formData.get('worker_id') ?? '');
        if (!workerId) return;
        startTransition(() => assignWorkerAction(jobId, workerId));
      }}
    >
      <Select name="worker_id" defaultValue="" required className="max-w-xs">
        <option value="" disabled>
          Seleccioná un trabajador
        </option>
        {workers.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name} · {w.zone}
          </option>
        ))}
      </Select>
      <Button type="submit" disabled={isPending}>
        Asignar
      </Button>
    </form>
  );
}
