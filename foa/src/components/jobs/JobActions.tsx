'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import type { JobStatus } from '@/lib/types';
import {
  escalateProblemAction,
  markAcceptedAction,
  markCompletedAction,
  requestArrivalAction,
  requestFinalPhotoAction,
  requestProgressAction,
  sendJobOfferAction,
  sendReminderAction,
} from '@/app/jobs/actions';

export function JobActions({ jobId, status, hasWorker }: { jobId: string; status: JobStatus; hasWorker: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [escalating, setEscalating] = useState(false);
  const [reason, setReason] = useState('');

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" disabled={!hasWorker || isPending} onClick={() => run(() => sendJobOfferAction(jobId))}>
        Ofrecer trabajo
      </Button>
      <Button variant="secondary" disabled={!hasWorker || isPending} onClick={() => run(() => markAcceptedAction(jobId))}>
        Marcar aceptado
      </Button>
      <Button variant="secondary" disabled={!hasWorker || isPending} onClick={() => run(() => sendReminderAction(jobId))}>
        Enviar recordatorio
      </Button>
      <Button variant="secondary" disabled={!hasWorker || isPending} onClick={() => run(() => requestArrivalAction(jobId))}>
        Pedir llegada
      </Button>
      <Button variant="secondary" disabled={!hasWorker || isPending} onClick={() => run(() => requestProgressAction(jobId))}>
        Pedir avance
      </Button>
      <Button variant="secondary" disabled={!hasWorker || isPending} onClick={() => run(() => requestFinalPhotoAction(jobId))}>
        Pedir foto final
      </Button>
      <Button
        variant="secondary"
        disabled={status === 'completed' || isPending}
        onClick={() => run(() => markCompletedAction(jobId))}
      >
        Marcar completado
      </Button>

      {!escalating ? (
        <Button variant="danger" disabled={isPending} onClick={() => setEscalating(true)}>
          Escalar problema
        </Button>
      ) : (
        <div className="flex w-full items-center gap-2 pt-2">
          <Input
            placeholder="Motivo del escalamiento"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="max-w-sm"
          />
          <Button
            variant="danger"
            disabled={isPending}
            onClick={() =>
              run(async () => {
                await escalateProblemAction(jobId, reason);
                setEscalating(false);
                setReason('');
              })
            }
          >
            Confirmar
          </Button>
          <Button variant="ghost" onClick={() => setEscalating(false)}>
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
}
