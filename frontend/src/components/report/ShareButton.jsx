import { useState, useEffect, useRef } from 'react';
import { createShareLink, revokeShareLink, getActiveShareLink } from '../../api/reportService';
import { Share2, Check, Copy, Trash2, Link as LinkIcon, MessageCircle, Loader2 } from 'lucide-react';
import { useReportStore } from '../../store/reportStore';

export default function ShareButton({ reportId, activeLink, onRevoke }) {
  const [shareUrl, setShareUrl] = useState(activeLink?.url || null);
  const [viewCount, setViewCount] = useState(activeLink?.view_count || 0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef(null);
  
  const { currentReport } = useReportStore();

  useEffect(() => {
    // If activeLink is provided via props, use it
    if (activeLink?.url) {
      setShareUrl(activeLink.url);
      return;
    }
    
    // Otherwise fetch it
    const fetchActiveLink = async () => {
      try {
        const res = await getActiveShareLink(reportId);
        if (res.data?.url) {
          setShareUrl(res.data.url);
          setViewCount(res.data.view_count || 0);
        }
      } catch (err) {
        console.error('Failed to fetch active share link', err);
      }
    };
    fetchActiveLink();
  }, [reportId, activeLink]);

  // Click outside to close panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowPanel(false);
      }
    };
    if (showPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPanel]);

  const handleShare = async () => {
    if (shareUrl) {
      setShowPanel(!showPanel);
      return;
    }
    
    setLoading(true);
    try {
      const res = await createShareLink(reportId);
      setShareUrl(res.data.url);
      setViewCount(res.data.view_count || 0);
      setShowPanel(true);
    } catch (err) {
      console.error('Failed to create share link', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async () => {
    if (!confirm('Nonaktifkan link ini? Klien tidak akan bisa membuka dashboard lagi.')) return;
    setLoading(true);
    try {
      await revokeShareLink(reportId);
      setShareUrl(null);
      setShowPanel(false);
      if (onRevoke) onRevoke();
    } catch (err) {
      console.error('Failed to revoke share link', err);
    } finally {
      setLoading(false);
    }
  };

  const waNumber = currentReport?.client?.whatsapp_number || '';
  const waMessage = `Halo, berikut dashboard laporan ${currentReport?.title || 'iklan'} Anda: ${shareUrl}`;
  const waUrl = waNumber 
    ? `https://wa.me/${waNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        disabled={loading}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-50 text-violet-700 border border-violet-200 text-sm font-semibold transition-colors disabled:opacity-60 hover:bg-violet-100"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
        Share Dashboard
      </button>

      {showPanel && shareUrl && (
        <div ref={panelRef} className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-50">
          <p className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-violet-600" />
            Tautan Dashboard Publik
          </p>

          <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 mb-4">
            <span className="text-xs text-slate-600 flex-1 truncate font-medium">
              {shareUrl}
            </span>
            <button
              onClick={handleCopy}
              className="text-[10px] uppercase tracking-wider font-bold text-violet-600 hover:text-violet-800 flex-shrink-0 flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy
                </>
              )}
            </button>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full p-2 bg-[#25D366] border border-[#25D366] rounded-lg text-sm font-semibold text-white hover:bg-[#1DA851] mb-3 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Kirim via WhatsApp
          </a>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500">
              Dilihat: {viewCount} kali
            </span>
            <button
              onClick={handleRevoke}
              disabled={loading}
              className="text-[11px] font-semibold text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Nonaktifkan Tautan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
