create table if not exists orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table orgs is 'Tenant root for the HRMS deployment';
comment on column orgs.name is 'Organization display name';
comment on column orgs.slug is 'URL-safe organization identifier';
