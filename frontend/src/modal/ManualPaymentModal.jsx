import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { manualPaymentUserService } from '../services/manualPaymentService';
import { Loader2, UploadCloud, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManualPaymentModal({ onBack, onSuccess }) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [proof, setProof] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProof(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proof) {
      toast.error('Silakan upload bukti transfer terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('amount', 129000);
      formData.append('payment_proof', proof);

      await manualPaymentUserService.submitPayment(formData);
      
      toast.success('Bukti pembayaran berhasil dikirim');
      onSuccess();

      // Redirect to WhatsApp
      const waNumber = '6281234567890'; // User will change this
      const text = `Halo Admin, saya telah melakukan pembayaran untuk langganan RepoChart Pro.%0A%0ANama: ${user?.name}%0AEmail: ${user?.email}%0ANominal: Rp 129.000%0A%0AMohon bantuannya untuk mengaktifkan akun saya. Terima kasih.`;
      window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan saat mengirim bukti pembayaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X size={20} className="rotate-45" style={{transform: 'rotate(0)'}} />
        </button>
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Pembayaran Manual</h3>
          <p className="text-slate-500 text-sm mt-1">Selesaikan pembayaran untuk mengaktifkan Pro Plan</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-4">Instruksi Pembayaran</h4>
          <p className="text-sm text-slate-600 mb-4">
            Silakan scan QRIS di bawah ini menggunakan aplikasi M-Banking atau E-Wallet pilihan Anda (GoPay, OVO, DANA, Livin', dll).
          </p>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-center mb-4">
            {/* Placeholder for actual QRIS */}
            <div className="w-48 h-48 bg-slate-200 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
              <span className="text-slate-400 font-medium text-center px-4">
                [GAMBAR QRIS]<br/>
                <span className="text-xs">/public/qris.png</span>
              </span>
            </div>
          </div>
          
          <div className="bg-violet-50 text-violet-800 p-4 rounded-xl border border-violet-100">
            <p className="text-sm font-semibold mb-1">Total Tagihan:</p>
            <p className="text-2xl font-bold">Rp 129.000</p>
            <p className="text-xs mt-1 text-violet-600">RepoChart Pro - 1 Bulan</p>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 space-y-4">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                <p className="text-sm font-bold text-amber-800">Perhatian</p>
                <p className="text-sm text-amber-700 mt-1">
                  Pembayaran tidak otomatis! Anda wajib mengunggah screenshot bukti transfer agar admin dapat memverifikasi.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Identitas Pengirim
                </label>
                <div className="bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload Bukti Transfer
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    {proof ? (
                      <p className="text-sm font-semibold text-violet-600">{proof.name}</p>
                    ) : (
                      <p className="text-sm text-slate-500">Klik untuk upload JPG/PNG</p>
                    )}
                  </div>
                  <input type="file" className="hidden" accept="image/jpeg,image/png,image/jpg" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !proof}
              className="mt-6 w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-violet-600 text-white hover:bg-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-violet-200"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Memproses...' : 'Saya Sudah Bayar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
