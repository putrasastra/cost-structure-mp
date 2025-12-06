-- Audit Logs Table
create table if not exists audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id),
  action text not null,
  target_id uuid,
  details jsonb,
  created_at timestamp with time zone default now()
);

alter table audit_logs enable row level security;

create policy "Admins can view audit logs"
  on audit_logs for select
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );
  
create policy "Admins can insert audit logs"
  on audit_logs for insert
  with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Function to delete user (both public and auth)
create or replace function delete_user_by_admin(target_user_id uuid)
returns void
security definer
set search_path = public, auth
language plpgsql
as $$
begin
  -- Check if executing user is admin
  if not exists (select 1 from public.users where id = auth.uid() and role = 'admin') then
    raise exception 'Access denied: User is not an admin';
  end if;

  -- Delete from public.users
  delete from public.users where id = target_user_id;
  
  -- Delete from auth.users
  delete from auth.users where id = target_user_id;
  
  -- Log it
  insert into audit_logs (user_id, action, target_id, details)
  values (auth.uid(), 'DELETE_USER', target_user_id, '{}');
end;
$$;

-- Policy for Admins to update users (e.g. roles)
create policy "Admins can update all users"
  on users for update
  using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

-- Policy for Admins to delete users (via RLS if we were using direct delete)
create policy "Admins can delete all users"
  on users for delete
  using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

-- Audit Trail for Role Changes
create or replace function log_role_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if old.role is distinct from new.role then
    insert into audit_logs (user_id, action, target_id, details)
    values (auth.uid(), 'UPDATE_ROLE', new.id, jsonb_build_object('old_role', old.role, 'new_role', new.role));
  end if;
  return new;
end;
$$;

drop trigger if exists on_role_change on users;
create trigger on_role_change
  after update on users
  for each row
  execute function log_role_change();

-- Make the first created user an admin if no admin exists
do $$
begin
  if not exists (select 1 from users where role = 'admin') then
    update users set role = 'admin' 
    where created_at = (select min(created_at) from users);
  end if;
end;
$$;
