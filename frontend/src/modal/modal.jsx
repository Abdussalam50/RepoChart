import { useState, useEffect } from 'react';
import { checkout } from '../api/subscriptionService';
import { useModalStore } from '../store/modalStore';
import { useAuthStore } from '../store/authStore';
import { X, CheckCircle2 } from 'lucide-react';
import { settingsService } from '../services/settingsService';
import ManualPaymentModal from './ManualPaymentModal';

export default function Modal() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isOpen, closeModal } = useModalStore();
    const { user } = useAuthStore();
    const [view, setView] = useState('plans'); // 'plans' or 'manual_payment'
    const [pgActive, setPgActive] = useState(null); // null = belum diketahui

    // Fetch status payment gateway setiap kali modal dibuka
    useEffect(() => {
        if (isOpen) {
            settingsService.getPublicSettings()
                .then(res => {
                    // API returns: { payment_gateway_active: true/false }
                    // Nilai dari backend bisa berupa boolean atau string
                    const val = res.payment_gateway_active;
                    const isActive = val === true || val === 'true' || val === 1 || val === '1';
                    setPgActive(isActive);
                })
                .catch(err => {
                    console.error('Gagal mengambil pengaturan payment gateway:', err);
                    // Jika gagal fetch, default ke manual (lebih aman)
                    setPgActive(false);
                });
        } else {
            // Reset state saat modal ditutup
            setPgActive(null);
            setView('plans');
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        setView('plans');
        setError(null);
        closeModal();
    };

    const handleSubscribe = async (plan) => {
        // Prevent subscribing to the same plan
        if (user?.plan === plan) return;

        // Jika status gateway belum diketahui (masih loading), tunggu
        if (pgActive === null) return;

        try {
            // Jika payment gateway MATI, gunakan alur manual
            if (!pgActive) {
                setView('manual_payment');
                return;
            }

            // Jika payment gateway AKTIF, gunakan Xendit
            setLoading(true);
            setError(null);
            const response = await checkout(plan);

            if (response.data.checkout_url) {
                window.location.href = response.data.checkout_url;
            }

            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memproses subscription');
            console.error('Subscription error:', err);
        } finally {
            setLoading(false);
        }
    };

    const isFree = user?.plan === 'free' || !user?.plan;
    const isPro = user?.plan === 'pro';
    const isLoadingSettings = pgActive === null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-100">

                    {view === 'manual_payment' ? (
                        <ManualPaymentModal
                            onBack={() => setView('plans')}
                            onSuccess={() => handleClose()}
                        />
                    ) : (
                        <>
                            {/* Header */}
                            <div className="flex items-center justify-between p-8 border-b border-slate-50">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900">Pilih Paket RepoChart</h3>
                                    <p className="text-slate-500 text-sm mt-1">Upgrade untuk fitur AI Insight dan Export PDF Branded</p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-medium">
                                        {error}
                                    </div>
                                )}

                                {/* Indikator mode pembayaran */}
                                {!isLoadingSettings && !pgActive && (
                                    <div className="mb-6 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800 flex items-center gap-2">
                                        <span>💳</span>
                                        <span>Mode pembayaran manual aktif — upgrade via transfer QRIS.</span>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Free Plan */}
                                    <div className={`relative flex flex-col border rounded-3xl p-8 transition-all ${isFree ? 'border-slate-200 bg-slate-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                                        {isFree && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm flex items-center gap-1">
                                                <CheckCircle2 size={12} /> Plan Saat Ini
                                            </div>
                                        )}
                                        <h4 className="text-xl font-bold mb-2 text-slate-900">Free Plan</h4>
                                        <p className="text-sm text-slate-500 mb-6">Cocok untuk eksplorasi awal solo founder.</p>

                                        <div className="mb-6">
                                            <p className="text-3xl font-bold text-slate-900">Rp 0<span className="text-sm text-slate-400 font-normal">/bulan</span></p>
                                        </div>

                                        <ul className="space-y-3 mb-8 text-sm text-slate-600 flex-1">
                                            <li className="flex gap-2"><span>•</span> 1 Klien Aktif</li>
                                            <li className="flex gap-2"><span>•</span> 2 Laporan Per Bulan</li>
                                            <li className="flex gap-2"><span>•</span> Grafik Dasar (Line, Bar)</li>
                                            <li className="flex gap-2"><span>•</span> Export PDF (Watermark)</li>
                                            <li className="flex gap-2 text-slate-400 line-through"><span>•</span> Tanpa AI Insight</li>
                                        </ul>

                                        <button
                                            onClick={() => handleSubscribe('free')}
                                            disabled={loading || isFree || isLoadingSettings}
                                            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm transition-all ${
                                                isFree
                                                ? 'bg-white text-slate-400 border border-slate-200 cursor-default'
                                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 cursor-pointer'
                                            }`}
                                        >
                                            {isFree ? 'Aktif Saat Ini' : 'Pilih Paket'}
                                        </button>
                                    </div>

                                    {/* Pro Plan */}
                                    <div className={`relative flex flex-col border rounded-3xl p-8 shadow-xl transition-all ${isPro ? 'border-violet-200 bg-violet-50/30' : 'border-violet-100 hover:border-violet-200 shadow-violet-500/5'}`}>
                                        {isPro && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-violet-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-violet-600 shadow-sm flex items-center gap-1">
                                                <CheckCircle2 size={12} /> Plan Saat Ini
                                            </div>
                                        )}
                                        {!isPro && (
                                            <div className="absolute -top-3 right-8 bg-violet-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                                                Rekomendasi
                                            </div>
                                        )}

                                        <h4 className="text-xl font-bold mb-2 text-slate-900">Pro Plan</h4>
                                        <p className="text-sm text-slate-500 mb-6">Laporan profesional tanpa batas.</p>

                                        <div className="mb-6">
                                            <p className="text-3xl font-bold text-violet-600">Rp 129k<span className="text-sm text-slate-400 font-normal">/bulan</span></p>
                                        </div>

                                        <ul className="space-y-3 mb-8 text-sm text-slate-700 flex-1">
                                            <li className="flex gap-2"><span className="text-violet-500 font-bold">✓</span> Unlimited Klien</li>
                                            <li className="flex gap-2"><span className="text-violet-500 font-bold">✓</span> Unlimited Laporan</li>
                                            <li className="flex gap-2"><span className="text-violet-500 font-bold">✓</span> Semua Tipe Grafik & Formula</li>
                                            <li className="flex gap-2"><span className="text-violet-500 font-bold">✓</span> Export PDF Branded (No Watermark)</li>
                                            <li className="flex gap-2"><span className="text-violet-500 font-bold">✓</span> AI Insight & Analisis SOP</li>
                                        </ul>

                                        <button
                                            onClick={() => handleSubscribe('pro')}
                                            disabled={loading || isPro || isLoadingSettings}
                                            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${
                                                isPro
                                                ? 'bg-white text-violet-400 border border-violet-100 cursor-default shadow-none'
                                                : isLoadingSettings
                                                ? 'bg-violet-300 text-white cursor-wait shadow-none'
                                                : 'bg-violet-600 text-white hover:bg-violet-700 cursor-pointer shadow-violet-200'
                                            }`}
                                        >
                                            {isPro
                                                ? 'Aktif Saat Ini'
                                                : isLoadingSettings
                                                ? 'Memuat...'
                                                : loading
                                                ? 'Memproses...'
                                                : pgActive
                                                ? 'Upgrade via Xendit'
                                                : 'Upgrade via Transfer Manual'
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}