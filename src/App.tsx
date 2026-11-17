/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AlertTriangle, X } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import {
  CategoryFilter,
  ProductCatalog,
  SortOption,
} from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminProductModal } from './components/AdminProductModal';
import { AdminRoute } from './components/AdminRoute';
import { NutritionGuideSection } from './components/NutritionGuideSection';
import { Footer } from './components/Footer';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CartItem, Product, ProductInput, UserProfile } from './types/shop';
import { INITIAL_PRODUCTS } from './data/products';
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  restoreActiveSession,
  signOutSession,
  updateProduct,
} from './services/shopService';
import { isSupabaseConfigured, supabase } from './lib/supabase';

const CART_STORAGE_KEY = 'miepetshop_cart_v1';

interface ToastState {
  message: string;
  variant: 'info' | 'error';
}

export default function App() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('Semua');
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, variant: 'info' | 'error' = 'info') => {
    setToast({ message, variant });
  }, []);

  const handleAccessDenied = useCallback(
    (message: string) => {
      showToast(message, 'error');
    },
    [showToast]
  );

  useEffect(() => {
    if (!toast) return;
    const duration = toast.variant === 'error' ? 5000 : 3000;
    const timer = window.setTimeout(() => setToast(null), duration);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let active = true;

    restoreActiveSession()
      .then((user) => {
        if (active) setCurrentUser(user);
      })
      .catch(() => {
        if (active) setCurrentUser(null);
      });

    if (supabase && isSupabaseConfigured) {
      const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          if (active) setCurrentUser(null);
        } else {
          restoreActiveSession()
            .then((user) => {
              if (active) setCurrentUser(user);
            })
            .catch(() => undefined);
        }
      });
      return () => {
        active = false;
        subscription.subscription.unsubscribe();
      };
    }

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoadingProducts(true);
    fetchProducts()
      .then((list) => {
        if (active) setProducts(list);
      })
      .catch((err) => {
        if (active) {
          setProducts(INITIAL_PRODUCTS);
          showToast(
            err instanceof Error ? err.message : 'Gagal memuat katalog produk.',
            'error'
          );
        }
      })
      .finally(() => {
        if (active) setLoadingProducts(false);
      });
    return () => {
      active = false;
    };
  }, [showToast]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Abaikan jika penyimpanan lokal penuh
    }
  }, [cart]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = products.filter((item) => {
      const matchesCategory =
        selectedCategory === 'Semua' || item.category === selectedCategory;
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query) ||
        item.flavor.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

    if (sortBy === 'price-asc') {
      return [...filtered].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...filtered].sort((a, b) => b.price - a.price);
    }
    return [...filtered].sort(
      (a, b) => Number(Boolean(b.isBestSeller)) - Number(Boolean(a.isBestSeller))
    );
  }, [products, searchQuery, selectedCategory, sortBy]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const handleAddToCart = (product: Product, qty = 1) => {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const nextQty = Math.min(product.stock, existing.quantity + qty);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: nextQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, qty) }];
    });
    showToast(`${product.name} ditambahkan ke keranjang.`);
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(item.product.stock, quantity) }
          : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleSaveProduct = async (input: ProductInput, existingId?: string) => {
    if (existingId) {
      const updated = await updateProduct(existingId, input);
      setProducts((prev) =>
        prev.map((item) => (item.id === existingId ? updated : item))
      );
      showToast(`Produk "${updated.name}" berhasil diperbarui.`);
    } else {
      const created = await createProduct(input);
      setProducts((prev) => [created, ...prev]);
      showToast(`Produk "${created.name}" berhasil ditambahkan.`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((item) => item.id !== productToDelete.id));
      setCart((prev) =>
        prev.filter((item) => item.product.id !== productToDelete.id)
      );
      showToast(`Produk "${productToDelete.name}" dihapus.`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Gagal menghapus produk.',
        'error'
      );
    } finally {
      setProductToDelete(null);
    }
  };

  const handleSignOut = async () => {
    await signOutSession();
    setCurrentUser(null);
    showToast('Kamu telah keluar dari akun.');
    navigate('/', { replace: true });
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('katalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen flex flex-col bg-[#F6E2E9] text-[#362029]">
              <Navbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                cartCount={cartCount}
                onOpenCart={() => setIsCartOpen(true)}
                currentUser={currentUser}
                onOpenAuth={() => navigate('/login')}
                onOpenAdminPanel={() => navigate('/admin')}
                onSignOut={handleSignOut}
              />

              <main className="flex-1">
                <HeroSection
                  onExploreCatalog={scrollToCatalog}
                  onSelectCategory={(category) => setSelectedCategory(category)}
                />

                <ProductCatalog
                  products={filteredProducts}
                  loading={loadingProducts}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  searchQuery={searchQuery}
                  onClearSearch={() => setSearchQuery('')}
                  onAddToCart={(product) => handleAddToCart(product, 1)}
                  onSelectProduct={(product) => setSelectedProduct(product)}
                  currentUser={currentUser}
                  onOpenAddProduct={() => {
                    setEditingProduct(null);
                    setIsAdminModalOpen(true);
                  }}
                  onEditProduct={(product) => {
                    setEditingProduct(product);
                    setIsAdminModalOpen(true);
                  }}
                  onDeleteProduct={(product) => setProductToDelete(product)}
                />

                <NutritionGuideSection />
              </main>

              <Footer />

              <ProductDetailModal
                key={selectedProduct?.id ?? 'closed'}
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onAddToCart={handleAddToCart}
              />

              <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                items={cart}
                onUpdateQty={handleUpdateCartQty}
                onRemoveItem={handleRemoveCartItem}
                onClearCart={handleClearCart}
                currentUser={currentUser}
              />
            </div>
          }
        />

        <Route
          path="/login"
          element={
            <LoginPage
              currentUser={currentUser}
              onSuccess={(user) => {
                setCurrentUser(user);
                showToast(`Selamat datang, ${user.fullName}!`);
              }}
            />
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute onAccessDenied={handleAccessDenied}>
              <AdminDashboardPage
                products={products}
                loadingProducts={loadingProducts}
                currentUser={currentUser}
                onOpenAddProduct={() => {
                  setEditingProduct(null);
                  setIsAdminModalOpen(true);
                }}
                onEditProduct={(product) => {
                  setEditingProduct(product);
                  setIsAdminModalOpen(true);
                }}
                onDeleteProduct={(product) => setProductToDelete(product)}
                onSignOut={handleSignOut}
              />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AdminProductModal
        isOpen={isAdminModalOpen}
        editingProduct={editingProduct}
        onClose={() => {
          setIsAdminModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      {/* Konfirmasi Hapus Produk (Tanpa window.confirm) */}
      {productToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#362029]/45 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          onClick={() => setProductToDelete(null)}
        >
          <div
            className="w-full max-w-sm bg-[#FCF4F7] border border-[#E4C3CF] rounded-3xl p-6 shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="delete-confirm-title"
              className="font-display text-lg font-bold text-[#362029]"
            >
              Hapus produk ini?
            </h3>
            <p className="text-sm text-[#5F424E]">
              Produk <strong className="text-[#362029]">{productToDelete.name}</strong>{' '}
              akan dihapus dari katalog toko.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="h-10 px-4 rounded-xl border border-[#DFB9C7] bg-white text-sm font-medium text-[#362029] hover:bg-[#EED2DC] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="h-10 px-4 rounded-xl bg-[#9D254E] text-white text-sm font-semibold hover:bg-[#821C3F] cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifikasi Toast & Peringatan Akses */}
      {toast &&
        (toast.variant === 'error' ? (
          <div
            role="alert"
            aria-live="assertive"
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md px-4 py-3.5 rounded-2xl bg-[#9D254E] text-white text-sm font-semibold shadow-xl border border-[#FCF4F7]/30 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Tutup peringatan"
              className="p-1 rounded-lg hover:bg-white/15 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-50 max-w-sm px-4 py-3 rounded-2xl bg-[#362029] text-white text-sm font-medium shadow-lg border border-[#F3DCE4]/20"
          >
            {toast.message}
          </div>
        ))}
    </>
  );
}
