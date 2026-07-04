do $$
begin
  if not exists (select 1 from storage.buckets where name = 'profile-pictures') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values (
      'profile-pictures',
      'profile-pictures',
      false,
      5242880,
      array['image/png', 'image/jpeg', 'image/jpg']
    );
  end if;
end;
$$;

do $$
begin
  if not exists (select 1 from storage.buckets where name = 'documents') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values (
      'documents',
      'documents',
      false,
      10485760,
      array['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    );
  end if;
end;
$$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'profile_pictures_owner_write'
  ) then
    create policy "profile_pictures_owner_write"
    on storage.objects
    for insert
    to authenticated
    with check (
      bucket_id = 'profile-pictures'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'profile_pictures_owner_read'
  ) then
    create policy "profile_pictures_owner_read"
    on storage.objects
    for select
    to authenticated
    using (
      bucket_id = 'profile-pictures'
      and (
        (storage.foldername(name))[1] = auth.uid()::text
        or is_admin()
      )
    );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'documents_owner_write'
  ) then
    create policy "documents_owner_write"
    on storage.objects
    for insert
    to authenticated
    with check (
      bucket_id = 'documents'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'documents_owner_read'
  ) then
    create policy "documents_owner_read"
    on storage.objects
    for select
    to authenticated
    using (
      bucket_id = 'documents'
      and (
        (storage.foldername(name))[1] = auth.uid()::text
        or is_admin()
      )
    );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'documents_admin_delete'
  ) then
    create policy "documents_admin_delete"
    on storage.objects
    for delete
    to authenticated
    using (
      bucket_id = 'documents'
      and is_admin()
    );
  end if;
end $$;

comment on policy "profile_pictures_owner_write" on storage.objects is 'Owner-only writes go into their own folder under profile-pictures';
comment on policy "profile_pictures_owner_read" on storage.objects is 'Owner reads their own profile pictures; admin reads all';
comment on policy "documents_owner_write" on storage.objects is 'Owner-only writes for the documents bucket';
comment on policy "documents_owner_read" on storage.objects is 'Owner reads their own documents; admin reads all';
comment on policy "documents_admin_delete" on storage.objects is 'Admin can delete any document object';
