import { useState, useEffect } from 'react';
import adminService from '../../api/adminService';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all'); // 'all' or 'expiring'

  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [extendData, setExtendData] = useState({ days: 7, reason: '' });

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createData, setCreateData] = useState({ user_id: '', plan: 'pro', days: 30, reason: '' });

  useEffect(() => {
    fetchSubs();
  }, [tab]);

  const fetchSubs = async () => {
    setLoading(true);
    try {
      let res;
      if (tab === 'expiring') {
        res = await adminService.getExpiringSubscriptions(7);
        setSubs(res.data);
      } else {
        res = await adminService.getSubscriptions();
        setSubs(res.data.data); // paginated
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openExtendModal = (sub) => {
    setSelectedSub(sub);
    setExtendData({ days: 7, reason: '' });
    setIsExtendModalOpen(true);
  };

  const handleExtend = async () => {
    try {
      await adminService.extendSubscription(selectedSub.id, extendData);
      setIsExtendModalOpen(false);
      fetchSubs();
    } catch (err) {
      alert('Gagal extend subscription');
    }
  };

  const openCancelModal = (sub) => {
    setSelectedSub(sub);
    setCancelReason('');
    setIsCancelModalOpen(true);
  };

  const handleCancel = async () => {
    try {
      await adminService.cancelSubscription(selectedSub.id, { reason: cancelReason });
      setIsCancelModalOpen(false);
      fetchSubs();
    } catch (err) {
      alert('Gagal membatalkan subscription');
    }
  };

  const handleCreate = async () => {
    try {
      await adminService.createSubscription(createData);
      setIsCreateModalOpen(false);
      fetchSubs();
    } catch (err) {
      alert('Gagal membuat subscription manual');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Subscription Management</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>Create Manual Sub</Button>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          className={`px-4 py-2 ${tab === 'all' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-slate-500'}`}
          onClick={() => setTab('all')}
        >
          Semua Aktif
        </button>
        <button
          className={`px-4 py-2 ${tab === 'expiring' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-slate-500'}`}
          onClick={() => setTab('expiring')}
        >
          Expiring (&lt; 7 Hari)
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Expires At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-10">Loading...</td></tr>
            ) : subs.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-10">Tidak ada subscription ditemukan</td></tr>
            ) : (
              subs.map((sub) => (
                <tr key={sub.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900">{sub.user?.name}</div>
                    <div className="text-sm text-slate-500">{sub.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {new Date(sub.expires_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openExtendModal(sub)}>
                      Extend
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => openCancelModal(sub)}>
                      Cancel
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isExtendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-96 p-6">
            <h3 className="text-lg font-bold mb-4">Extend Subscription</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Durasi (Hari)</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={extendData.days}
                  onChange={(e) => setExtendData({ ...extendData, days: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alasan</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={extendData.reason}
                  onChange={(e) => setExtendData({ ...extendData, reason: e.target.value })}
                  placeholder="Kompensasi error sistem"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsExtendModalOpen(false)}>Batal</Button>
              <Button onClick={handleExtend} disabled={!extendData.reason}>Simpan</Button>
            </div>
          </div>
        </div>
      )}

      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-96 p-6">
            <h3 className="text-lg font-bold text-red-600 mb-4">Batalkan Subscription</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Alasan Pembatalan</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 border-red-300"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Permintaan user / Fraud"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>Kembali</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleCancel} disabled={!cancelReason}>Batalkan Sub</Button>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-96 p-6">
            <h3 className="text-lg font-bold mb-4">Buat Manual Subscription</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">User ID</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={createData.user_id}
                  onChange={(e) => setCreateData({ ...createData, user_id: e.target.value })}
                  placeholder="ID User di database"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Plan</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={createData.plan}
                  onChange={(e) => setCreateData({ ...createData, plan: e.target.value })}
                >
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Durasi (Hari)</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={createData.days}
                  onChange={(e) => setCreateData({ ...createData, days: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alasan</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={createData.reason}
                  onChange={(e) => setCreateData({ ...createData, reason: e.target.value })}
                  placeholder="Promo khusus / Tester"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
              <Button onClick={handleCreate} disabled={!createData.reason || !createData.user_id}>Buat</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
