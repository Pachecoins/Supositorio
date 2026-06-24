import { notFound } from 'next/navigation';
import { getJobWithRelations } from '@/lib/db/jobs';
import { listJobUpdates } from '@/lib/db/jobUpdates';
import { listMessageLogs } from '@/lib/db/messageLogs';
import { listAvailableWorkers } from '@/lib/db/workers';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { JobStatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { EVIDENCE_LABELS, JOB_STATUS_LABELS } from '@/lib/types';
import { formatDate, formatTime } from '@/lib/utils';
import { JobActions } from '@/components/jobs/JobActions';
import { AssignWorkerForm } from '@/components/jobs/AssignWorkerForm';
import { WhatsappPanel } from '@/components/jobs/WhatsappPanel';
import { JobTimeline } from '@/components/jobs/JobTimeline';

export const dynamic = 'force-dynamic';

const PRIORITY_LABELS = { low: 'Baja', normal: 'Normal', high: 'Alta', urgent: 'Urgente' };

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await getJobWithRelations(params.id);
  if (!job) notFound();

  const [updates, messages, availableWorkers] = await Promise.all([
    listJobUpdates(job.id),
    listMessageLogs(job.id),
    listAvailableWorkers(),
  ]);

  const lastSummary = [...updates].reverse().find((u) => u.type === 'ai_summary');

  return (
    <div>
      <PageHeader
        title={job.title}
        description={job.client?.name ?? 'Sin cliente'}
        actions={
          <div className="flex items-center gap-2">
            <PriorityBadge priority={job.priority} label={PRIORITY_LABELS[job.priority]} />
            <JobStatusBadge status={job.status} label={JOB_STATUS_LABELS[job.status]} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 px-8 py-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Datos del trabajo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Cliente" value={job.client?.name ?? '—'} />
              <Row label="Dirección" value={job.address} />
              <Row label="Fecha" value={`${formatDate(job.scheduled_date)} ${formatTime(job.scheduled_time)}`} />
              <Row label="Skills requeridas" value={job.required_skills.join(', ') || '—'} />
              <Row
                label="Evidencia requerida"
                value={job.required_evidence.map((e) => EVIDENCE_LABELS[e]).join(', ') || 'Ninguna'}
              />
              <Row label="Notas internas" value={job.admin_notes ?? '—'} />
              {job.description && <Row label="Descripción" value={job.description} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trabajador asignado</CardTitle>
            </CardHeader>
            <CardContent>
              {job.worker ? (
                <div className="text-sm">
                  <p className="font-medium text-white">{job.worker.name}</p>
                  <p className="text-zinc-500">
                    {job.worker.zone} · {job.worker.phone}
                  </p>
                </div>
              ) : (
                <AssignWorkerForm jobId={job.id} workers={availableWorkers} />
              )}
            </CardContent>
          </Card>

          {lastSummary && (
            <Card className="border-purple-500/30 bg-purple-500/5">
              <CardHeader>
                <CardTitle>Resumen IA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-200">{lastSummary.content}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <JobActions jobId={job.id} status={job.status} hasWorker={Boolean(job.worker)} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="flex h-[720px] flex-col">
            <CardHeader>
              <CardTitle>WhatsApp Simulator</CardTitle>
            </CardHeader>
            <div className="flex-1 overflow-hidden">
              <WhatsappPanel jobId={job.id} workerName={job.worker?.name ?? null} messages={messages} />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-[720px] overflow-y-auto">
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <JobTimeline updates={updates} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="flex-shrink-0 text-zinc-500">{label}</span>
      <span className="text-right text-zinc-200">{value}</span>
    </div>
  );
}
