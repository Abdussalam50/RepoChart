import { useState } from 'react';
import adminService from '../../api/adminService';
import { Button } from '../../components/ui/Button';

export function AdminBroadcastPage() {
  const [data, setData] = useState({ title: '', message: '', target: 'all' });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSend = async () => {
    if (!data.title || !data.message) {
      alert('Judul dan pesan tidak boleh kosong');
      return;
    }
    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await adminService.sendBroadcast(data);
      setSuccessMsg(res.data.message);
      setData({ title: '', message: '', target: 'all' });
    } catch (err) {
      alert('Gagal mengirim broadcast');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Broadcast Announcement</h1>
      <p className="text-slate-600">Kirim email pengumuman ke user berdasarkan plan.</p>

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl">
          {successMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Target Penerima</label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2">
              <input type="radio" name="target" value="all" checked={data.target === 'all'} onChange={(e) => setData({ ...data, target: e.target.value })} />
              Semua User
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="target" value="free" checked={data.target === 'free'} onChange={(e) => setData({ ...data, target: e.target.value })} />
              Free Saja
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="target" value="starter" checked={data.target === 'starter'} onChange={(e) => setData({ ...data, target: e.target.value })} />
              Starter Saja
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="target" value="pro" checked={data.target === 'pro'} onChange={(e) => setData({ ...data, target: e.target.value })} />
              Pro Saja
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Judul Email</label>
          <input
            type="text"
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
            placeholder="Pengumuman Fitur Baru RepoChart"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Pesan / Isi Email (Dapat berupa multiline teks)</label>
          <textarea
            className="w-full border rounded-xl px-4 py-2 h-40 focus:ring-2 focus:ring-primary outline-none"
            placeholder="Tulis pesan Anda di sini..."
            value={data.message}
            onChange={(e) => setData({ ...data, message: e.target.value })}
          ></textarea>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSend} isLoading={loading}>
            Kirim Broadcast Sekarang
          </Button>
        </div>
      </div>
    </div>
  );
}
