import React, { useEffect, useState } from 'react';
import { ArrowRight, UserCheck, MessageSquare, Rocket, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';

const BETA_QUOTA = 50;

export function BetaProgram() {
  const [userCount, setUserCount] = useState(null);

  useEffect(() => {
    api.get('/settings/public')
      .then(res => setUserCount(res.data.user_count ?? 0))
      .catch(() => setUserCount(null));
  }, []);

  const remaining = userCount !== null ? Math.max(0, BETA_QUOTA - userCount) : null;
  const filledPct = userCount !== null ? Math.min(100, (userCount / BETA_QUOTA) * 100) : 0;

  const benefits = [
    {
      icon: <UserCheck className="h-6 w-6 text-emerald-500" />,
      title: "Gratis Selama Uji Beta",
      description: "Beta tester dapat akses penuh fitur Pro selama periode beta — tanpa bayar. Sebagai apresiasi atas feedback yang kamu berikan."
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-violet-500" />,
      title: "Diskusi Langsung dengan Developer",
      description: "Butuh rumus metrik khusus atau template platform iklan tertentu yang belum ada? Sampaikan langsung di grup komunitas eksklusif. Request dari pengguna Beta akan didahulukan dalam antrean pengembangan sistem."
    },
    {
      icon: <Rocket className="h-6 w-6 text-blue-500" />,
      title: "Coba Fitur Baru Lebih Cepat",
      description: "Dapatkan kesempatan menguji modul-modul premium masa depan seperti kalkulasi kustom lebih awal dari publik untuk selalu selangkah lebih maju dalam memberikan teknologi laporan terbaik kepada klien Anda."
    }
  ];

  return (
    <section id="beta" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-violet-200/50 rounded-full blur-3xl opacity-50 mix-blend-multiply" />
        <div className="absolute bottom-1/4 -right-64 w-[500px] h-[500px] bg-emerald-200/50 rounded-full blur-3xl opacity-50 mix-blend-multiply" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            RepoChart Beta Program
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Jadilah bagian dari RepoChart Beta Program
          </h2>
          <p className="text-lg text-slate-600">
            Ikut membentuk platform analisis laporan iklan terbaik di Indonesia. Kami membuka kuota terbatas untuk <strong className="text-slate-900">50 pendaftar pertama</strong> minggu ini.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Live Slot Counter */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                <Users className="w-4 h-4 text-violet-500" />
                Sisa Slot Beta
              </div>
              <div className="text-right">
                {remaining === null ? (
                  <span className="text-slate-400 text-sm">Memuat...</span>
                ) : remaining === 0 ? (
                  <span className="text-red-600 font-bold text-sm">Slot Penuh</span>
                ) : (
                  <span className="font-bold text-violet-600 text-lg">
                    {remaining} <span className="text-slate-400 text-sm font-normal">/ {BETA_QUOTA}</span>
                  </span>
                )}
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-700"
                style={{ width: `${filledPct}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              {userCount !== null ? `${userCount} orang sudah bergabung` : '—'}
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Klaim Akses Beta Sekarang
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
