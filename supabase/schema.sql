-- Skema Database PostgreSQL Supabase untuk MiePetShop
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda.

create extension if not exists "pgcrypto";

-- 1. Tabel Profil Pengguna (Terpisah Role: user & admin)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Pengguna dapat melihat profil sendiri"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Pengguna dapat menambah profil sendiri"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Pengguna dapat memperbarui profil sendiri"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger otomatis agar setiap pendaftar baru langsung tercatat di tabel public.profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Tabel Produk Makanan Kucing
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  category text not null check (category in ('Makanan Kering', 'Makanan Basah', 'Snack / Krim', 'Perawatan / Grooming', 'Aksesoris Grooming')),
  life_stage text not null check (life_stage in ('Semua Usia', 'Kitten (1-12 Bulan)', 'Dewasa (1+ Tahun)')),
  price integer not null check (price >= 0),
  weight text not null,
  flavor text not null,
  stock integer not null default 0 check (stock >= 0),
  image_url text not null,
  description text not null,
  nutrition_highlight text not null default '',
  is_best_seller boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Semua pengunjung dapat membaca katalog produk"
  on public.products for select
  using (true);

create policy "Hanya Admin yang dapat menambah produk"
  on public.products for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Hanya Admin yang dapat mengubah produk"
  on public.products for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Hanya Admin yang dapat menghapus produk"
  on public.products for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 3. Tabel Pesanan & Detail Item
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  phone text not null,
  address text not null,
  payment_method text not null,
  subtotal integer not null,
  shipping_cost integer not null default 0,
  total integer not null,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0)
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Pembeli dapat membuat pesanan"
  on public.orders for insert
  with check (true);

create policy "Pembeli dapat melihat pesanan miliknya atau Admin melihat semua"
  on public.orders for select
  using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Pembeli dapat menyimpan item pesanan"
  on public.order_items for insert
  with check (true);

-- 4. Data Awal 10 Produk Asli MiePetShop
insert into public.products (name, brand, category, life_stage, price, weight, flavor, stock, image_url, description, nutrition_highlight, is_best_seller)
values
  ('Me-O Kitten Ocean Fish', 'Me-O', 'Makanan Kering', 'Kitten (1-12 Bulan)', 25000, '80 g', 'Ikan Laut (Ocean Fish)', 35, '/assets/aistudio/WhatsApp_Ifmage_2026-11-17_at_17.38.47_81b834d8.jpeg', 'Makanan kering anak kucing (kitten) terbuat dari ikan laut asli dengan nutrisi lengkap untuk penglihatan dan bulu berkilau.', 'Taurin · Kalsium & Fosfor · Vitamin D untuk Kitten', true),
  ('Me-O Wet Food Chicken with Rice and Tuna', 'Me-O', 'Makanan Basah', 'Dewasa (1+ Tahun)', 9500, '80 g', 'Ayam, Nasi & Tuna', 50, '/assets/aistudio/WhatsAffpp_Image_2026-11-17_at_17.38.48_97a9837a.jpeg', 'Makanan basah kemasan pouch 80g untuk kucing dewasa rasa ayam dengan nasi dan tuna asli.', 'Daging Asli · Omega 3 & 6 · Mendukung Hidrasi', true),
  ('Me-O Gold Selection Grain Free Kitten', 'Me-O Gold', 'Makanan Kering', 'Kitten (1-12 Bulan)', 85000, '400 g', 'Salmon Grain-Free', 20, '/assets/aistudio/WhatsApp_Image_2f26-11-17_at_17.38.48_6a348e9d.jpeg', 'Makanan kering premium bebas biji-bijian (grain free) khusus anak kucing berbahan dasar salmon.', 'Grain-Free · Protein Salmon · DHA Pertumbuhan', true),
  ('Me-O Creamy Treats Crab Flavor', 'Me-O', 'Snack / Krim', 'Semua Usia', 22000, '4 x 15 g', 'Kepiting (Crab)', 45, '/assets/aistudio/WhatsAfpp_Ifmage_2026-11-17_at_17.38.49_e021be05.jpeg', 'Snack krim lembut rasa kepiting isi 4 sachet, mengandung Taurine dan Omega 6 untuk kesehatan kulit dan bulu.', 'Taurin · Omega 6 · Tekstur Creamy', true),
  ('Whiskas Adult Mackerel 1.2kg', 'Whiskas', 'Makanan Kering', 'Dewasa (1+ Tahun)', 78000, '1.2 kg', 'Ikan Kembung (Mackerel)', 25, '/assets/aistudio/WhatsApp_Ifmage_2026-11-17_at_17.38.49_9a808ef8.jpeg', 'Makanan kering kucing dewasa (1+ tahun) rasa ikan kembung kemasan 1.2kg dengan sistem nutrisi lengkap.', 'Omega 3 & 6 · Vitamin A & Taurin · Bulu Sehat', false),
  ('Whiskas Junior Ocean Fish', 'Whiskas', 'Makanan Kering', 'Kitten (1-12 Bulan)', 38000, '450 g', 'Ikan Laut (Ocean Fish)', 30, '/assets/aistudio/WhatsApp_f2026-11-17_at_17.38.50_282ab084.jpeg', 'Makanan kering khusus anak kucing usia 1-12 bulan rasa ikan laut untuk mendukung tumbuh kembang optimal.', '41 Nutrisi Penting · Kalsium & Fosfor · Antioksidan', false),
  ('Whiskas Junior Ocean Fish with Milk', 'Whiskas', 'Makanan Kering', 'Kitten (1-12 Bulan)', 42000, '1.1 kg', 'Ikan Laut & Susu', 28, '/assets/aistudio/WhatsApp_Image_2026-11-17_at_17.38.50_a8984e6b.jpeg', 'Makanan kering kitten usia 2-12 bulan dengan kombinasi ikan laut dan susu yang mengandung 41 nutrisi esensial.', 'Kandungan Susu · DHA & Kalsium · Kibble Lembut', false),
  ('Whiskas Wet Food Grilled Saba Flavour 80g', 'Whiskas', 'Makanan Basah', 'Dewasa (1+ Tahun)', 10000, '80 g', 'Ikan Saba Panggang', 60, '/assets/aistudio/d.jpg_ec9dc1fe.jpeg', 'Makanan basah pouch 80g untuk kucing dewasa rasa ikan saba panggang dengan 100% nutrisi seimbang.', 'Ikan Saba Asli · Kaya Protein · Mudah Dicerna', false),
  ('GJYC Pet Cat Shampoo Pink Edition 150ml', 'GJYC Pet', 'Perawatan / Grooming', 'Semua Usia', 35000, '150 ml', 'Botol Pink Estetik · Wangi Segar', 15, '/assets/aistudio/WhatsApp_Idmage_2026-11-17_at_17.38.51_fbde9169.jpeg', 'Shampo mandi kucing botol pink 150ml dengan formula lembut, bersih, dan wangi segar tahan lama.', 'Formula Lembut · Wangi Tahan Lama · Aman di Kulit', false),
  ('Pink Self-Cleaning Cat Slicker Brush', 'MiePet Care', 'Aksesoris Grooming', 'Semua Usia', 45000, '1 pcs', 'Warna Pink Pastel · Tombol Otomatis', 18, '/assets/aistudio/WhatsApp_Image_2026-11-17_at_17.38.51_0fdc72be.jpeg', 'Sisir bulu kucing warna pink pastel dengan tombol otomatis untuk membersihkan rontokan bulu secara praktis.', 'Tombol Pelepas Bulu · Pin Lembut · Gagang Ergonomis', false);

