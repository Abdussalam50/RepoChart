import { Link } from 'react-router-dom';
import {
  Users, FileBarChart2, Upload, BarChart3,
  Plus, Loader2, ArrowRight, CalendarDays, TrendingUp,
} from 'lucide-react';

import { PageWrapper }        from '../../components/layout/PageWrapper';
import { ClientCard }         from '../../components/client/ClientCard';
import { SubscriptionBanner } from '../../components/dashboard/SubscriptionBanner';
import { QuickActionCard }    from '../../components/dashboard/QuickActionCard';
import { RecentReportRow }    from '../../components/dashboard/RecentReportRow';
import { BetaActivationCard } from '../../components/dashboard/BetaActivationCard';
import { useDashboardData }   from '../../hooks/useDashboardData';
import { useAuthStore }       from '../../store/authStore';
import { useModalStore }      from '../../store/modalStore';

function StatCard({ label, value, icon: Icon, color, sub }) {
  const colors = {
    violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  ring: 'ring-violet-100' },
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    ring: 'ring-blue-100'   },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100'},
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   ring: 'ring-amber-100'  },
  };
  const c = colors[color] ?? colors.violet;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-4 ${c.bg} ${c.ring}`}>
        <Icon className={`h-6 w-6 ${c.text}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user }    = useAuthStore();
  const { openModal } = useModalStore();
  const {
    loading,
    clients,
    reports,
    recentReports,
    recentClients,
    thisMonthCount,
    plan,
    expiresAt,
    daysLeft,
    isExpiringSoon,
  } = useDashboardData();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 17 ? 'Selamat siang' : 'Selamat malam';

  return (
    <PageWrapper>
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      ) : (
        <div className="space-y-8">

          {/* ── Section A: Greeting + Subscription Banner ── */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {greeting}, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Berikut ringkasan aktivitas dan status akun Anda hari ini.
              </p>
            </div>
            <SubscriptionBanner
              plan={plan}
              expiresAt={expiresAt}
              daysLeft={daysLeft}
              isExpiringSoon={isExpiringSoon}
            />
            {plan === 'free' && (
              <BetaActivationCard />
            )}
          </div>

          {/* ── Section B: Stats Cards ── */}
          <div>
            <h2 className="mb-4 text-base font-semibold text-slate-700">Statistik Anda</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total Klien"
                value={clients.length}
                icon={Users}
                color="violet"
                sub={clients.length === 0 ? 'Belum ada klien' : `${clients.length} klien terdaftar`}
              />
              <StatCard
                label="Total Laporan"
                value={reports.length}
                icon={FileBarChart2}
                color="blue"
                sub={reports.length === 0 ? 'Belum ada laporan' : `${reports.length} laporan dibuat`}
              />
              <StatCard
                label="Laporan Bulan Ini"
                value={thisMonthCount}
                icon={CalendarDays}
                color="emerald"
                sub={new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              />
              <StatCard
                label="Plan Aktif"
                value={plan.charAt(0).toUpperCase() + plan.slice(1)}
                icon={TrendingUp}
                color="amber"
                sub={daysLeft !== null ? `${daysLeft} hari tersisa` : 'Repo Chart Beta'}
              />
            </div>
          </div>

          {/* ── Section C: Recent Reports ── */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-700">Laporan Terbaru</h2>
              <Link
                to="/reports"
                className="flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
              >
                Lihat semua <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentReports.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <FileBarChart2 className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-600">Belum ada laporan</p>
                <p className="mt-1 text-xs text-slate-400">Buat laporan pertama Anda untuk mulai menganalisis data klien.</p>
                <Link
                  to="/reports"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Buat Laporan
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Laporan</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Klien</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Status</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Tanggal</th>
                      <th className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentReports.map((report) => (
                      <RecentReportRow key={report.id} report={report} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Section D & E: Recent Clients + Quick Actions (side by side) ── */}
          <div className="grid gap-8 lg:grid-cols-5">

            {/* Recent Clients — 3/5 width */}
            <div className="lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-700">Klien Terbaru</h2>
                <Link
                  to="/clients"
                  className="flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
                >
                  Lihat semua <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {recentClients.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <Users className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-600">Belum ada klien</p>
                  <p className="mt-1 text-xs text-slate-400">Mulai dengan menambahkan profil klien pertama Anda.</p>
                  <Link
                    to="/clients/new"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Tambah Klien
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {recentClients.map((client) => (
                    <ClientCard key={client.id} client={client} />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions — 2/5 width */}
            <div className="lg:col-span-2 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="mb-2 text-base font-semibold text-slate-700 bg-slate-100 px-4 mt-2 rounded-lg">Aksi Cepat</h2>
              <div className="flex flex-col gap-3 bg-white p-3">
                <QuickActionCard
                  icon={FileBarChart2}
                  label="Buat Laporan Baru"
                  description="Mulai laporan dari data CSV klien"
                  to="/reports"
                  color="violet"
                />
                <QuickActionCard
                  icon={Users}
                  label="Tambah Klien"
                  description="Daftarkan klien baru ke sistem"
                  to="/clients/new"
                  color="blue"
                />
                <QuickActionCard
                  icon={Upload}
                  label="Upload Data CSV"
                  description="Import data dari file spreadsheet"
                  to="/upload"
                  color="emerald"
                />

              </div>
            </div>

          </div>
        </div>
      )}
    </PageWrapper>
  );
}
