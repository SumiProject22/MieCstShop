import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  LogOut,
  Package,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { Product, ProductCategory, UserProfile } from '../types/shop';
import { formatIDR } from '../utils/format';
import { ResilientImage } from '../components/ResilientImage';
import { CatBrandMark } from '../components/CatIcons';

interface AdminDashboardPageProps {
  products: Product[];
  loadingProducts: boolean;
  currentUser: UserProfile | null;
  onOpenAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onSignOut: () => void;
}

const CATEGORIES: ('Semua' | ProductCategory)[] = [
  'Semua',
  'Makanan Kering',
  'Makanan Basah',
  'Snack / Krim',
  'Perawatan / Grooming',
  'Aksesoris Grooming',
];

export function AdminDashboardPage({
  products,
  loadingProducts,
  currentUser,
  onOpenAddProduct,
  onEditProduct,
  onDeleteProduct,
  onSignOut,
}: AdminDashboardPageProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'Semua' | ProductCategory>('Semua');

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((item) => {
      const matchCat = category === 'Semua' || item.category === category;
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [products, search, category]);

  const stats = useMemo(() => {
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStockCount = products.filter((p) => p.stock <= 20).length;
    const favoriteCount = products.filter((p) => p.isBestSeller).length;
    return {
      totalProducts: products.length,
      totalStock,
      lowStockCount,
      favoriteCount,
    };
  }, [products]);

  return (
    <div className="min-h-screen bg-[#F6E2E9] text-[#362029]">
      {/* Header Admin Dashboard */}
      <header className="sticky top-0 z-30 bg-[#FAF0F4]/95 backdrop-blur-md border-b border-[#E4C3CF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-[#362029] whitespace-nowrap shrink-0"
            >
              <CatBrandMark className="w-8 h-8 shrink-0" />
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight">
                MiePetShop
              </span>
            </Link>
            <span className="hidden sm:inline text-[#DFB9C7]">/</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#9D254E]">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>Admin Dashboard</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser && (
              <span className="hidden md:inline text-xs font-medium text-[#5F424E]">
                Admin: <strong className="text-[#362029]">{currentUser.fullName}</strong>
              </span>
            )}
            <Link
              to="/"
              className="h-10 px-3.5 inline-flex items-center gap-1.5 rounded-xl bg-[#FCF4F7] border border-[#DFB9C7] text-xs sm:text-sm font-medium text-[#362029] hover:bg-[#EED2DC] transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Lihat Toko</span>
            </Link>
            <button
              type="button"
              onClick={onSignOut}
              className="h-10 px-3.5 inline-flex items-center gap-1.5 rounded-xl bg-[#362029] text-white text-xs sm:text-sm font-medium hover:bg-[#4D2E3B] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Judul & Aksi Utama */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#9D254E]">
              Panel Pengelola · Katalog Produk Supabase
            </p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#362029] tracking-tight">
              Dashboard Produk MiePetShop
            </h1>
          </div>

          <button
            type="button"
            onClick={onOpenAddProduct}
            className="h-11 px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#BA3360] text-white text-sm font-semibold hover:bg-[#9D254E] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>

        {/* Ringkasan Statistik */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-[#FCF4F7] border border-[#E4C3CF] p-5">
            <p className="text-xs font-medium text-[#5F424E]">Total Produk</p>
            <p className="mt-2 tabular-nums font-display text-2xl font-bold text-[#362029]">
              {stats.totalProducts}
            </p>
          </div>
          <div className="rounded-2xl bg-[#FCF4F7] border border-[#E4C3CF] p-5">
            <p className="text-xs font-medium text-[#5F424E]">Total Unit Stok</p>
            <p className="mt-2 tabular-nums font-display text-2xl font-bold text-[#362029]">
              {stats.totalStock}
            </p>
          </div>
          <div className="rounded-2xl bg-[#FCF4F7] border border-[#E4C3CF] p-5">
            <p className="text-xs font-medium text-[#5F424E]">Stok Menipis (&le; 20)</p>
            <p className="mt-2 tabular-nums font-display text-2xl font-bold text-[#BA3360]">
              {stats.lowStockCount}
            </p>
          </div>
          <div className="rounded-2xl bg-[#FCF4F7] border border-[#E4C3CF] p-5">
            <p className="text-xs font-medium text-[#5F424E]">Produk Favorit</p>
            <p className="mt-2 tabular-nums font-display text-2xl font-bold text-[#362029]">
              {stats.favoriteCount}
            </p>
          </div>
        </div>

        {/* Filter & Pencarian */}
        <div className="rounded-2xl bg-[#FCF4F7] border border-[#E4C3CF] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="w-4 h-4 text-[#7D5E6A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama produk atau kategori..."
              aria-label="Cari produk di admin dashboard"
              className="w-full h-10 pl-10 pr-3 rounded-xl bg-[#F6E2E9]/70 border border-[#DFB9C7] text-sm text-[#362029] placeholder:text-[#7D5E6A] focus:outline-none focus:bg-white focus:border-[#BA3360]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    active
                      ? 'bg-[#BA3360] text-white'
                      : 'bg-[#EED2DC] text-[#5F424E] hover:text-[#362029]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Daftar Produk */}
        <div className="rounded-3xl bg-[#FCF4F7] border border-[#E4C3CF] overflow-hidden">
          {loadingProducts ? (
            <div className="p-10 text-center text-sm text-[#5F424E]">
              Memuat daftar produk...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Package className="w-8 h-8 text-[#BA3360] mx-auto" aria-hidden="true" />
              <p className="font-display font-bold text-[#362029]">
                Belum ada produk yang cocok
              </p>
              <p className="text-xs text-[#5F424E]">
                Ubah kata kunci pencarian atau tambahkan produk baru.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E4C3CF] bg-[#EED2DC]/60 text-xs font-semibold text-[#5F424E]">
                    <th className="py-3.5 px-4">Produk</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Harga</th>
                    <th className="py-3.5 px-4">Stok</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4C3CF] text-sm">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-[#F6E2E9]/45">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white border border-[#E4C3CF] p-1 shrink-0">
                            <ResilientImage
                              src={product.imageUrl}
                              fallbackSrc={product.fallbackImageUrl}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-display font-bold text-[#362029] line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-[#5F424E]">
                              {product.brand} · {product.weight}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#5F424E] whitespace-nowrap">
                        {product.category}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums font-bold text-[#362029] whitespace-nowrap">
                        {formatIDR(product.price)}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            product.stock <= 20 ? 'text-[#BA3360]' : 'text-[#362029]'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditProduct(product)}
                            aria-label={`Edit ${product.name}`}
                            className="h-9 px-3 inline-flex items-center gap-1.5 rounded-xl border border-[#DFB9C7] bg-white text-xs font-semibold text-[#362029] hover:bg-[#EED2DC] cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(product)}
                            aria-label={`Hapus ${product.name}`}
                            className="h-9 px-3 inline-flex items-center gap-1.5 rounded-xl border border-[#DFB9C7] bg-white text-xs font-semibold text-[#9D254E] hover:bg-[#EED2DC] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
