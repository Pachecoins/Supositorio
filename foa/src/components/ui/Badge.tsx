import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import type { JobPriority, JobStatus, WorkerStatus } from '@/lib/types';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        className
      )}
      {...props}
    />
  );
}

const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  draft: 'bg-zinc-700/40 text-zinc-300',
  offered: 'bg-blue-500/15 text-blue-300',
  accepted: 'bg-emerald-500/15 text-emerald-300',
  rejected: 'bg-red-500/15 text-red-300',
  scheduled: 'bg-indigo-500/15 text-indigo-300',
  reminder_sent: 'bg-indigo-500/15 text-indigo-300',
  en_route: 'bg-cyan-500/15 text-cyan-300',
  arrived: 'bg-cyan-500/15 text-cyan-300',
  in_progress: 'bg-amber-500/15 text-amber-300',
  blocked: 'bg-orange-500/20 text-orange-300',
  completed: 'bg-emerald-500/20 text-emerald-300',
  cancelled: 'bg-zinc-700/40 text-zinc-400',
  needs_admin_attention: 'bg-red-500/20 text-red-300',
};

const WORKER_STATUS_COLORS: Record<WorkerStatus, string> = {
  available: 'bg-emerald-500/15 text-emerald-300',
  busy: 'bg-amber-500/15 text-amber-300',
  offline: 'bg-zinc-700/40 text-zinc-400',
  suspended: 'bg-red-500/15 text-red-300',
};

const PRIORITY_COLORS: Record<JobPriority, string> = {
  low: 'bg-zinc-700/40 text-zinc-300',
  normal: 'bg-blue-500/15 text-blue-300',
  high: 'bg-amber-500/15 text-amber-300',
  urgent: 'bg-red-500/15 text-red-300',
};

export function JobStatusBadge({ status, label }: { status: JobStatus; label: string }) {
  return <Badge className={JOB_STATUS_COLORS[status]}>{label}</Badge>;
}

export function WorkerStatusBadge({ status, label }: { status: WorkerStatus; label: string }) {
  return <Badge className={WORKER_STATUS_COLORS[status]}>{label}</Badge>;
}

export function PriorityBadge({ priority, label }: { priority: JobPriority; label: string }) {
  return <Badge className={PRIORITY_COLORS[priority]}>{label}</Badge>;
}
