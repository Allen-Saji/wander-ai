-- Run this in your Supabase SQL Editor to set up the required tables

-- User threads mapping table
-- Maps Supabase user IDs to Tambo thread IDs for per-user chat persistence
create table if not exists user_threads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  tambo_thread_id text not null,
  title text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- Each user can only have one mapping per Tambo thread
  unique(user_id, tambo_thread_id)
);

-- Index for fast lookups by user
create index if not exists idx_user_threads_user_id on user_threads(user_id);

-- Enable Row Level Security
alter table user_threads enable row level security;

-- Users can only see their own threads
create policy "Users can view own threads"
  on user_threads for select
  using (auth.uid() = user_id);

-- Users can insert their own threads
create policy "Users can insert own threads"
  on user_threads for insert
  with check (auth.uid() = user_id);

-- Users can update their own threads
create policy "Users can update own threads"
  on user_threads for update
  using (auth.uid() = user_id);

-- Users can delete their own threads
create policy "Users can delete own threads"
  on user_threads for delete
  using (auth.uid() = user_id);
