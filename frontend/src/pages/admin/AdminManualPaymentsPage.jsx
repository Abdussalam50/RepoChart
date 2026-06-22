import { useState, useEffect } from 'react';
import { manualPaymentAdminService } from '../../services/manualPaymentService';
import { Loader2, Check, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminManualPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await manualPaymentAdminService.getPayments(page, statusFilter);
      setPayments(data.data);
      setTotalPages(data.last_page);
    } catch (err) {
      toast.error('Gagal mengambil data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menyetujui pembayaran ini dan mengaktifkan akun user?')) return;
    try {
      await manualPaymentAdminService.approvePayment(id);
      toast.success('Pembayaran disetujui');
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyetujui pembayaran');
    }
  };

  const handleReject = async (id) => {
    const notes = prompt('Masukkan alasan penolakan:');
    if (notes === null) return;
    try {
      await manualPaymentAdminService.rejectPayment(id, notes || 'Bukti tidak valid');
      toast.success('Pembayaran ditolak');
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menolak pembayaran');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pembayaran Manual</h1>
          <p className="text-sm text-slate-500 mt-1">Verifikasi bukti transfer dari pengguna.</p>
        </div>
        <div>
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border-slate-300 rounded-lg text-sm"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu Konfirmasi</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nominal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data pembayaran
                  </td>
                </tr>
              ) : payments.map(payment => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{payment.user?.name}</div>
                    <div className="text-sm text-slate-500">{payment.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    Rp {parseInt(payment.amount).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${payment.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                        payment.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(payment.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {payment.payment_proof && (
                        <button 
                          onClick={() => setSelectedImage(`${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}/storage/${payment.payment_proof}`)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-lg"
                          title="Lihat Bukti"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {payment.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(payment.id)}
                            className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 p-1.5 rounded-lg"
                            title="Setujui & Aktifkan"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleReject(payment.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-lg"
                            title="Tolak"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-slate-200">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-slate-300 rounded-md text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-slate-300 rounded-md text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Bukti Transfer" className="max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
}
