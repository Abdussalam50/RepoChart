import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { FileDropzone } from '../../components/upload/FileDropzone';
import { useReportStore } from '../../store/reportStore';
import { useClientStore } from '../../store/clientStore';
import { Button } from '../../components/ui/Button';
import UploadProgressBar from '../../components/upload/UploadProgressBar';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { useModalStore } from '../../store/modalStore';

export function UploadPage() {
  const [file, setFile] = useState(null);
  const [clientId, setClientId] = useState('');
  const [reportSelection, setReportSelection] = useState('new'); // 'new' or 'existing'
  const [reportTitle, setReportTitle] = useState('');
  const [selectedReportId, setSelectedReportId] = useState('');
  const [currentStep, setCurrentStep] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [sanitizationPreview, setSanitizationPreview] = useState([]);
  const [activeReportId, setActiveReportId] = useState(null);

  const { clients, fetchClients } = useClientStore();
  const { reports, fetchReports, createReport, uploadCsv, isLoading, error } = useReportStore();
  const navigate = useNavigate();

  const { isFree, canAddReport } = usePlanLimits();
  const { openModal } = useModalStore();

  const reportsThisMonth = reports.filter(report => {
    if (!report.created_at) return false;
    const createdAt = new Date(report.created_at);
    const now = new Date();
    return createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth();
  }).length;

  const canCreateReport = canAddReport(reportsThisMonth);

  useEffect(() => {
    fetchClients();
    fetchReports();
  }, []);

  // Filter reports by selected client
  const clientReports = reports.filter(r => r.client_id === Number(clientId));

  const handleUpload = async () => {
    if (!file || !clientId) return;
    
    try {
      let reportId = selectedReportId;

      if (reportSelection === 'new') {
        if (!reportTitle) return;
        const newReport = await createReport({
          client_id: Number(clientId),
          title: reportTitle
        });
        reportId = newReport.id;
      }

      if (!reportId) return;
      setActiveReportId(reportId);

      setCurrentStep('uploading');

      // Upload file with progress tracking
      const resData = await useReportStore.getState().uploadCsvFull(reportId, file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (percentCompleted === 100) {
          setCurrentStep('parsing');
        }
      });
      
      setPlatform(resData.platform);
      setConfidence(resData.confidence);
      if (resData.sanitization_preview) {
        setSanitizationPreview(resData.sanitization_preview);
      }

      setCurrentStep('detecting');
      await new Promise(resolve => setTimeout(resolve, 800));

      setCurrentStep('preparing');
      await new Promise(resolve => setTimeout(resolve, 800));

      setCurrentStep('done');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (resData.was_sanitized) {
        setCurrentStep('preview_sanitization');
      } else {
        navigate(`/reports/${reportId}/builder`);
      }
    } catch (err) {
      setCurrentStep(null);
    }
  };

  return (
    <PageWrapper 
      title="Upload Data" 
      subtitle="Upload your CSV or Excel file to generate charts"
    >
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
        {currentStep && currentStep !== 'preview_sanitization' ? (
          <div className="py-8 space-y-6">
            <UploadProgressBar currentStep={currentStep} platform={platform} confidence={confidence} />
            <p className="text-center text-xs text-slate-400 font-medium">
              Mohon jangan tutup atau refresh halaman ini.
            </p>
          </div>
        ) : currentStep === 'preview_sanitization' ? (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3 items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-blue-900">Pembersihan Otomatis Berhasil</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Kami mendeteksi simbol mata uang dan format lokal pada file Anda. Data telah dinormalisasi secara otomatis untuk akurasi grafik.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                 <h3 className="text-sm font-medium text-slate-700">Preview Data (5 Baris Pertama)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      {sanitizationPreview.length > 0 && Object.keys(sanitizationPreview[0].original).map(col => (
                        <th key={col} className="p-3 font-semibold text-slate-600 whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sanitizationPreview.map((row, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        {Object.keys(row.original).map(col => {
                          const originalVal = row.original[col];
                          const cleanedVal = row.cleaned[col];
                          // To avoid showing changes for simple trim, we compare trimmed values
                          const isChanged = String(originalVal).trim() !== String(cleanedVal);
                          
                          return (
                            <td key={col} className="p-3 align-top">
                              {isChanged ? (
                                <div className="space-y-1">
                                  <div className="text-xs text-slate-400 line-through truncate max-w-[150px]">{originalVal || '-'}</div>
                                  <div className="text-sm font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded inline-block truncate max-w-[150px]">{cleanedVal}</div>
                                </div>
                              ) : (
                                <div className="text-sm text-slate-700 truncate max-w-[150px]">{originalVal || '-'}</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
               <Button
                 className="bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
                 onClick={() => navigate(`/reports/${activeReportId}/builder`)} 
               >
                 Lanjutkan ke Builder
               </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Select Client */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Client</label>
              <select
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  setSelectedReportId('');
                }}
                className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
              >
                <option value="" disabled>Choose a client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {clientId && (
              <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <label className="block text-sm font-semibold text-slate-950 mb-1">Report Setup</label>
                
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="reportSelection"
                      value="new"
                      checked={reportSelection === 'new'}
                      onChange={() => setReportSelection('new')}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    Create New Report
                  </label>
                  {clientReports.length > 0 && (
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="reportSelection"
                        value="existing"
                        checked={reportSelection === 'existing'}
                        onChange={() => setReportSelection('existing')}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      Use Existing Report
                    </label>
                  )}
                </div>

                {reportSelection === 'new' ? (
                  <div className="space-y-4">
                    {reportSelection === 'new' && !canCreateReport && (
                      <div className="rounded-xl border border-amber-250 bg-amber-50/50 p-4 text-sm text-amber-800 space-y-1 font-sans">
                        <p className="font-bold flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Batas Kuota Laporan Bulanan Tercapai
                        </p>
                        <p className="text-xs text-amber-700">
                          Paket Free Anda hanya mendukung maksimal 2 laporan per bulan. Anda telah membuat <strong>{reportsThisMonth} laporan</strong> pada bulan ini.
                        </p>
                        <button
                          type="button"
                          onClick={openModal}
                          className="text-xs font-bold text-violet-700 underline hover:text-violet-900 cursor-pointer block mt-1"
                        >
                          Upgrade ke Pro untuk membuat laporan tak terbatas →
                        </button>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Report Title</label>
                      <input
                        type="text"
                        required
                        disabled={!canCreateReport}
                        placeholder={!canCreateReport ? "Kuota pembuatan laporan bulan ini habis" : "e.g. Laporan Bulanan Mei 2026"}
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Select Report</label>
                    <select
                      value={selectedReportId}
                      onChange={(e) => setSelectedReportId(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    >
                      <option value="" disabled>Choose a report...</option>
                      {clientReports.map(r => (
                        <option key={r.id} value={r.id}>{r.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Data File (CSV or Excel)</label>
              <FileDropzone 
                onFileDrop={setFile} 
                acceptedFile={file} 
                isUploading={isLoading} 
              />
              {/* Privacy Trust Signal */}
              <div className="flex items-start gap-2.5 mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-emerald-700">File CSV kamu tidak disimpan di server</p>
                  <p className="text-xs text-emerald-600 mt-0.5 leading-relaxed">
                    File diproses langsung dan dihapus otomatis setelah selesai. Yang tersimpan hanya hasil kalkulasinya — bukan file aslinya.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                className="bg-violet-500 hover:bg-violet-700 text-white cursor-pointer" 
                onClick={handleUpload} 
                disabled={!file || !clientId || (reportSelection === 'new' && (!reportTitle || !canCreateReport)) || (reportSelection === 'existing' && !selectedReportId)}
                isLoading={isLoading}
              >
                Upload & Continue
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>
    </PageWrapper>
  );
}
