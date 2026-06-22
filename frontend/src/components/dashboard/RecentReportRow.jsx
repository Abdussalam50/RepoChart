import { Link } from 'react-router-dom';
import { FileBarChart2, ExternalLink, Download } from 'lucide-react';

const STATUS_MAP = {
  exported:  { label: 'Exported',  cls: 'bg-emerald-100 text-emerald-700' },
  ready:     { label: 'Ready',     cls: 'bg-blue-100    text-blue-700'    },
  draft:     { label: 'Draft',     cls: 'bg-slate-100   text-slate-600'   },
  processing:{ label: 'Processing',cls: 'bg-amber-100   text-amber-700'   },
};

function getStatus(report) {
  if (report.pdf_path)                    return 'exported';
  if (report.insight_status === 'done')   return 'ready';
  if (report.insight_status === 'processing') return 'processing';
  return 'draft';
}

export function RecentReportRow({ report }) {
  const status = getStatus(report);
  const badge  = STATUS_MAP[status] ?? STATUS_MAP.draft;
  const date   = new Date(report.created_at).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <tr className="group hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <FileBarChart2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-900 text-sm truncate max-w-[180px]">{report.title}</p>
            <p className="text-xs text-slate-400 capitalize">{report.report_type ?? 'monthly'}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-slate-500 hidden md:table-cell">
        {report.client?.name ?? <span className="italic text-slate-300">Tanpa klien</span>}
      </td>
      <td className="py-3 px-4 hidden lg:table-cell">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.cls}`}>
          {badge.label}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-slate-400 hidden xl:table-cell">{date}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            to={`/reports/${report.id}`}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-violet-300 hover:text-violet-600 transition-colors"
          >
            <ExternalLink className="h-3 w-3" /> Buka
          </Link>
        </div>
      </td>
    </tr>
  );
}
