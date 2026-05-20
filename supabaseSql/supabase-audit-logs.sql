create table if not exists public.audit_logs (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  event_type text,
  action text,
  outcome text,
  request_id text,
  actor_id text,
  actor_email text,
  actor_role text,
  method text,
  path text,
  route text,
  status integer,
  duration_ms integer,
  ip text,
  user_agent text,
  request jsonb not null default '{}'::jsonb,
  response jsonb not null default '{}'::jsonb,
  details jsonb not null default '{}'::jsonb,
  error jsonb,
  raw_event jsonb not null default '{}'::jsonb
);

create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_actor_id_idx on public.audit_logs (actor_id);
create index if not exists audit_logs_actor_email_idx on public.audit_logs (actor_email);
create index if not exists audit_logs_action_idx on public.audit_logs (action);
create index if not exists audit_logs_path_idx on public.audit_logs (path);
create index if not exists audit_logs_status_idx on public.audit_logs (status);

alter table public.audit_logs enable row level security;

drop policy if exists "super admins can read audit logs" on public.audit_logs;
create policy "super admins can read audit logs"
on public.audit_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'SUPER_ADMIN'
  )
);

-- No public insert/update/delete policy: writes are made only by the backend service-role client.
