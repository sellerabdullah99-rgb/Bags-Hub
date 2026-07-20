-- ============================================================
-- Bags Hub C2C MARKETPLACE — Supabase schema
-- Run this whole file once in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. PROFILES (extends Supabase's built-in auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  city text default 'Karachi',
  role text not null default 'buyer' check (role in ('buyer','seller')),
  shop_name text,               -- only used if role = seller
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, phone, role, shop_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'New User'),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'buyer'),
    new.raw_user_meta_data->>'shop_name'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. PRODUCTS (each bag belongs to one seller)
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  category text not null,       -- totes | backpacks | crossbody | laptop-bags | organizers | duffles
  sub text,
  price integer not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  description text,
  specs jsonb default '[]',           -- ["14\" laptop sleeve", ...]
  colors jsonb default '[]',          -- [{"name":"Rust","hex":"#8A4B32"}]
  images jsonb default '[]',          -- [{"emoji":"👜","img":"","label":"Front"}]
  collections jsonb default '[]',     -- ["work","best-sellers"]
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table products enable row level security;

create policy "Active products are viewable by everyone"
  on products for select using (is_active = true or seller_id = auth.uid());

create policy "Sellers can insert their own products"
  on products for insert with check (
    auth.uid() = seller_id
    and exists (select 1 from profiles where id = auth.uid() and role = 'seller')
  );

create policy "Sellers can update their own products"
  on products for update using (auth.uid() = seller_id);

create policy "Sellers can delete their own products"
  on products for delete using (auth.uid() = seller_id);

-- 3. ORDERS (one per checkout, may contain bags from multiple sellers)
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references profiles(id) on delete cascade,
  customer_name text not null,
  phone text not null,
  address text not null,
  city text,
  subtotal integer not null,
  delivery_fee integer not null default 200,
  total integer not null,
  created_at timestamptz default now()
);

alter table orders enable row level security;

create policy "Buyers can view their own orders"
  on orders for select using (auth.uid() = buyer_id);

create policy "Buyers can insert their own orders"
  on orders for insert with check (auth.uid() = buyer_id);

-- 4. ORDER ITEMS (split per seller so sellers only see their own line items)
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  seller_id uuid not null references profiles(id),
  color text,
  qty integer not null check (qty > 0),
  price integer not null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  created_at timestamptz default now()
);

alter table order_items enable row level security;

create policy "Buyers can view items on their own orders"
  on order_items for select using (
    exists (select 1 from orders o where o.id = order_id and o.buyer_id = auth.uid())
  );

create policy "Sellers can view their own order items"
  on order_items for select using (auth.uid() = seller_id);

create policy "Buyers can insert items on their own orders"
  on order_items for insert with check (
    exists (select 1 from orders o where o.id = order_id and o.buyer_id = auth.uid())
  );

create policy "Sellers can update status of their own order items"
  on order_items for update using (auth.uid() = seller_id);

-- 5. CONTACT MESSAGES (unchanged, still open — no auth required to send)
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text not null,
  created_at timestamptz default now()
);

alter table contact_messages enable row level security;

create policy "Anyone can submit a contact message"
  on contact_messages for insert with check (true);
