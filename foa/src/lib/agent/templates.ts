import type { Job, Worker } from '@/lib/types';
import { formatDate, formatTime } from '@/lib/utils';

// FOA — FieldOpsAgent
// WhatsApp message templates. Pure string functions, no side effects —
// easy to swap for real WhatsApp Cloud API message templates later.

export function jobOfferMessage(worker: Worker, job: Job): string {
  return (
    `Hola ${worker.name}. Tenemos un trabajo disponible para vos: ${job.title} ` +
    `en ${job.address}, el día ${formatDate(job.scheduled_date)} a las ${formatTime(job.scheduled_time)}. ` +
    `Tareas: ${job.description ?? 'sin detalle adicional'}. Respondé ACEPTAR o RECHAZAR.`
  );
}

export function confirmationMessage(worker: Worker, job: Job): string {
  return `Perfecto, ${worker.name}. Quedás asignado al trabajo: ${job.title}. Te vamos a recordar antes del horario.`;
}

export function reminderMessage(worker: Worker, job: Job): string {
  return (
    `Hola ${worker.name}, recordatorio del trabajo de hoy: ${job.title} a las ` +
    `${formatTime(job.scheduled_time)} en ${job.address}. Cuando estés en camino, respondé EN CAMINO.`
  );
}

export function arrivalRequestMessage(): string {
  return 'Cuando llegues al lugar, respondé LLEGUÉ y mandá una foto de llegada.';
}

export function progressRequestMessage(): string {
  return '¿Cómo viene el trabajo? Mandá una foto del avance o contanos si hay algún problema.';
}

export function closingRequestMessage(): string {
  return 'Para cerrar el trabajo, mandá fotos finales y confirmá si quedó terminado.';
}

export function issueAckMessage(): string {
  return 'Entendido. Ya aviso al administrador. Contame brevemente qué pasó y si necesitás algo para poder continuar.';
}
