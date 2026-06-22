import { Link } from 'react-router-dom';
import { Zap, Clock, Crown, AlertTriangle } from 'lucide-react';
import { useModalStore } from '../../store/modalStore';

export function SubscriptionBanner({ plan, expiresAt, daysLeft, isExpiringSoon }) {
  const { openModal } = useModalStore();

  if (plan === 'free') {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white shadow-lg">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 right-20 h-24 w-24 rounded-full bg-white/5" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg">Tingkatkan ke Pro Plan</p>
              <p className="text-sm text-violet-200 mt-0.5">
                Unlock AI Insight, Export PDF tanpa batas, dan berbagi laporan ke klien Anda.
              </p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-violet-700 hover:bg-violet-50 transition-colors shadow"
          >
            Upgrade Sekarang →
          </button>
        </div>
      </div>
    );
  }

  if (isExpiringSoon) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white shadow-lg">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg">Langganan Anda segera berakhir!</p>
              <p className="text-sm text-amber-100 mt-0.5">
                Sisa <strong>{daysLeft} hari</strong> — expired{' '}
                {expiresAt?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.
              </p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-amber-600 hover:bg-amber-50 transition-colors shadow"
          >
            Perpanjang Sekarang →
          </button>
        </div>
      </div>
    );
  }

  // Active paid plan
  const progressPct = daysLeft !== null ? Math.min(100, Math.round((daysLeft / 30) * 100)) : 100;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white shadow-lg">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg capitalize">{plan} Plan — Aktif</p>
            {expiresAt && (
              <>
                <p className="text-sm text-emerald-100 mt-0.5">
                  Berlaku hingga{' '}
                  {expiresAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {daysLeft !== null && ` (${daysLeft} hari lagi)`}
                </p>
                <div className="mt-2 h-1.5 w-full max-w-xs rounded-full bg-white/20">
                  <div
                    className="h-1.5 rounded-full bg-white transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Clock className="h-4 w-4 text-emerald-200" />
          <span className="text-sm text-emerald-100">
            {daysLeft !== null ? `${daysLeft} hari tersisa` : 'RepoChart Beta'}
          </span>
        </div>
      </div>
    </div>
  );
}
