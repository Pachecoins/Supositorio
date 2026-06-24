-- FOA — FieldOpsAgent
-- Supabase / Postgres schema
-- Run this in the Supabase SQL editor (or `supabase db push` with this file as a migration).

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────

create type worker_status as enum ('available', 'busy', 'offline', 'suspended');

create type job_status as enum (
  'draft',
  'offered',
  'accepted',
  'rejected',
  'scheduled',
  'reminder_sent',
  'en_route',
  'arrived',
  'in_progress',
  'blocked',
  'completed',
  'cancelled',
  'needs_admin_attention'
);

create type job_priority as enum ('low', 'normal', 'high', 'urgent');

create type job_update_type as enum (
  'outbound_message',
  'inbound_message',
  'status_change',
  'photo',
  'issue',
  'admin_note',
  'ai_summary',
  'escalation'
);

create type message_direction as enum ('inbound', 'outbound');

create type message_channel as enum ('whatsapp_simulator', 'whatsapp_cloud_api');

create type worker_intent as enum (
  'accepts_job',
  'rejects_job',
  'confirms_en_route',
  'confirms_arrival',
  'sends_progress_update',
  'reports_issue',
  'asks_question',
  'confirms_completion',
  'sends_photo',
  'unclear'
);

-- ─────────────────────────────────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────────────────────────────────

create table workers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  zone text not null,
  skills text[] not null default '{}',
  availability text,
  rate numeric(10, 2),
  trust_score numeric(3, 2) not null default 0.80 check (trust_score >= 0 and trust_score <= 1),
  status worker_status not null default 'available',
  notes text,
  created_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  address text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  client_id uuid not null references clients (id) on delete restrict,
  address text not null,
  scheduled_date date,
  scheduled_time time,
  required_skills text[] not null default '{}',
  assigned_worker_id uuid references workers (id) on delete set null,
  status job_status not null default 'draft',
  priority job_priority not null default 'normal',
  required_evidence text[] not null default '{}', -- e.g. {arrival_photo, progress_photo, final_photo}
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table job_updates (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  worker_id uuid references workers (id) on delete set null,
  type job_update_type not null,
  content text,
  media_url text,
  detected_intent worker_intent,
  created_at timestamptz not null default now()
);

create table message_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  worker_id uuid references workers (id) on delete set null,
  direction message_direction not null,
  channel message_channel not null default 'whatsapp_simulator',
  content text not null,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────────────────

create index idx_jobs_assigned_worker on jobs (assigned_worker_id);
create index idx_jobs_client on jobs (client_id);
create index idx_jobs_status on jobs (status);
create index idx_job_updates_job on job_updates (job_id, created_at);
create index idx_message_logs_job on message_logs (job_id, created_at);

-- ─────────────────────────────────────────────────────────────────────────
-- updated_at trigger for jobs
-- ─────────────────────────────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger jobs_set_updated_at
before update on jobs
for each row
execute function set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- Storage bucket for evidence photos (run once)
-- ─────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('job-evidence', 'job-evidence', true)
on conflict (id) do nothing;
