import React from 'react';
import { Plus, Pencil, Trash2, SlidersHorizontal, X } from 'lucide-react';
import { Product, ProductCategory, UserProfile } from '../types/shop';
import { formatIDR } from '../utils/format';
import { ResilientImage } from './ResilientImage';
import { CatPawIcon } from './CatIcons';

export type CategoryFilter = 'Semua' | ProductCategory;
export type SortOption = 'popular' | 'price-asc' | 'price-desc';

interface ProductCatalogProps {
  products: Product[];
  loading: boolean;
  selectedCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  searchQuery: string;
  onClearSearch: () => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  currentUser: UserProfile | null;
  onOpenAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

const CATEGORIES: CategoryFilter[] = [
  'Semua',
  'Makanan Kering',
  'Makanan Basah',
  'Snack / Krim',
  'Perawatan / Grooming',
  'Aksesoris Grooming',
];

export function ProductCatalog({
  products,
  loading,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  searchQuery,
  onClearSearch,
  onAddToCart,
  onSelectProduct,
  currentUser,
  onOpenAddProduct,
  onEditProduct,
  onDeleteProduct,
}: ProductCatalogProps) {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <section id="katalog" className="py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Katalog */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E4C3CF]">
          <div>
            <p className="text-xs font-medium text-[#9D254E] mb-1">
              Katalog Pilihan · Makanan & Perawatan Kucing
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#362029] tracking-tight">
              Produk Pilihan MiePetShop
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <button
                type="button"
                onClick={onOpenAddProduct}
                className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-[#362029] text-white text-sm font-medium hover:bg-[#4D2E3B] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Tambah Produk</span>
              </button>
            )}

            <div className="relative flex items-center">
              <SlidersHorizontal
                className="w-4 h-4 text-[#5F424E] absolute left-3 pointer-events-none"
                aria-hidden="true"
              />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                aria-label="Urutkan produk"
                className="h-10 pl-9 pr-8 rounded-xl bg-[#FCF4F7] border border-[#DFB9C7] text-sm font-medium text-[#362029] focus:outline-none focus:border-[#BA3360] cursor-pointer"
              >
                <option value="popular">Urutkan: Terpopuler</option>
                <option value="price-asc">Harga: Terendah</option>
                <option value="price-desc">Harga: Tertinggi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Kategori */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div
            className="flex items-center gap-1.5 p-1 bg-[#EED2DC] border border-[#DFB9C7] rounded-2xl overflow-x-auto max-w-full"
            role="tablist"
            aria-label="Filter kategori makanan kucing"
          >
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelectCategory(category)}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#FCF4F7] text-[#BA3360] shadow-xs font-semibold'
                      : 'text-[#5F424E] hover:text-[#362029]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-[#5F424E]">
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={onClearSearch}
                className="inline-flex items-center gap-1.5 text-[#BA3360] font-medium hover:underline cursor-pointer"
              >
                <span>Pencarian: &ldquo;{searchQuery}&rdquo;</span>
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
            <span className="tabular-nums">{products.length} produk</span>
          </div>
        </div>

        {/* Grid Produk */}
        {loading ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-[#FCF4F7] border border-[#E4C3CF] p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-[4/3] rounded-xl bg-[#EED2DC]" />
                <div className="h-3 w-1/2 rounded bg-[#EED2DC]" />
                <div className="h-5 w-4/5 rounded bg-[#EED2DC]" />
                <div className="h-10 w-full rounded-xl bg-[#EED2DC]" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-10 rounded-3xl bg-[#EED2DC] border border-[#DFB9C7] p-10 text-center max-w-lg mx-auto">
            <CatPawIcon className="w-8 h-8 text-[#BA3360] mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-[#362029]">
              Produk tidak ditemukan
            </h3>
            <p className="mt-1 text-sm text-[#5F424E]">
              Coba kata kunci lain seperti &ldquo;salmon&rdquo;, &ldquo;tuna&rdquo;, atau pilih
              kategori semua produk.
            </p>
            <button
              type="button"
              onClick={() => {
                onClearSearch();
                onSelectCategory('Semua');
              }}
              className="mt-5 h-10 px-5 rounded-xl bg-[#BA3360] text-white text-sm font-semibold hover:bg-[#9D254E] transition-colors cursor-pointer"
            >
              Tampilkan Semua Produk
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {products.map((product) => {
              const outOfStock = product.stock <= 0;
              return (
                <article
                  key={product.id}
                  className="group flex flex-col bg-[#FCF4F7] border border-[#E4C3CF] rounded-2xl overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#BA3360]/10"
                >
                  {/* Foto Produk 4:3 */}
                  <button
                    type="button"
                    onClick={() => onSelectProduct(product)}
                    className="relative aspect-[4/3] w-full bg-white border-b border-[#E4C3CF] p-3 overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BA3360]"
                    aria-label={`Lihat detail ${product.name}`}
                  >
                    <ResilientImage
                      src={product.imageUrl}
                      fallbackSrc={product.fallbackImageUrl}
                      alt={product.name}
                      fallbackLabel={product.name}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  </button>

                  {/* Detail Kartu Seragam */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-[#5F424E]">
                        <span className="truncate">
                          {product.brand} · {product.weight} · {product.category}
                        </span>
                        {product.isBestSeller && (
                          <span className="text-[#BA3360] font-semibold whitespace-nowrap shrink-0">
                            Favorit
                          </span>
                        )}
                      </div>

                      <h3 className="mt-1.5 font-display text-base sm:text-lg font-bold text-[#362029] leading-snug line-clamp-2">
                        <button
                          type="button"
                          onClick={() => onSelectProduct(product)}
                          className="text-left hover:text-[#BA3360] transition-colors cursor-pointer"
                        >
                          {product.name}
                        </button>
                      </h3>

                      <p className="mt-1.5 text-xs sm:text-sm text-[#5F424E] line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#EED2DC] flex items-center justify-between gap-3">
                      <div>
                        <p className="tabular-nums text-base sm:text-lg font-bold text-[#362029]">
                          {formatIDR(product.price)}
                        </p>
                        <p
                          className={`text-xs ${
                            outOfStock ? 'text-[#9D254E] font-medium' : 'text-[#5F424E]'
                          }`}
                        >
                          {outOfStock ? 'Stok habis' : `Stok: ${product.stock}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => onEditProduct(product)}
                              aria-label={`Edit ${product.name}`}
                              className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#DFB9C7] bg-white text-[#362029] hover:bg-[#EED2DC] transition-colors cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteProduct(product)}
                              aria-label={`Hapus ${product.name}`}
                              className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#DFB9C7] bg-white text-[#9D254E] hover:bg-[#EED2DC] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          disabled={outOfStock}
                          onClick={() => onAddToCart(product)}
                          className="h-10 px-4 inline-flex items-center gap-1.5 rounded-xl bg-[#BA3360] text-white text-xs sm:text-sm font-semibold hover:bg-[#9D254E] disabled:bg-[#DFC6D0] disabled:text-[#5F424E] disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <Plus className="w-4 h-4" aria-hidden="true" />
                          <span>Keranjang</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
