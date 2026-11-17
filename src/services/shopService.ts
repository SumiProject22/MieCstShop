import { INITIAL_PRODUCTS } from '../data/products';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  CheckoutPayload,
  OrderConfirmation,
  Product,
  ProductCategory,
  ProductInput,
  UserProfile,
  UserRole,
} from '../types/shop';

const STORAGE_KEYS = {
  PRODUCTS: 'miepetshop_products_v4',
  SESSION: 'miepetshop_session_v1',
  ORDERS: 'miepetshop_orders_v1',
};

export interface AuthResult {
  user: UserProfile | null;
  needsEmailConfirmation: boolean;
  message?: string;
}

function parsePrice(raw: unknown): number {
  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
  if (typeof raw === 'string') {
    const digits = raw.replace(/[^\d]/g, '');
    return digits ? Number(digits) : 0;
  }
  return 0;
}

function inferImageForProduct(name: string, category: string): string {
  const n = name.toLowerCase();
  const c = category.toLowerCase();

  if (n.includes('shampoo') || n.includes('shampo') || c.includes('perawatan')) {
    return '/assets/aistudio/WhatsApp_Idmage_2026-11-17_at_17.38.51_fbde9169.jpeg';
  }
  if (n.includes('brush') || n.includes('sisir') || c.includes('aksesoris')) {
    return '/assets/aistudio/WhatsApp_Image_2026-11-17_at_17.38.51_0fdc72be.jpeg';
  }
  if (n.includes('creamy') || n.includes('crab') || c.includes('snack')) {
    return '/assets/aistudio/WhatsAfpp_Ifmage_2026-11-17_at_17.38.49_e021be05.jpeg';
  }
  if (n.includes('saba') || (n.includes('whiskas') && (n.includes('wet') || c.includes('basah')))) {
    return '/assets/aistudio/d.jpg_ec9dc1fe.jpeg';
  }
  if (n.includes('me-o') && (n.includes('wet') || n.includes('chicken') || c.includes('basah'))) {
    return '/assets/aistudio/WhatsAffpp_Image_2026-11-17_at_17.38.48_97a9837a.jpeg';
  }
  if (n.includes('grain free') || n.includes('gold selection')) {
    return '/assets/aistudio/WhatsApp_Image_2f26-11-17_at_17.38.48_6a348e9d.jpeg';
  }
  if (n.includes('whiskas') && n.includes('milk')) {
    return '/assets/aistudio/WhatsApp_Image_2026-11-17_at_17.38.50_a8984e6b.jpeg';
  }
  if (n.includes('whiskas') && n.includes('junior')) {
    return '/assets/aistudio/WhatsApp_f2026-11-17_at_17.38.50_282ab084.jpeg';
  }
  if (n.includes('whiskas') && (n.includes('adult') || n.includes('mackerel'))) {
    return '/assets/aistudio/WhatsApp_Ifmage_2026-11-17_at_17.38.49_9a808ef8.jpeg';
  }
  if (n.includes('me-o') && n.includes('kitten')) {
    return '/assets/aistudio/WhatsApp_Ifmage_2026-11-17_at_17.38.47_81b834d8.jpeg';
  }

  return '/assets/aistudio/WhatsApp_Ifmage_2026-11-17_at_17.38.47_81b834d8.jpeg';
}

function inferBrand(name: string): string {
  const n = name.toLowerCase();
  if (n.startsWith('me-o gold')) return 'Me-O Gold';
  if (n.startsWith('me-o')) return 'Me-O';
  if (n.startsWith('whiskas')) return 'Whiskas';
  if (n.startsWith('gjyc')) return 'GJYC Pet';
  if (n.includes('brush') || n.includes('slicker')) return 'MiePet Care';
  return name.split(' ')[0] || 'MiePetShop';
}

function inferWeight(name: string, description: string): string {
  const combined = `${name} ${description}`;
  const match = combined.match(/(\d+(?:[.,]\d+)?\s?(?:kg|g|ml|pcs|sachet))/i);
  return match ? match[1] : 'Kemasan Standar';
}

function normalizeCategory(raw: unknown): ProductCategory {
  const val = String(raw || '').trim();
  const allowed: ProductCategory[] = [
    'Makanan Kering',
    'Makanan Basah',
    'Snack / Krim',
    'Perawatan / Grooming',
    'Aksesoris Grooming',
  ];
  const exact = allowed.find((c) => c.toLowerCase() === val.toLowerCase());
  if (exact) return exact;
  if (val.toLowerCase().includes('basah')) return 'Makanan Basah';
  if (val.toLowerCase().includes('snack') || val.toLowerCase().includes('krim')) {
    return 'Snack / Krim';
  }
  if (val.toLowerCase().includes('perawatan') || val.toLowerCase().includes('shampoo')) {
    return 'Perawatan / Grooming';
  }
  if (val.toLowerCase().includes('aksesoris')) return 'Aksesoris Grooming';
  return 'Makanan Kering';
}

function mapRowToProduct(row: Record<string, unknown>): Product {
  const name = String(row.name ?? row.nama_produk ?? row.title ?? 'Produk Kucing');
  const category = normalizeCategory(row.category ?? row.kategori);
  const description = String(row.description ?? row.deskripsi ?? '');
  const rawImage = String(
    row.image_url ?? row.imageUrl ?? row.gambar_url ?? row.foto ?? ''
  ).trim();
  const matchedPhoto = inferImageForProduct(name, category);
  const isGenericUnsplash = rawImage.includes('images.unsplash.com');

  return {
    id: String(row.id ?? `mps-${Math.random().toString(36).slice(2, 8)}`),
    name,
    brand: String(row.brand ?? row.merek ?? inferBrand(name)),
    category,
    lifeStage:
      (row.life_stage as Product['lifeStage']) ||
      (name.toLowerCase().includes('kitten') || name.toLowerCase().includes('junior')
        ? 'Kitten (1-12 Bulan)'
        : name.toLowerCase().includes('adult') || description.toLowerCase().includes('dewasa')
        ? 'Dewasa (1+ Tahun)'
        : 'Semua Usia'),
    price: parsePrice(row.price ?? row.harga),
    weight: String(row.weight ?? row.berat ?? inferWeight(name, description)),
    flavor: String(row.flavor ?? row.varian ?? category),
    stock: Number(row.stock ?? row.stok ?? 0),
    imageUrl: !rawImage || isGenericUnsplash ? matchedPhoto : rawImage,
    fallbackImageUrl: matchedPhoto,
    description,
    nutritionHighlight: String(row.nutrition_highlight ?? 'Produk Pilihan MiePetShop'),
    isBestSeller: Boolean(row.is_best_seller),
    createdAt: row.created_at ? String(row.created_at) : undefined,
  };
}

function readLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function writeLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch {
    // Abaikan jika penyimpanan lokal penuh
  }
}

export async function fetchProducts(): Promise<Product[]> {
  if (supabase && isSupabaseConfigured) {
    const firstTry = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    let data = firstTry.data;
    let error = firstTry.error;

    // Jika tabel products belum memiliki kolom created_at, lakukan query polos tanpa order
    if (error && error.message.toLowerCase().includes('created_at')) {
      const retry = await supabase.from('products').select('*');
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Supabase fetchProducts error:', error);
      throw new Error(`Gagal memuat tabel 'products' dari Supabase: ${error.message}`);
    }

    if (data && data.length > 0) {
      return data.map((row) => mapRowToProduct(row as Record<string, unknown>));
    }
  }
  return readLocalProducts();
}

export async function createProduct(input: ProductInput): Promise<Product> {
  if (supabase && isSupabaseConfigured) {
    const fullInsert = await supabase
      .from('products')
      .insert({
        name: input.name,
        brand: input.brand,
        category: input.category,
        life_stage: input.lifeStage,
        price: input.price,
        weight: input.weight,
        flavor: input.flavor,
        stock: input.stock,
        image_url: input.imageUrl,
        description: input.description,
        nutrition_highlight: input.nutritionHighlight,
        is_best_seller: Boolean(input.isBestSeller),
      })
      .select()
      .single();

    let data = fullInsert.data;
    let error = fullInsert.error;

    // Jika tabel products hanya memakai kolom inti (name, category, price, stock, description, image_url)
    if (error && (error.code === 'PGRST204' || error.message.includes('column'))) {
      const coreInsert = await supabase
        .from('products')
        .insert({
          name: input.name,
          category: input.category,
          price: input.price,
          stock: input.stock,
          image_url: input.imageUrl,
          description: input.description,
        })
        .select()
        .single();
      data = coreInsert.data;
      error = coreInsert.error;
    }

    if (error || !data) {
      throw new Error(error?.message || 'Gagal menambahkan produk ke Supabase.');
    }
    return mapRowToProduct(data as Record<string, unknown>);
  }

  const newProduct: Product = {
    ...input,
    id: `mps-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const next = [newProduct, ...readLocalProducts()];
  writeLocalProducts(next);
  return newProduct;
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  if (supabase && isSupabaseConfigured) {
    const fullUpdate = await supabase
      .from('products')
      .update({
        name: input.name,
        brand: input.brand,
        category: input.category,
        life_stage: input.lifeStage,
        price: input.price,
        weight: input.weight,
        flavor: input.flavor,
        stock: input.stock,
        image_url: input.imageUrl,
        description: input.description,
        nutrition_highlight: input.nutritionHighlight,
        is_best_seller: Boolean(input.isBestSeller),
      })
      .eq('id', id)
      .select()
      .single();

    let data = fullUpdate.data;
    let error = fullUpdate.error;

    if (error && (error.code === 'PGRST204' || error.message.includes('column'))) {
      const coreUpdate = await supabase
        .from('products')
        .update({
          name: input.name,
          category: input.category,
          price: input.price,
          stock: input.stock,
          image_url: input.imageUrl,
          description: input.description,
        })
        .eq('id', id)
        .select()
        .single();
      data = coreUpdate.data;
      error = coreUpdate.error;
    }

    if (error || !data) {
      throw new Error(error?.message || 'Gagal memperbarui produk di Supabase.');
    }
    return mapRowToProduct(data as Record<string, unknown>);
  }

  const current = readLocalProducts();
  const updated: Product = { ...input, id };
  const next = current.map((item) => (item.id === id ? updated : item));
  writeLocalProducts(next);
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  if (supabase && isSupabaseConfigured) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      throw new Error(`Gagal menghapus produk: ${error.message}`);
    }
    return;
  }

  const next = readLocalProducts().filter((item) => item.id !== id);
  writeLocalProducts(next);
}

export async function fetchUserRoleFromProfiles(userId: string): Promise<UserRole | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile.role === 'admin' ? 'admin' : 'user';
}

async function resolveSupabaseProfile(
  userId: string,
  email: string,
  metadataName?: string
): Promise<UserProfile> {
  const fallbackName = metadataName || email.split('@')[0] || 'Pengguna';

  if (!supabase || !isSupabaseConfigured) {
    return {
      id: userId,
      fullName: fallbackName,
      email,
      role: 'user',
    };
  }

  // Ambil role langsung dari tabel public.profiles (bukan dari user_metadata)
  const { data: roleRow, error: roleError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (!roleError && roleRow) {
    const resolvedRole: UserRole = roleRow.role === 'admin' ? 'admin' : 'user';
    const { data: nameRow } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle();

    return {
      id: userId,
      fullName:
        typeof nameRow?.full_name === 'string' && nameRow.full_name.trim()
          ? nameRow.full_name.trim()
          : fallbackName,
      email,
      role: resolvedRole,
    };
  }

  // Jika baris profil belum ada sama sekali (PGRST116), buat profil default 'user'
  if (roleError?.code === 'PGRST116') {
    await supabase.from('profiles').insert({
      id: userId,
      full_name: fallbackName,
      role: 'user',
    });
  }

  return {
    id: userId,
    fullName: fallbackName,
    email,
    role: 'user',
  };
}

export async function signInAccount(params: {
  email: string;
  password: string;
}): Promise<UserProfile> {
  const cleanEmail = params.email.trim().toLowerCase();

  if (supabase && isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: params.password,
    });
    if (error || !data.user) {
      throw new Error(error?.message || 'Email atau kata sandi tidak sesuai.');
    }

    const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
    const sessionUser = await resolveSupabaseProfile(
      data.user.id,
      data.user.email || cleanEmail,
      typeof meta.full_name === 'string' ? meta.full_name : undefined
    );

    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionUser));
    return sessionUser;
  }

  if (!cleanEmail || !params.password.trim()) {
    throw new Error('Mohon isi email dan kata sandi terlebih dahulu.');
  }
  if (params.password.length < 6) {
    throw new Error('Kata sandi minimal 6 karakter.');
  }

  const derivedName = cleanEmail
    .split('@')[0]
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const user: UserProfile = {
    id: `local-user-${Date.now()}`,
    fullName: derivedName,
    email: cleanEmail,
    role: 'user',
  };
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  return user;
}

export async function registerAccount(params: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const cleanName = params.fullName.trim();
  const cleanEmail = params.email.trim().toLowerCase();

  if (!cleanName || !cleanEmail || params.password.length < 6) {
    throw new Error(
      'Lengkapi nama lengkap, email valid, dan kata sandi minimal 6 karakter.'
    );
  }

  if (supabase && isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: params.password,
      options: {
        data: {
          full_name: cleanName,
        },
      },
    });

    if (error || !data.user) {
      throw new Error(error?.message || 'Pendaftaran akun gagal.');
    }

    // Jika sesi aktif langsung terbentuk (email confirmation dimatikan), sinkronkan tabel profiles
    if (data.session) {
      const profile = await resolveSupabaseProfile(
        data.user.id,
        cleanEmail,
        cleanName
      );
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(profile));
      return {
        user: profile,
        needsEmailConfirmation: false,
      };
    }

    // Jika Supabase mengaktifkan konfirmasi email, trigger on_auth_user_created otomatis mengisi tabel profiles
    return {
      user: null,
      needsEmailConfirmation: true,
      message:
        'Akun berhasil didaftarkan ke Supabase! Silakan cek kotak masuk emailmu untuk konfirmasi sebelum masuk.',
    };
  }

  const user: UserProfile = {
    id: `local-user-${Date.now()}`,
    fullName: cleanName,
    email: cleanEmail,
    role: 'user',
  };
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  return {
    user,
    needsEmailConfirmation: false,
  };
}

export async function restoreActiveSession(): Promise<UserProfile | null> {
  if (supabase && isSupabaseConfigured) {
    const { data } = await supabase.auth.getSession();
    const authUser = data.session?.user;
    if (!authUser) {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      return null;
    }

    const meta = (authUser.user_metadata ?? {}) as Record<string, unknown>;
    const profile = await resolveSupabaseProfile(
      authUser.id,
      authUser.email || '',
      typeof meta.full_name === 'string' ? meta.full_name : undefined
    );
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(profile));
    return profile;
  }

  return getSavedSession();
}

export function getSavedSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export async function signOutSession(): Promise<void> {
  if (supabase && isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

export async function submitOrder(payload: CheckoutPayload): Promise<OrderConfirmation> {
  const orderCode = `MPS-${Math.floor(100000 + Math.random() * 900000)}`;

  if (supabase && isSupabaseConfigured) {
    const { data: orderRow, error } = await supabase
      .from('orders')
      .insert({
        order_code: orderCode,
        user_id: payload.userId ?? null,
        customer_name: payload.customerName,
        phone: payload.phone,
        address: payload.address,
        payment_method: payload.paymentMethod,
        subtotal: payload.subtotal,
        shipping_cost: payload.shippingCost,
        total: payload.total,
        status: 'confirmed',
      })
      .select()
      .single();

    if (error || !orderRow) {
      throw new Error(error?.message || 'Gagal menyimpan pesanan ke Supabase.');
    }

    const orderItems = payload.items.map((item) => ({
      order_id: orderRow.id,
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
    }));

    await supabase.from('order_items').insert(orderItems);
  } else {
    try {
      const prev = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]') as unknown[];
      localStorage.setItem(
        STORAGE_KEYS.ORDERS,
        JSON.stringify([{ orderCode, ...payload, createdAt: new Date().toISOString() }, ...prev])
      );
    } catch {
      // Abaikan jika penyimpanan lokal penuh
    }
  }

  return {
    orderCode,
    customerName: payload.customerName,
    total: payload.total,
    paymentMethod: payload.paymentMethod,
    createdAt: new Date().toISOString(),
    itemCount: payload.items.reduce((acc, item) => acc + item.quantity, 0),
  };
}
