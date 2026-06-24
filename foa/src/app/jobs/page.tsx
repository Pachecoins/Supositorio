import Link from 'next/link';
import { listJobs } from '@/lib/db/jobs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { JobStatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { JOB_STATUS_LABELS } from '@/lib/types';
import { formatDate, formatTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const PRIORITY_LABELS = { low: 'Baja', normal: 'Normal', high: 'Alta', urgent: 'Urgente' };

export default async function JobsPage() {
  const jobs = await listJobs();

  return (
    <div>
      <PageHeader
        title="Trabajos"
        description="Todos los trabajos de campo, programados y en curso."
        actions={
          <Link href="/jobs/new">
            <Button>+ Nuevo trabajo</Button>
          </Link>
        }
      />

      <div className="px-8 py-6">
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-panel2 text-left text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Trabajador</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Prioridad</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-panel2/50">
                  <td className="px-4 py-3">
                    <Link href={`/jobs/${job.id}`} className="font-medium text-white hover:text-accent">
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{job.client?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-400">{job.worker?.name ?? 'Sin asignar'}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {formatDate(job.scheduled_date)} {formatTime(job.scheduled_time)}
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={job.priority} label={PRIORITY_LABELS[job.priority]} />
                  </td>
                  <td className="px-4 py-3">
                    <JobStatusBadge status={job.status} label={JOB_STATUS_LABELS[job.status]} />
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    Todavía no hay trabajos creados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
