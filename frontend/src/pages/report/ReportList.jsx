import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReportStore } from '../../store/reportStore';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { Search, Trash2, Eye, Plus, Calendar, FileBarChart2 } from 'lucide-react';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { useModalStore } from '../../store/modalStore';

export function ReportList() {
  const { reports, fetchReports, deleteReport, isLoading } = useReportStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [isDeletingId, setIsDeletingId] = useState(null);
  
  const { isFree, canAddReport } = usePlanLimits();
  const { openModal } = useModalStore();

  useEffect(() => {
    fetchReports();
  }, []);

  const reportsThisMonth = reports.filter(report => {
    if (!report.created_at) return false;
    const createdAt = new Date(report.created_at);
    const now = new Date();
    return createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth();
  }).length;

  const canCreateReport = canAddReport(reportsThisMonth);

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
      setIsDeletingId(id);
      try {
        await deleteReport(id);
      } catch (err) {
        console.error('Failed to delete report', err);
      } finally {
        setIsDeletingId(null);
      }
    }
  };

  // Get unique clients for filtering
  const clients = Array.from(
    new Map(
      reports
        .filter((r) => r.client)
        .map((r) => [r.client.id, r.client])
    ).values()
  );

  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = selectedClient === '' || report.client_id === Number(selectedClient);
    return matchesSearch && matchesClient;
  });

  return (
    <PageWrapper
      title="Reports"
      subtitle="Kelola dan lihat laporan analisis klien Anda"
      actions={
        !canCreateReport ? (
          <Button 
            onClick={openModal}
            className="bg-slate-100 border border-slate-200 text-slate-400 hover:bg-slate-200 cursor-pointer"
            title="Batas paket Free tercapai. Klik untuk upgrade ke Pro."
          >
            <Plus className="mr-2 h-4 w-4 text-slate-400" />
            New Report (Limit)
          </Button>
        ) : (
          <Link to="/upload">
            <Button className="bg-violet-500 hover:bg-violet-700 text-white cursor-pointer" >
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </Link>
        )
      }
    >
      {isFree && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/50 to-indigo-50/30 text-slate-700 shadow-sm font-sans">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-violet-900 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              Paket Free Aktif
            </h4>
            <p className="text-xs text-slate-500">
              Anda telah membuat <strong>{reportsThisMonth} dari 2</strong> limit laporan bulan ini. Upgrade ke Pro untuk laporan tak terbatas.
            </p>
          </div>
          <button 
            onClick={openModal}
            className="shrink-0 px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer hover:bg-violet-700"
          >
            Upgrade ke Pro
          </button>
        </div>
      )}
      {isLoading && reports.length === 0 ? (
        <Loader size="lg" />
      ) : (
        <div className="space-y-6 font-sans">
          {/* Filter & Search Controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari laporan atau klien..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
              />
            </div>
            <div className="w-full sm:w-64">
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
              >
                <option value="">Semua Klien</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table / Grid list */}
          {filteredReports.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
              <FileBarChart2 className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-sm font-semibold text-slate-900">Tidak ada laporan ditemukan</h3>
              <p className="mt-2 text-sm text-slate-500">
                {searchTerm || selectedClient
                  ? 'Coba ubah kata kunci pencarian atau filter klien Anda.'
                  : 'Mulai dengan membuat laporan baru melalui tombol di atas.'}
              </p>
              {!searchTerm && !selectedClient && (
                <div className="mt-6">
                  {!canCreateReport ? (
                    <Button variant="outline" onClick={openModal}>Create Report (Limit)</Button>
                  ) : (
                    <Link to="/upload">
                      <Button variant="outline">Create Report</Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-slate-500">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-100">
                    <tr>
                      <th scope="col" className="px-6 py-4">Nama Laporan</th>
                      <th scope="col" className="px-6 py-4">Klien</th>
                      <th scope="col" className="px-6 py-4">Periode Tanggal</th>
                      <th scope="col" className="px-6 py-4">Tanggal Dibuat</th>
                      <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReports.map((report) => {
                      const client = report.client || {};
                      const brandColor = client.brand_color || client.primary_color || '#8b5cf6';
                      
                      const startDate = report.period_start 
                        ? new Date(report.period_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '-';
                      const endDate = report.period_end 
                        ? new Date(report.period_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '-';
                        
                      const createdDate = report.created_at
                        ? new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '-';

                      return (
                        <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <Link 
                              to={`/reports/${report.id}`} 
                              className="font-semibold text-slate-900 hover:text-primary transition-colors block"
                            >
                              {report.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span 
                                className="h-2.5 w-2.5 rounded-full shrink-0" 
                                style={{ backgroundColor: brandColor }}
                              />
                              <span className="font-medium text-slate-700">{client.name || 'Unknown Client'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span>
                                {startDate === '-' && endDate === '-' ? 'Not Set' : `${startDate} - ${endDate}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                            {createdDate}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <Link to={`/reports/${report.id}`}>
                                <Button size="sm" variant="outline" className="h-8 rounded-xl px-2.5 flex items-center gap-1">
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>View</span>
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 rounded-xl px-2.5 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-1"
                                onClick={() => handleDelete(report.id)}
                                isLoading={isDeletingId === report.id}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
export default ReportList;
