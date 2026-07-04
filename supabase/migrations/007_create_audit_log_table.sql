create table if not exists audit_log (
  id bigserial primary key,
  org_id uuid not null references orgs(id),
  actor_id uuid references profiles(id),
  table_name text not null,
  record_id uuid,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

comment on table audit_log is 'Immutable audit trail for privileged changes';
