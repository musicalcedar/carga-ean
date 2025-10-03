-- Create products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  description text not null,
  ean_primary text not null,
  ean_secondary text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for faster searches
create index if not exists products_code_idx on public.products(code);
create index if not exists products_ean_primary_idx on public.products(ean_primary);
create index if not exists products_ean_secondary_idx on public.products(ean_secondary);

-- Enable RLS (Row Level Security)
alter table public.products enable row level security;

-- Create policies for public access (no authentication required)
create policy "Allow public to view products"
  on public.products for select
  using (true);

create policy "Allow public to insert products"
  on public.products for insert
  with check (true);

create policy "Allow public to update products"
  on public.products for update
  using (true);

create policy "Allow public to delete products"
  on public.products for delete
  using (true);
