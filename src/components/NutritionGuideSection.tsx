import React from 'react';

export function NutritionGuideSection() {
  const tips = [
    {
      index: '01.',
      title: 'Kombinasi Dry & Wet Food',
      body: 'Kibble renyah membantu menjaga kebersihan gigi dari karang, sementara wet food dengan kadar air tinggi menjaga kesehatan ginjal dan saluran kemih kucing.',
    },
    {
      index: '02.',
      title: 'Sesuaikan Usia Anabul',
      body: 'Anak kucing usia 1–12 bulan memerlukan protein lebih tinggi serta DHA untuk perkembangan otak, sedangkan kucing dewasa rumahan membutuhkan kontrol kalori dan anti-hairball.',
    },
    {
      index: '03.',
      title: 'Simpan di Wadah Kedap Udara',
      body: 'Selalu tutup rapat kemasan ziplock setelah menuangkan kibble dan sajikan wet food pada suhu ruang agar aroma ikan alaminya tetap menggugah selera.',
    },
  ];

  return (
    <section
      id="panduan"
      className="py-12 sm:py-16 border-t border-[#E4C3CF] bg-[#EED2DC]/80"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-[#9D254E] mb-1">
            Panduan Perawatan · MiePetShop
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#362029] tracking-tight text-balance">
            Cara sederhana memilih pakan terbaik setiap hari
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {tips.map((tip) => (
            <div
              key={tip.index}
              className="bg-[#FCF4F7] border border-[#E4C3CF] rounded-2xl p-6 flex flex-col gap-3"
            >
              <span className="font-display text-sm font-bold text-[#BA3360]">
                {tip.index}
              </span>
              <h3 className="font-display text-lg font-bold text-[#362029]">
                {tip.title}
              </h3>
              <p className="text-sm text-[#5F424E] leading-relaxed">{tip.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
