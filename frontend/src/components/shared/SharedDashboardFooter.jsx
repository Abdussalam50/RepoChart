import React from 'react';

export default function SharedDashboardFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 mt-12 w-full">
      <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold">
            R
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              Powered by RepoChart
            </p>
            <p className="text-xs text-slate-500">
              Tools laporan iklan digital untuk freelancer Indonesia
            </p>
          </div>
        </div>
        <a
          href="https://repochart.id?ref=shared-dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-violet-600 hover:text-violet-700 hover:underline font-semibold"
        >
          Buat laporan kamu sendiri &rarr;
        </a>
      </div>
    </footer>
  );
}
