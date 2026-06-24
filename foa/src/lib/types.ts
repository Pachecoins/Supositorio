// FOA — FieldOpsAgent
// Core domain types, mirroring supabase/schema.sql

export type WorkerStatus = 'available' | 'busy' | 'offline' | 'suspended';

export type JobStatus =
  | 'draft'
  | 'offered'
  | 'accepted'
  | 'rejected'
  | 'scheduled'
  | 'reminder_sent'
  | 'en_route'
  | 'arrived'
  | 'in_progress'
  | 'blocked'
  | 'completed'
  | 'cancelled'
  | 'needs_admin_attention';

export type JobPriority = 'low' | 'normal' | 'high' | 'urgent';

export type JobUpdateType =
  | 'outbound_message'
  | 'inbound_message'
  | 'status_change'
  | 'photo'
  | 'issue'
  | 'admin_note'
  | 'ai_summary'
  | 'escalation';

export type MessageDirection = 'inbound' | 'outbound';

export type MessageChannel = 'whatsapp_simulator' | 'whatsapp_cloud_api';

export type WorkerIntent =
  | 'accepts_job'
  | 'rejects_job'
  | 'confirms_en_route'
  | 'confirms_arrival'
  | 'sends_progress_update'
  | 'reports_issue'
  | 'asks_question'
  | 'confirms_completion'
  | 'sends_photo'
  | 'unclear';

export type RequiredEvidence = 'arrival_photo' | 'progress_photo' | 'final_photo';

export interface Worker {
  id: string;
  name: string;
  phone: string;
  zone: string;
  skills: string[];
  availability: string | null;
  rate: number | null;
  trust_score: number;
  status: WorkerStatus;
  notes: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  description: string | null;
  client_id: string;
  address: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  required_skills: string[];
  assigned_worker_id: string | null;
  status: JobStatus;
  priority: JobPriority;
  required_evidence: RequiredEvidence[];
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobWithRelations extends Job {
  client: Client | null;
  worker: Worker | null;
}

export interface JobUpdate {
  id: string;
  job_id: string;
  worker_id: string | null;
  type: JobUpdateType;
  content: string | null;
  media_url: string | null;
  detected_intent: WorkerIntent | null;
  created_at: string;
}

export interface MessageLog {
  id: string;
  job_id: string;
  worker_id: string | null;
  direction: MessageDirection;
  channel: MessageChannel;
  content: string;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
}

// ── Agent interpretation result ────────────────────────────────────────────

export interface InterpretedMessage {
  intent: WorkerIntent;
  confidence: number;
  suggested_job_status: JobStatus | null;
  should_escalate: boolean;
  escalation_reason: string | null;
  suggested_reply: string;
  summary_for_admin: string;
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: 'Borrador',
  offered: 'Ofrecido',
  accepted: 'Aceptado',
  rejected: 'Rechazado',
  scheduled: 'Programado',
  reminder_sent: 'Recordatorio enviado',
  en_route: 'En camino',
  arrived: 'Llegó al lugar',
  in_progress: 'En progreso',
  blocked: 'Bloqueado',
  completed: 'Completado',
  cancelled: 'Cancelado',
  needs_admin_attention: 'Requiere atención',
};

export const WORKER_STATUS_LABELS: Record<WorkerStatus, string> = {
  available: 'Disponible',
  busy: 'Ocupado',
  offline: 'Desconectado',
  suspended: 'Suspendido',
};

export const EVIDENCE_LABELS: Record<RequiredEvidence, string> = {
  arrival_photo: 'Foto de llegada',
  progress_photo: 'Foto de avance',
  final_photo: 'Foto final',
};
