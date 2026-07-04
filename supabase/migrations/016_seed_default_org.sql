insert into orgs (id, name, slug)
values ('00000000-0000-0000-0000-000000000001'::uuid, 'WorkSync', 'worksync')
on conflict (id) do nothing;
