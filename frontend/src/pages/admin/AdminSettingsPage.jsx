import { useState, useEffect } from 'react';
import { settingsService } from '../../services/settingsService';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsService.getAdminSettings();
      // Ensure payment_gateway_active exists in the state even if not in DB yet
      if (!data.find(s => s.key === 'payment_gateway_active')) {
        data.push({ key: 'payment_gateway_active', value: 'false', type: 'boolean' });
      }
      setSettings(data);
    } catch (err) {
      toast.error('Gagal mengambil pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => prev.map(s => {
      if (s.key === key) {
        return { ...s, value: s.value === 'true' ? 'false' : 'true' };
      }
      return s;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.updateAdminSettings(settings);
      toast.success('Pengaturan berhasil disimpan');
    } catch (err) {
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const pgActive = settings.find(s => s.key === 'payment_gateway_active')?.value === 'true';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola konfigurasi global aplikasi.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Payment & Subscriptions</h2>
          
          <div className="flex items-center justify-between py-4 border-b border-slate-100">
            <div>
              <p className="font-medium text-slate-900">Payment Gateway (Xendit)</p>
              <p className="text-sm text-slate-500 mt-1">
                Jika diaktifkan, user akan diarahkan ke checkout otomatis Xendit. 
                Jika dimatikan, user akan menggunakan metode transfer manual (Upload Bukti QRIS).
              </p>
            </div>
            <button
              onClick={() => handleToggle('payment_gateway_active')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${pgActive ? 'bg-violet-600' : 'bg-slate-200'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${pgActive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-violet-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
}
