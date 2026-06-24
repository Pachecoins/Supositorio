'use server';

import { revalidatePath } from 'next/cache';
import { interpretWorkerMessage } from '@/lib/agent/interpretWorkerMessage';
import {
  arrivalRequestMessage,
  closingRequestMessage,
  confirmationMessage,
  jobOfferMessage,
  progressRequestMessage,
  reminderMessage,
} from '@/lib/agent/templates';
import { createJobUpdate, listJobUpdates } from '@/lib/db/jobUpdates';
import { assignWorkerToJob, getJobWithRelations, updateJobStatus } from '@/lib/db/jobs';
import { createMessageLog } from '@/lib/db/messageLogs';
import type { JobStatus, JobWithRelations, RequiredEvidence } from '@/lib/types';

function jobPath(jobId: string) {
  return `/jobs/${jobId}`;
}

export async function assignWorkerAction(jobId: string, workerId: string) {
  await assignWorkerToJob(jobId, workerId);
  await createJobUpdate({ job_id: jobId, worker_id: workerId, type: 'admin_note', content: 'Trabajador asignado al trabajo.' });
  revalidatePath(jobPath(jobId));
}

async function requireAssignedJob(jobId: string): Promise<JobWithRelations> {
  const job = await getJobWithRelations(jobId);
  if (!job) throw new Error('Trabajo no encontrado');
  if (!job.worker) throw new Error('El trabajo no tiene un trabajador asignado');
  return job;
}

async function sendOutbound(jobId: string, workerId: string, content: string) {
  await createMessageLog({ job_id: jobId, worker_id: workerId, direction: 'outbound', content });
  await createJobUpdate({ job_id: jobId, worker_id: workerId, type: 'outbound_message', content });
}

// ── Admin actions (buttons on the job detail page) ─────────────────────────

export async function sendJobOfferAction(jobId: string) {
  const job = await requireAssignedJob(jobId);
  const message = jobOfferMessage(job.worker!, job);
  await sendOutbound(jobId, job.worker!.id, message);
  await updateJobStatus(jobId, 'offered');
  revalidatePath(jobPath(jobId));
}

export async function markAcceptedAction(jobId: string) {
  const job = await requireAssignedJob(jobId);
  const message = confirmationMessage(job.worker!, job);
  await sendOutbound(jobId, job.worker!.id, message);
  await updateJobStatus(jobId, 'accepted');
  await createJobUpdate({ job_id: jobId, worker_id: job.worker!.id, type: 'status_change', content: 'Trabajo aceptado manualmente por el administrador.' });
  revalidatePath(jobPath(jobId));
}

export async function sendReminderAction(jobId: string) {
  const job = await requireAssignedJob(jobId);
  const message = reminderMessage(job.worker!, job);
  await sendOutbound(jobId, job.worker!.id, message);
  await updateJobStatus(jobId, 'reminder_sent');
  revalidatePath(jobPath(jobId));
}

export async function requestArrivalAction(jobId: string) {
  const job = await requireAssignedJob(jobId);
  await sendOutbound(jobId, job.worker!.id, arrivalRequestMessage());
  revalidatePath(jobPath(jobId));
}

export async function requestProgressAction(jobId: string) {
  const job = await requireAssignedJob(jobId);
  await sendOutbound(jobId, job.worker!.id, progressRequestMessage());
  revalidatePath(jobPath(jobId));
}

export async function requestFinalPhotoAction(jobId: string) {
  const job = await requireAssignedJob(jobId);
  await sendOutbound(jobId, job.worker!.id, closingRequestMessage());
  revalidatePath(jobPath(jobId));
}

export async function markCompletedAction(jobId: string) {
  await updateJobStatus(jobId, 'completed');
  await createJobUpdate({ job_id: jobId, type: 'status_change', content: 'Trabajo marcado como completado manualmente por el administrador.' });
  revalidatePath(jobPath(jobId));
}

export async function escalateProblemAction(jobId: string, reason: string) {
  await updateJobStatus(jobId, 'needs_admin_attention');
  await createJobUpdate({ job_id: jobId, type: 'escalation', content: reason || 'Escalado manualmente por el administrador.' });
  revalidatePath(jobPath(jobId));
}

// ── WhatsApp Simulator: worker reply → AI interpretation → state update ────

const EVIDENCE_ORDER: RequiredEvidence[] = ['arrival_photo', 'progress_photo', 'final_photo'];

async function getCollectedEvidence(jobId: string, required: RequiredEvidence[]): Promise<RequiredEvidence[]> {
  const updates = await listJobUpdates(jobId);
  const photoCount = updates.filter((u) => u.type === 'photo').length;
  const orderedRequired = EVIDENCE_ORDER.filter((e) => required.includes(e));
  return orderedRequired.slice(0, photoCount);
}

export async function simulateWorkerReplyAction(jobId: string, message: string) {
  const trimmed = message.trim();
  if (!trimmed) return;

  const job = await requireAssignedJob(jobId);
  const worker = job.worker!;

  await createMessageLog({ job_id: jobId, worker_id: worker.id, direction: 'inbound', content: trimmed });

  const collectedEvidence = await getCollectedEvidence(jobId, job.required_evidence);

  const interpreted = await interpretWorkerMessage(trimmed, {
    jobTitle: job.title,
    currentStatus: job.status,
    requiredEvidence: job.required_evidence,
    collectedEvidence,
    workerName: worker.name,
  });

  await createJobUpdate({
    job_id: jobId,
    worker_id: worker.id,
    type: 'inbound_message',
    content: trimmed,
    detected_intent: interpreted.intent,
  });

  if (interpreted.intent === 'sends_photo') {
    const nextEvidence = EVIDENCE_ORDER.filter((e) => job.required_evidence.includes(e))[collectedEvidence.length];
    await createJobUpdate({
      job_id: jobId,
      worker_id: worker.id,
      type: 'photo',
      content: nextEvidence ? `Evidencia recibida: ${nextEvidence}` : 'Foto recibida',
      media_url: '/evidence/simulated-photo.jpg',
    });
  }

  await createJobUpdate({
    job_id: jobId,
    worker_id: worker.id,
    type: 'ai_summary',
    content: interpreted.summary_for_admin,
  });

  let finalStatus: JobStatus | null = interpreted.suggested_job_status;

  if (interpreted.should_escalate) {
    finalStatus = 'needs_admin_attention';
    await createJobUpdate({
      job_id: jobId,
      worker_id: worker.id,
      type: 'escalation',
      content: interpreted.escalation_reason ?? 'El agente detectó que este trabajo requiere atención del administrador.',
    });
  }

  if (finalStatus && finalStatus !== job.status) {
    await updateJobStatus(jobId, finalStatus);
    await createJobUpdate({
      job_id: jobId,
      worker_id: worker.id,
      type: 'status_change',
      content: `Estado actualizado automáticamente a "${finalStatus}".`,
    });
  }

  if (interpreted.suggested_reply) {
    await sendOutbound(jobId, worker.id, interpreted.suggested_reply);
  }

  revalidatePath(jobPath(jobId));
}
