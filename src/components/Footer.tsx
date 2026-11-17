import React from 'react';
import { CatBrandMark } from './CatIcons';

export function Footer() {
  return (
    <footer className="bg-[#FAF0F4] border-t border-[#E4C3CF] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[#362029]">
            <CatBrandMark className="w-6 h-6" />
            <span className="font-display text-lg font-bold">MiePetShop</span>
          </div>
          <p className="text-xs sm:text-sm text-[#5F424E]">
            Butik makanan kucing bernutrisi lembut · Buka setiap hari 08.00–21.00 WIB
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-[#5F424E]">
          <a href="#beranda" className="hover:text-[#BA3360] transition-colors">
            Beranda
          </a>
          <a href="#katalog" className="hover:text-[#BA3360] transition-colors">
            Katalog
          </a>
          <a href="#panduan" className="hover:text-[#BA3360] transition-colors">
            Panduan Gizi
          </a>
          <span className="text-[#7E5D6B]">© 2026 MiePetShop</span>
        </div>
      </div>
    </footer>
  );
}
