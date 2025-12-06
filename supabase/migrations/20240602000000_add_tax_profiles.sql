create table if not exists tax_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  npwp text,
  address text,
  contact text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table tax_profiles enable row level security;

create policy "Users can view their own tax profiles"
  on tax_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tax profiles"
  on tax_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tax profiles"
  on tax_profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tax profiles"
  on tax_profiles for delete
  using (auth.uid() = user_id);

-- Add profile_id to personal_tax_records if not exists
alter table personal_tax_records 
add column if not exists profile_id uuid references tax_profiles(id);
