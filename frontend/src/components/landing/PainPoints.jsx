import { useLanguage } from '../../hooks/useLanguage';
import { Clock, Frown, FileX } from 'lucide-react';

export const PainPoints = () => {
  const { t } = useLanguage();

  const pains = [
    {
      icon: <Clock className="w-6 h-6 text-rose-500" />,
      title: t('Copy-paste yang melelahkan', 'Tiring copy-paste'),
      desc: t(
        'Export CSV dari Meta Ads → buka Excel → copy angka satu per satu → paste ke Canva. Berulang untuk setiap klien setiap bulan.',
        'Export CSV from Meta Ads → open Excel → copy numbers one by one → paste to Canva. Repeat for every client every month.'
      )
    },
    {
      icon: <Frown className="w-6 h-6 text-rose-500" />,
      title: t('Tools yang terlalu rumit', 'Overly complex tools'),
      desc: t(
        'Looker Studio gratis tapi setup-nya rumit. Supermetrics bagus tapi harganya $50/bulan. Tidak ada yang pas untuk freelancer.',
        'Looker Studio is free but complex to set up. Supermetrics is great but costs $50/mo. Nothing fits freelancers well.'
      )
    },
    {
      icon: <FileX className="w-6 h-6 text-rose-500" />,
      title: t('Laporan yang tidak profesional', 'Unprofessional reports'),
      desc: t(
        'Klien terima screenshot grafik dari HP atau file Excel yang tidak rapi. Susah terlihat profesional dengan cara manual.',
        'Clients receive chart screenshots from phones or messy Excel files. Hard to look professional manually.'
      )
    }
  ];

  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {t('Buat laporan klien itu buang waktu', 'Creating client reports wastes your time')}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t(
              'Rata-rata freelancer digital marketing habiskan 2–4 jam per klien hanya untuk buat laporan bulanan.',
              'The average digital marketing freelancer spends 2–4 hours per client just to create monthly reports.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pains.map((pain, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-6">
                {pain.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{pain.title}</h3>
              <p className="text-slate-600 leading-relaxed">{pain.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
