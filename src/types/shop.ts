export type ProductCategory =
  | 'Makanan Kering'
  | 'Makanan Basah'
  | 'Snack / Krim'
  | 'Perawatan / Grooming'
  | 'Aksesoris Grooming';

export type LifeStage = 'Semua Usia' | 'Kitten (1-12 Bulan)' | 'Dewasa (1+ Tahun)';

export type UserRole = 'user' | 'admin';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  lifeStage: LifeStage;
  price: number;
  weight: string;
  flavor: string;
  stock: number;
  imageUrl: string;
  fallbackImageUrl?: string;
  description: string;
  nutritionHighlight: string;
  isBestSeller?: boolean;
  createdAt?: string;
}

export interface ProductInput {
  name: string;
  brand: string;
  category: ProductCategory;
  lifeStage: LifeStage;
  price: number;
  weight: string;
  flavor: string;
  stock: number;
  imageUrl: string;
  description: string;
  nutritionHighlight: string;
  isBestSeller?: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'QRIS' | 'E-Wallet' | 'COD (Bayar di Tempat)';

export interface CheckoutPayload {
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  userId?: string;
}

export interface OrderConfirmation {
  orderCode: string;
  customerName: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  itemCount: number;
}
