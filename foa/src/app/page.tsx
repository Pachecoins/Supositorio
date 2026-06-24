import Link from 'next/link';
import { listJobs } from '@/lib/db/jobs';
import { listWorkers } from '@/lib/db/workers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { JobStatusBadge } from '@/components/ui/Badge';
import { JOB_STATUS_LABELS } from '@/lib/types';
import { formatDate, formatTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const ACTIVE_STATUSES = ['offered', 'accepted', 'scheduled', 'reminder_sent', 'en_route', 'arrived', 'in_progress'];

export default async function DashboardPage() {
  const [jobs, workers] = await Promise.all([listJobs(), listWorkers()]);

  const activeJobs = jobs.filter((j) => ACTIVE_STATUSES.includes(j.status));
  const needsAttention = jobs.filter((j) => j.status === 'needs_admin_attention' || j.status === 'blocked');
  const completedJobs = jobs.filter((j) => j.status === 'completed');
  const availableWorkers = workers.filter((w) => w.status === 'available');
  const upcomingJobs = jobs
    .filter((j) => j.scheduled_date && !['completed', 'cancelled', 'rejected'].includes(j.status))
    .sort((a, b) => (a.scheduled_date ?? '').localeCompare(b.scheduled_date ?? ''))
    .slice(0, 5);

  return (
    <div>
      <div className="border-b border-border px-8 py-6">
        <h1 className="text-lg font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Estado general de las operaciones de campo.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 px-8 py-6 lg:grid-cols-4">
        <Stat label="Trabajos activos" value={activeJobs.length} />
        <Stat label="Necesitan atención" value={needsAttention.length} highlight={needsAttention.length > 0} />
        <Stat label="Completados" value={completedJobs.length} />
        <Stat label="Trabajadores disponibles" value={availableWorkers.length} />
      </div>

      <div className="grid grid-cols-1 gap-6 px-8 pb-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Alertas operativas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {needsAttention.length === 0 && <p className="text-sm text-zinc-500">No hay alertas activas.</p>}
            {needsAttention.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="flex items-center justify-between rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2 hover:border-red-500/40"
              >
                <div>
                  <div className="text-sm font-medium text-white">{job.title}</div>
                  <div className="text-xs text-zinc-500">{job.worker?.name ?? 'Sin asignar'}</div>
                </div>
                <JobStatusBadge status={job.status} label={JOB_STATUS_LABELS[job.status]} />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos trabajos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingJobs.length === 0 && <p className="text-sm text-zinc-500">No hay trabajos próximos programados.</p>}
            {upcomingJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 hover:border-accent"
              >
                <div>
                  <div className="text-sm font-medium text-white">{job.title}</div>
                  <div className="text-xs text-zinc-500">
                    {formatDate(job.scheduled_date)} {formatTime(job.scheduled_time)} · {job.worker?.name ?? 'Sin asignar'}
                  </div>
                </div>
                <JobStatusBadge status={job.status} label={JOB_STATUS_LABELS[job.status]} />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-panel px-5 py-4">
      <div className={`text-2xl font-semibold ${highlight ? 'text-red-400' : 'text-white'}`}>{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{label}</div>
    </div>
  );
}
