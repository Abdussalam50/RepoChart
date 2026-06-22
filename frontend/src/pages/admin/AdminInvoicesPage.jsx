import { useState, useEffect } from 'react';
import adminService from '../../api/adminService';
import { Button } from '../../components/ui/Button';

export function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [markPaidNote, setMarkPaidNote] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      const res = await adminService.getTransactions({ status: statusFilter });
      setInvoices(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openMarkPaidModal = (invoice) => {
    setSelectedInvoice(invoice);
    setMarkPaidNote('');
    setIsMarkPaidModalOpen(true);
  };

  const handleMarkPaid = async () => {
    try {
      await adminService.markAsPaid(selectedInvoice.id, { note: markPaidNote });
      setIsMarkPaidModalOpen(false);
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal mark as paid');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Transaction Management</h1>

      <div className="flex gap-4">
        <select
          className="border border-slate-300 rounded-xl px-4 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Semua Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="expired">Expired</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jumlah</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-10">Loading...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-10">Data tidak ditemukan</td></tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {invoice.xendit_invoice_id || `INV-${invoice.id}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {invoice.user?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    Rp {Number(invoice.amount).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {invoice.status !== 'paid' && (
                      <Button variant="outline" size="sm" onClick={() => openMarkPaidModal(invoice)}>
                        Mark Paid
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isMarkPaidModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Mark Invoice as Paid</h3>
            <p className="text-slate-600 mb-4">
              Ini akan mengubah status invoice, membuat subscription baru untuk user, mengubah plan user, dan mengirimkan email konfirmasi.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Catatan (Wajib untuk log admin)</label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded px-3 py-2"
                placeholder="Misal: User konfirmasi bayar manual via WA"
                value={markPaidNote}
                onChange={(e) => setMarkPaidNote(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsMarkPaidModalOpen(false)}>Batal</Button>
              <Button onClick={handleMarkPaid} disabled={!markPaidNote.trim()} className="bg-violet-600 cursor-pointer hover:bg-violet-700 text-white">
                Konfirmasi Paid
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
