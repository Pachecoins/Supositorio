import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getWorker } from '@/lib/db/workers';
import { listJobs } from '@/lib/db/jobs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { JobStatusBadge, WorkerStatusBadge } from '@/components/ui/Badge';
import { JOB_STATUS_LABELS, WORKER_STATUS_LABELS } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function WorkerDetailPage({ params }: { params: { id: string } }) {
  const worker = await getWorker(params.id);
  if (!worker) notFound();

  const allJobs = await listJobs();
  const jobs = allJobs.filter((j) => j.assigned_worker_id === worker.id);

  return (
    <div>
      <PageHeader
        title={worker.name}
        description={`${worker.zone} · ${worker.phone}`}
        actions={<WorkerStatusBadge status={worker.status} label={WORKER_STATUS_LABELS[worker.status]} />}
      />

      <div className="grid grid-cols-1 gap-6 px-8 py-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Skills" value={worker.skills.join(', ') || '—'} />
            <Row label="Disponibilidad" value={worker.availability ?? '—'} />
            <Row label="Tarifa" value={worker.rate ? `$${worker.rate}` : '—'} />
            <Row label="Trust score" value={`${(worker.trust_score * 100).toFixed(0)}%`} />
            <Row label="Notas" value={worker.notes ?? '—'} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Trabajos asignados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-panel2 text-left text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Trabajo</th>
                  <th className="px-4 py-3">Fecha</th>
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
                    <td className="px-4 py-3 text-zinc-400">{formatDate(job.scheduled_date)}</td>
                    <td className="px-4 py-3">
                      <JobStatusBadge status={job.status} label={JOB_STATUS_LABELS[job.status]} />
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                      Este trabajador no tiene trabajos asignados todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right text-zinc-200">{value}</span>
    </div>
  );
}
