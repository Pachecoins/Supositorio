import type { JobUpdate, JobUpdateType } from '@/lib/types';
import { cn, formatDateTime } from '@/lib/utils';

const TYPE_LABELS: Record<JobUpdateType, string> = {
  outbound_message: 'Mensaje enviado',
  inbound_message: 'Respuesta recibida',
  status_change: 'Cambio de estado',
  photo: 'Evidencia',
  issue: 'Problema',
  admin_note: 'Nota del administrador',
  ai_summary: 'Resumen IA',
  escalation: 'Escalamiento',
};

const TYPE_COLORS: Record<JobUpdateType, string> = {
  outbound_message: 'bg-blue-500',
  inbound_message: 'bg-zinc-400',
  status_change: 'bg-indigo-500',
  photo: 'bg-cyan-500',
  issue: 'bg-orange-500',
  admin_note: 'bg-zinc-500',
  ai_summary: 'bg-purple-500',
  escalation: 'bg-red-500',
};

export function JobTimeline({ updates }: { updates: JobUpdate[] }) {
  if (updates.length === 0) {
    return <p className="px-5 py-6 text-sm text-zinc-500">Todavía no hay eventos para este trabajo.</p>;
  }

  return (
    <ol className="relative space-y-4 px-5 py-5">
      {updates.map((update) => (
        <li key={update.id} className="relative flex gap-3 pl-1">
          <span className={cn('mt-1 h-2 w-2 flex-shrink-0 rounded-full', TYPE_COLORS[update.type])} />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">{TYPE_LABELS[update.type]}</span>
              <span className="text-xs text-zinc-600">{formatDateTime(update.created_at)}</span>
            </div>
            {update.content && <p className="mt-0.5 text-sm text-zinc-200">{update.content}</p>}
            {update.detected_intent && (
              <p className="mt-0.5 text-xs text-zinc-500">Intención detectada: {update.detected_intent}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
