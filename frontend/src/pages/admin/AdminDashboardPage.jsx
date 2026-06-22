import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useAdminData } from '../../hooks/useAdminData';
import adminService from '../../api/adminService';
import { Link } from 'react-router-dom';

export function AdminDashboardPage() {
  const { data, loading, lastRefresh, refetch } = useAdminData();
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [expiringSubscriptions, setExpiringSubscriptions] = useState([]);

  useEffect(() => {
    // Fetch tables data
    adminService.getTransactions({ page: 1, status: 'all' }).then(res => setRecentTransactions(res.data.data.slice(0, 5)));
    adminService.getExpiringSubscriptions(7).then(res => setExpiringSubscriptions(res.data.slice(0, 5)));
  }, []);

  if (loading || !data) {
    return <div className="flex h-screen items-center justify-center">Loading dashboard...</div>;
  }

  const { overview, growth, retention } = data;
  const { today, totals, alerts, thresholds } = overview;

  // Growth Chart Options (Stacked Bar)
  const growthOptions = {
    chart: { type: 'bar', stacked: true, toolbar: { show: false } },
    colors: ['#8b5cf6', '#c4b5fd'],
    plotOptions: { bar: { horizontal: false } },
    xaxis: { categories: growth.labels },
    legend: { position: 'top', horizontalAlign: 'left' }
  };
  const growthSeries = [
    { name: 'Pro', data: growth.proData },
    { name: 'Free', data: growth.freeData }
  ];

  // MRR Chart Options (Line)
  const mrrOptions = {
    chart: { type: 'area', toolbar: { show: false } },
    colors: ['#10b981'],
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories: growth.labels },
    dataLabels: { enabled: false }
  };
  const mrrSeries = [
    { name: 'MRR', data: growth.mrrData },
    { name: 'Target', data: growth.mrrTarget }
  ];

  // Konversi Chart
  const convOptions = {
    chart: { type: 'line', toolbar: { show: false } },
    colors: ['#8b5cf6'],
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories: growth.labels },
    yaxis: { labels: { formatter: (val) => val + '%' } },
  };
  const convSeries = [{ name: 'Persentase upgrade per bulan', data: growth.convData }];

  // Segment Donut (Real Data from Backend)
  const segmentOptions = {
    chart: { type: 'donut' },
    labels: growth.segmentLabels?.length > 0 ? growth.segmentLabels : ['Belum ada data'],
    colors: ['#3b82f6', '#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e'],
    legend: { position: 'bottom' },
    noData: { text: 'Belum ada data segmen' }
  };
  const segmentSeries = growth.segmentData?.length > 0 ? growth.segmentData : [0];

  const formatIDR = (num) => {
    if (num >= 1000000) return `Rp ${(num/1000000).toFixed(1)}Jt`;
    if (num >= 1000) return `Rp ${(num/1000).toFixed(0)}rb`;
    return `Rp ${num}`;
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin dashboard RepoChart — metrik user, transaksi, subscription, dan retensi</h1>
          <p className="text-sm text-slate-500 mt-1">RepoChart - Solo Founder View</p>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <button onClick={refetch} className="hover:text-slate-600 cursor-pointer">
             &#x21bb; Refresh
          </button>
          <span>
            {lastRefresh ? `${Math.floor((Date.now() - lastRefresh) / 1000)}s ago` : 'Loading...'}
          </span>
        </div>
      </div>

      {/* RINGKASAN HARI INI */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4 tracking-wider">RINGKASAN HARI INI</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-slate-600 mb-1">Total user</p>
            <p className="text-3xl font-bold">{totals.totalUsers}</p>
            <p className="text-xs text-emerald-600 mt-1">+{today.new_users} hari ini</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">User Pro aktif</p>
            <p className="text-3xl font-bold">{totals.proActive}</p>
            <p className="text-xs text-emerald-600 mt-1">+{today.new_pro} hari ini</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">MRR</p>
            <p className="text-3xl font-bold">{formatIDR(totals.mrr)}</p>
            <p className="text-xs text-emerald-600 mt-1">Asumsi pertumbuhan (coming soon)</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Churn bulan ini</p>
            <p className="text-3xl font-bold">{Math.floor((totals.churnRate / 100) * totals.proActive)}</p>
            <p className="text-xs text-slate-500 mt-1">{totals.churnRate}% churn rate</p>
          </div>
        </div>
      </section>

      {/* CHARTS */}
      <section className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold mb-1">Pertumbuhan user</h3>
          <p className="text-xs text-slate-500 mb-4">Free vs Pro — 6 bulan terakhir</p>
          <ReactApexChart options={growthOptions} series={growthSeries} type="bar" height={250} />
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-1">MRR & Revenue</h3>
          <p className="text-xs text-slate-500 mb-4">Tren pendapatan bulanan</p>
          <ReactApexChart options={mrrOptions} series={mrrSeries} type="area" height={250} />
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-1">Konversi Free &rarr; Pro</h3>
          <p className="text-xs text-slate-500 mb-4">Persentase upgrade per bulan</p>
          <ReactApexChart options={convOptions} series={convSeries} type="line" height={250} />
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-1">Distribusi segmen</h3>
          <p className="text-xs text-slate-500 mb-4">User Pro per segmen</p>
          <ReactApexChart options={segmentOptions} series={segmentSeries} type="donut" height={250} />
        </div>
      </section>

      {/* THRESHOLD RETENSI */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4 tracking-wider">Threshold retensi</h2>
        <div className="grid grid-cols-3 gap-8 border-b pb-8">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Churn rate</span>
              <span className="text-slate-400">Target &lt;5%</span>
            </div>
            <p className="text-xl font-bold text-emerald-600">{totals.churnRate}%</p>
            <p className="text-xs text-slate-500 mb-2">user keluar bulan ini</p>
            <div className="h-1 bg-slate-200 rounded-full"><div className="h-1 bg-emerald-500 rounded-full" style={{width: `${Math.min(totals.churnRate * 10, 100)}%`}}></div></div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Konversi rate</span>
              <span className="text-slate-400">Target &gt;10%</span>
            </div>
            <p className="text-xl font-bold text-emerald-600">{totals.convRate}%</p>
            <p className="text-xs text-slate-500 mb-2">{today.new_pro} dari {today.new_users} user (hari ini)</p>
            <div className="h-1 bg-slate-200 rounded-full"><div className="h-1 bg-indigo-500 rounded-full" style={{width: `${Math.min(totals.convRate * 5, 100)}%`}}></div></div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Retensi Pro</span>
              <span className="text-slate-400">Target &gt;85%</span>
            </div>
            <p className="text-xl font-bold text-emerald-600">{totals.retentionRate}%</p>
            <p className="text-xs text-slate-500 mb-2">tidak perpanjang (estimasi)</p>
            <div className="h-1 bg-slate-200 rounded-full"><div className="h-1 bg-indigo-500 rounded-full" style={{width: `${totals.retentionRate}%`}}></div></div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>LTV rata rata</span>
            </div>
            <p className="text-xl font-bold">{formatIDR(retention.ltv)}</p>
            <p className="text-xs text-slate-500 mb-2">~{retention.avg_tenure_months} bulan avg tenure</p>
            <div className="h-1 bg-slate-200 rounded-full"><div className="h-1 bg-amber-600 rounded-full" style={{width: `40%`}}></div></div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>CAC</span>
              <span className="text-slate-400">Organik saja</span>
            </div>
            <p className="text-xl font-bold">Rp {retention.cac}</p>
            <p className="text-xs text-slate-500 mb-2">Belum ada paid ads</p>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>LTV/CAC ratio</span>
              <span className="text-slate-400">Target &gt;3x</span>
            </div>
            <p className="text-xl font-bold">{retention.cac === 0 ? '∞' : retention.ltv_cac_ratio}</p>
            <p className="text-xs text-slate-500 mb-2">CAC = 0 saat ini</p>
            <div className="h-1 bg-slate-200 rounded-full"><div className="h-1 bg-indigo-700 rounded-full" style={{width: `100%`}}></div></div>
          </div>
        </div>
      </section>

      {/* TABLES */}
      <section className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold mb-4">Transaksi terbaru</h3>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase border-b">
              <tr>
                <th className="py-2">USER</th>
                <th className="py-2">PLAN</th>
                <th className="py-2">JUMLAH</th>
                <th className="py-2">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map(tx => (
                <tr key={tx.id} className="border-b last:border-0">
                  <td className="py-2">{tx.user?.name}</td>
                  <td className="py-2"><span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">Pro</span></td>
                  <td className="py-2">{formatIDR(tx.amount)}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${tx.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : tx.status === 'failed' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/admin/invoices" className="text-indigo-600 text-xs hover:underline mt-2 inline-block">Lihat semua transaksi &rarr;</Link>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Subscription akan expired</h3>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase border-b">
              <tr>
                <th className="py-2">USER</th>
                <th className="py-2">EXPIRES</th>
                <th className="py-2">SISA</th>
              </tr>
            </thead>
            <tbody>
              {expiringSubscriptions.map(sub => {
                const sisa = Math.ceil((new Date(sub.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <tr key={sub.id} className="border-b last:border-0">
                    <td className="py-2">{sub.user?.name}</td>
                    <td className="py-2">{new Date(sub.expires_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</td>
                    <td className={`py-2 ${sisa <= 2 ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}>{sisa} hari</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ALERTS */}
      <section>
        <h3 className="font-semibold mb-4">Alert & perhatian</h3>
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <div key={idx} className={`p-3 rounded-md text-sm ${
              alert.level === 'danger' ? 'bg-rose-50 border border-rose-100 text-rose-800' :
              alert.level === 'warning' ? 'bg-amber-50 border border-amber-100 text-amber-800' :
              'bg-blue-50 border border-blue-100 text-blue-800'
            }`}>
              <span className="font-semibold mr-1">{alert.level === 'danger' ? 'Kritis:' : alert.level === 'warning' ? 'Perhatian:' : 'Info:'}</span>
              {alert.message}
              {alert.action && <a href={alert.action} className="ml-2 underline font-medium">Lihat detail</a>}
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="p-3 bg-slate-50 text-slate-500 text-sm rounded-md">Tidak ada alert saat ini.</div>
          )}
        </div>
      </section>
    </div>
  );
}
