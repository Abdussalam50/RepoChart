import { useState, useEffect } from 'react';
import adminService from '../../api/adminService';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [planData, setPlanData] = useState({ plan: 'free', reason: '', days: 30 });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [search, planFilter]);

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers({ search, plan: planFilter });
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openPlanModal = (user) => {
    setSelectedUser(user);
    setPlanData({ plan: user.plan, reason: '', days: 30 });
    setIsPlanModalOpen(true);
  };

  const handleUpdatePlan = async () => {
    try {
      await adminService.updateUserPlan(selectedUser.id, planData);
      setIsPlanModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert('Gagal update plan');
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    try {
      await adminService.deleteUser(userToDelete.id, 'DELETE');
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert('Gagal menghapus user');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">User Management</h1>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Cari nama/email..."
          className="border border-slate-300 rounded-xl px-4 py-2 w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border border-slate-300 rounded-xl px-4 py-2"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
        >
          <option value="all">Semua Plan</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Laporan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal Daftar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-10">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-10">Data tidak ditemukan</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900">{user.name}</div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.plan === 'pro' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {user.reports_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(user.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openPlanModal(user)}>
                      Update Plan
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => confirmDelete(user)}>
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-96 p-6">
            <h3 className="text-lg font-bold mb-4">Update Plan: {selectedUser?.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Plan</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={planData.plan}
                  onChange={(e) => setPlanData({ ...planData, plan: e.target.value })}
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              {planData.plan !== 'free' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Durasi (Hari)</label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={planData.days}
                    onChange={(e) => setPlanData({ ...planData, days: e.target.value })}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Alasan (Untuk Log)</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={planData.reason}
                  onChange={(e) => setPlanData({ ...planData, reason: e.target.value })}
                  placeholder="Kompensasi / Manual bayar"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPlanModalOpen(false)}>Batal</Button>
              <Button onClick={handleUpdatePlan}>Simpan</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        title="Hapus User"
        message={`Apakah Anda yakin ingin menghapus ${userToDelete?.name} secara permanen? Semua data laporan akan hilang.`}
        danger={true}
        requireTypeToDelete={true}
        onConfirm={handleDeleteUser}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
