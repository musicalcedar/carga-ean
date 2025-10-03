-- Create activity history table
create table if not exists public.activity_history (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  product_code text not null,
  product_description text not null,
  timestamp timestamp with time zone default now()
);

-- Create index for faster queries
create index if not exists activity_history_timestamp_idx on public.activity_history(timestamp desc);

-- Enable RLS
alter table public.activity_history enable row level security;

-- Create policies for public access
create policy "Allow public to view activity history"
  on public.activity_history for select
  using (true);

create policy "Allow public to insert activity history"
  on public.activity_history for insert
  with check (true);
