import React from 'react';
import { ArrowRight } from 'lucide-react';
import { CatPawIcon } from './CatIcons';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  onExploreCatalog: () => void;
  onSelectCategory: (
    category:
      | 'Makanan Kering'
      | 'Makanan Basah'
      | 'Snack / Krim'
      | 'Perawatan / Grooming'
      | 'Aksesoris Grooming'
  ) => void;
}

export function HeroSection({ onExploreCatalog, onSelectCategory }: HeroSectionProps) {
  return (
    <section id="beranda" className="pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch bg-[#EED2DC] border border-[#DFB9C7] rounded-3xl p-6 sm:p-8 lg:p-10">
          {/* Kolom Kiri: Copy Editorial Lembut */}
          <div className="lg:col-span-6 flex flex-col justify-center gap-5">
            <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#9D254E]">
              <CatPawIcon className="w-4 h-4" />
              <span>Butik Nutrisi & Perawatan Kucing · Segar & Terpercaya</span>
            </p>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#362029] leading-[1.15] tracking-tight text-balance">
              Makanan & perawatan penuh cinta untuk anabul kesayanganmu.
            </h1>

            <p className="text-base text-[#5F424E] leading-relaxed max-w-xl">
              Pilihan pakan harian bernutrisi seimbang hingga perlengkapan grooming pastel—dari
              makanan kering & basah Me-O dan Whiskas, snack creamy, sampai shampo & sisir pink.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onExploreCatalog}
                className="h-12 px-6 inline-flex items-center gap-2.5 rounded-2xl bg-[#BA3360] text-white text-sm font-semibold hover:bg-[#9D254E] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Jelajahi Katalog</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectCategory('Perawatan / Grooming');
                  onExploreCatalog();
                }}
                className="h-12 px-5 inline-flex items-center rounded-2xl bg-[#FCF4F7] border border-[#DFB9C7] text-sm font-semibold text-[#362029] hover:border-[#BA3360] hover:text-[#BA3360] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Lihat Produk Grooming
              </button>
            </div>
          </div>

          {/* Kolom Kanan: Foto Kucing Pastel */}
          <div className="lg:col-span-6">
            <div className="relative h-64 sm:h-80 lg:h-full min-h-[280px] rounded-2xl overflow-hidden border border-[#F3DCE4] bg-white">
              <ResilientImage
                src="/src/assets/images/hero_pastel_cat_1794922006395.jpg"
                alt="Kucing Ragdoll berbulu lembut di samping mangkuk keramik pink berisi makanan kucing"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Baris Kepercayaan Singkat (Tanpa Pill) */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 px-2 text-sm text-[#70525E]">
          <div className="flex flex-col gap-0.5 border-b sm:border-b-0 sm:border-r border-[#F3DCE4] pb-3 sm:pb-0 sm:pr-6">
            <span className="font-display font-bold text-[#362029] text-base">
              100% Bahan Alami Pilihan
            </span>
            <span>Tinggi protein hewani asli tanpa pewarna sintetis.</span>
          </div>
          <div className="flex flex-col gap-0.5 border-b sm:border-b-0 sm:border-r border-[#F3DCE4] pb-3 sm:pb-0 sm:pr-6">
            <span className="font-display font-bold text-[#362029] text-base">
              Gratis Ongkir Jabodetabek
            </span>
            <span>Berlaku untuk minimum belanja Rp 150.000 per pesanan.</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-display font-bold text-[#362029] text-base">
              Pengemasan Aman & Rapi
            </span>
            <span>Dikirim di hari yang sama dengan segel kesegaran terjaga.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
