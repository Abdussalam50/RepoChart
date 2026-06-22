import { useLanguage } from '../../hooks/useLanguage';

export const FAQ = () => {
  const { t } = useLanguage();

  const faqs = [
    {
      q: t('Apakah data mentah saya aman?', 'Is my CSV data safe?'),
      a: t(
        'Ya. data mentah akan dihapus otomatis dari server setelah diproses. Yang tersimpan di database hanya hasil kalkulasinya, bukan file mentah. Data klien kamu tidak pernah tersimpan lama di server kami.',
        'Yes. raw files are automatically deleted from the server after processing. Only calculation results are stored in the database — not raw files. Your client data is never stored long-term on our servers.'
      )
    },
    {
      q: t('Platform ads apa saja yang didukung?', 'Which ad platforms are supported?'),
      a: t(
        'Meta Ads, Google Ads, dan TikTok Ads sudah didukung dengan template default. CSV dari platform lain juga bisa diupload dalam mode generik.',
        'Meta Ads, Google Ads, and TikTok Ads are supported with default templates. CSVs from other platforms can also be uploaded in generic mode.'
      )
    },
    {
      q: t('Apakah klien saya perlu daftar untuk lihat dashboard?', 'Do my clients need to register to view the dashboard?'),
      a: t(
        'Tidak. Shareable dashboard bisa dibuka siapapun hanya dengan link — tanpa login, tanpa install apapun.',
        'No. The shareable dashboard can be opened by anyone with the link — no login, no installation required.'
      )
    },
    {
      q: t('Bisa cancel kapan saja?', 'Can I cancel anytime?'),
      a: t(
        'Ya. Tidak ada kontrak atau commitment jangka panjang. Subscription bulanan bisa tidak diperpanjang kapan saja.',
        'Yes. There are no contracts or long-term commitments. Monthly subscriptions can be cancelled at any time.'
      )
    },
    {
      q: t('Bagaimana cara bayarnya?', 'How do I pay?'),
      a: t(
        'Transfer bank, QRIS, GoPay, OVO, Dana, dan virtual account semua tersedia.',
        'Bank transfers, QRIS, GoPay, OVO, Dana, and virtual accounts are all available.'
      )
    }
  ];

  return (
    <section id="faq" className="py-20 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          {t('Pertanyaan yang sering ditanyakan', 'Frequently asked questions')}
        </h2>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h3>
            <p className="text-slate-600 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
