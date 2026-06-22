import React, { useState } from 'react';
import { Rocket, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axiosInstance';

export function BetaActivationCard() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { fetchMe } = useAuthStore();

  const handleActivate = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/subscription/beta-activate', { code });
      setSuccess(response.data.message);
      
      // Refresh user data so the app knows the user is now 'pro'
      setTimeout(() => {
        fetchMe();
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Terjadi kesalahan saat mengaktifkan kode beta.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 shadow-sm flex items-start gap-4">
        <div className="bg-emerald-100 rounded-full p-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-bold text-emerald-800 text-lg">Aktivasi Beta Berhasil!</h3>
          <p className="text-emerald-700 text-sm mt-1">{success}</p>
          <p className="text-emerald-600 text-xs mt-2 italic">Halaman akan dimuat ulang untuk mengaplikasikan fitur Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100 p-6 shadow-sm relative overflow-hidden">
      {/* Decor */}
      <div className="absolute -top-10 -right-10 text-violet-200 opacity-50">
        <Rocket className="w-32 h-32" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-violet-100 text-violet-600 p-2 rounded-xl">
            <Rocket className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Aktivasi RepoChart Beta</h3>
        </div>
        
        <p className="text-slate-600 text-sm mb-4">
          Punya kode undangan beta? Masukkan di sini untuk langsung mendapatkan akses Pro secara gratis.
        </p>

        <form onSubmit={handleActivate} className="flex gap-2">
          <input
            type="text"
            placeholder="Masukkan Kode Beta..."
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent uppercase"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aktifkan'}
          </button>
        </form>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
