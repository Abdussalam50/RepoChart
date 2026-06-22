import { useLanguage } from '../../hooks/useLanguage';

export const Testimonials = () => {
  const { t } = useLanguage();

  const testimonials = [
    {
      quote: t(
        "Dulu buat laporan 1 klien bisa 3 jam. Sekarang 5 menit sudah selesai. Klien saya juga lebih senang karena laporannya terlihat profesional.",
        "Used to take 3 hours for 1 client report. Now it's done in 5 minutes. My clients are also happier because the reports look professional."
      ),
      name: "Andi S.",
      role: "Freelancer Meta Ads",
      location: "Jakarta"
    },
    {
      quote: t(
        "Fitur shareable dashboard adalah game changer. Klien bisa pantau performa sendiri kapan saja. Mereka nanya lebih sedikit, kepercayaan mereka naik.",
        "The shareable dashboard is a game changer. Clients can monitor performance themselves anytime. They ask less, trust goes up."
      ),
      name: "Budi R.",
      role: "Digital Marketing Specialist",
      location: "Surabaya"
    },
    {
      quote: t(
        "AI Insight-nya yang paling saya suka. Langsung kasih rekomendasi scaling dan budget shifting berdasarkan data — persis seperti yang saya butuhkan.",
        "I love the AI Insight most. Instantly gives scaling and budget shifting recommendations based on data — exactly what I need."
      ),
      name: "Citra M.",
      role: "Founder Agensi Digital",
      location: "Bandung"
    }
  ];

  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {t('Kata mereka', 'What they say')}
          </h2>
          <p className="text-lg text-slate-600">
            {t('Beta user pertama yang sudah mencoba RepoChart.', 'First beta users who have tried RepoChart.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testi, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex gap-1 text-amber-400 mb-6 text-xl">★★★★★</div>
              <p className="text-slate-700 leading-relaxed mb-6 italic">"{testi.quote}"</p>
              <div>
                <div className="font-bold text-slate-900">{testi.name}</div>
                <div className="text-sm text-slate-500">{testi.role} · {testi.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
