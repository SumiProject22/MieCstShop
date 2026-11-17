import React, { useState } from 'react';
import { Menu, Search, ShoppingBag, User, X, ShieldCheck, LogOut } from 'lucide-react';
import { CatBrandMark } from './CatIcons';
import { UserProfile } from '../types/shop';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenAdminPanel: () => void;
  onSignOut: () => void;
}

export function Navbar({
  searchQuery,
  onSearchChange,
  cartCount,
  onOpenCart,
  currentUser,
  onOpenAuth,
  onOpenAdminPanel,
  onSignOut,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const scrollToCatalog = () => {
    const el = document.getElementById('katalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF0F4]/95 backdrop-blur-md border-b border-[#E4C3CF]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zona 1: Brand Wordmark */}
        <a
          href="#beranda"
          className="flex items-center gap-2.5 text-[#362029] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BA3360] rounded-lg"
        >
          <CatBrandMark className="w-8 h-8 shrink-0" />
          <span className="font-display text-xl font-bold tracking-tight">
            MiePetShop
          </span>
        </a>

        {/* Zona 2: Nav Links & Pencarian Desktop */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
          <nav className="flex items-center gap-6 text-sm font-medium text-[#5F424E]">
            <a
              href="#beranda"
              className="hover:text-[#BA3360] transition-colors whitespace-nowrap shrink-0 py-1"
            >
              Beranda
            </a>
            <a
              href="#katalog"
              className="hover:text-[#BA3360] transition-colors whitespace-nowrap shrink-0 py-1"
            >
              Katalog
            </a>
            <a
              href="#panduan"
              className="hover:text-[#BA3360] transition-colors whitespace-nowrap shrink-0 py-1"
            >
              Panduan Gizi
            </a>
          </nav>

          <div className="relative w-full max-w-xs">
            <Search
              className="w-4 h-4 text-[#7D5E6A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (e.target.value.trim().length === 1) {
                  scrollToCatalog();
                }
              }}
              placeholder="Cari salmon, kitten, snack..."
              aria-label="Cari produk makanan kucing"
              className="w-full h-10 pl-10 pr-8 rounded-xl bg-[#EED2DC]/75 border border-[#DFB9C7] text-sm text-[#362029] placeholder:text-[#7D5E6A] focus:outline-none focus:bg-white focus:border-[#BA3360] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Hapus pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#5F424E] hover:text-[#362029]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Zona 3: Aksi (Cari Mobile, Keranjang, Login/Akun) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            aria-label="Buka pencarian"
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl text-[#362029] hover:bg-[#EED2DC] transition-colors"
          >
            {mobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Buka keranjang belanja, ${cartCount} item`}
            className="relative h-11 px-3 sm:px-3.5 flex items-center gap-2 rounded-xl bg-[#EED2DC]/80 border border-[#DFB9C7] text-[#362029] hover:border-[#BA3360] transition-colors whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="w-4 h-4 text-[#BA3360]" aria-hidden="true" />
            <span className="hidden sm:inline text-sm font-medium">Keranjang</span>
            <span className="tabular-nums text-xs font-bold min-w-[20px] h-5 px-1.5 rounded-md bg-[#BA3360] text-white flex items-center justify-center">
              {cartCount}
            </span>
          </button>

          {currentUser ? (
            <div className="hidden sm:flex items-center gap-2">
              {currentUser.role === 'admin' && (
                <button
                  type="button"
                  onClick={onOpenAdminPanel}
                  className="h-11 px-3.5 flex items-center gap-1.5 rounded-xl bg-[#362029] text-white text-sm font-medium hover:bg-[#4D2E3B] transition-colors whitespace-nowrap shrink-0"
                >
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <span>Panel Admin</span>
                </button>
              )}
              <button
                type="button"
                onClick={onSignOut}
                title={`Masuk sebagai ${currentUser.fullName} (${currentUser.role})`}
                className="h-11 px-3.5 flex items-center gap-2 rounded-xl border border-[#DFB9C7] bg-[#FCF4F7] text-sm font-medium text-[#362029] hover:bg-[#EED2DC] transition-colors whitespace-nowrap shrink-0"
              >
                <span className="max-w-[110px] truncate">{currentUser.fullName}</span>
                <LogOut className="w-4 h-4 text-[#5F424E]" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="hidden sm:flex h-11 px-4 items-center gap-2 rounded-xl bg-[#BA3360] text-white text-sm font-semibold hover:bg-[#9D254E] transition-colors whitespace-nowrap shrink-0"
            >
              <User className="w-4 h-4" aria-hidden="true" />
              <span>Masuk / Daftar</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Menu navigasi"
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl text-[#362029] hover:bg-[#EED2DC] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Pencarian Mobile (Expandable) */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 pb-3 pt-1 bg-[#FAF0F4] border-t border-[#E4C3CF]">
          <div className="relative">
            <Search
              className="w-4 h-4 text-[#7D5E6A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                scrollToCatalog();
              }}
              placeholder="Cari makanan kucing..."
              aria-label="Cari produk makanan kucing"
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-white border border-[#DFB9C7] text-sm text-[#362029] placeholder:text-[#7D5E6A] focus:outline-none focus:border-[#BA3360]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Hapus pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[#5F424E]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-4 bg-[#FCF4F7] border-t border-[#E4C3CF] space-y-3">
          <nav className="flex flex-col gap-1">
            <a
              href="#beranda"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-[#362029] hover:bg-[#EED2DC]"
            >
              Beranda
            </a>
            <a
              href="#katalog"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-[#362029] hover:bg-[#EED2DC]"
            >
              Katalog Produk
            </a>
            <a
              href="#panduan"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-[#362029] hover:bg-[#EED2DC]"
            >
              Panduan Gizi
            </a>
          </nav>

          <div className="pt-3 border-t border-[#E4C3CF] flex flex-col gap-2">
            {currentUser ? (
              <>
                <div className="px-3 py-1 text-xs text-[#5F424E]">
                  Masuk sebagai <strong className="text-[#362029]">{currentUser.fullName}</strong> ·{' '}
                  {currentUser.role === 'admin' ? 'Admin Toko' : 'Pembeli'}
                </div>
                {currentUser.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdminPanel();
                    }}
                    className="w-full h-11 px-4 flex items-center justify-center gap-2 rounded-xl bg-[#362029] text-white text-sm font-semibold"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Kelola Produk (Admin)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full h-11 px-4 flex items-center justify-center gap-2 rounded-xl border border-[#DFB9C7] bg-white text-[#362029] text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Akun</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full h-11 px-4 flex items-center justify-center gap-2 rounded-xl bg-[#BA3360] text-white text-sm font-semibold"
              >
                <User className="w-4 h-4" />
                <span>Masuk / Daftar Akun</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
