-- Create documents table for storing document metadata
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  filename text not null,
  file_path text not null,
  file_size bigint not null,
  file_type text not null,
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster queries by user_id
create index if not exists documents_user_id_idx on public.documents(user_id);

-- Enable Row Level Security
alter table public.documents enable row level security;

-- Create policy: Users can only see their own documents
create policy "Users can view their own documents"
  on public.documents
  for select
  using (auth.uid() = user_id);

-- Create policy: Users can insert their own documents
create policy "Users can insert their own documents"
  on public.documents
  for insert
  with check (auth.uid() = user_id);

-- Create policy: Users can delete their own documents
create policy "Users can delete their own documents"
  on public.documents
  for delete
  using (auth.uid() = user_id);

