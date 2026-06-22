import { Link } from 'react-router-dom';
import { Building2, ChevronRight, Pencil, FileBarChart2 } from 'lucide-react';

export function ClientCard({ client }) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8000';
  const logoUrl = client.logo_path ? `${baseUrl}/storage/${client.logo_path}` : null;

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm shrink-0 overflow-hidden"
            style={{ backgroundColor: client.brand_color || client.primary_color || '#8b5cf6' }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt={client.name} className="h-full w-full object-contain p-1" />
            ) : (
              <Building2 className="h-6 w-6" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{client.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {client.brand_color || client.primary_color || '#8b5cf6'}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
        <Link
          to={`/clients/${client.id}/edit`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Client
        </Link>
        <Link
          to={`/upload?clientId=${client.id}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-violet-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-violet-700"
        >
          <FileBarChart2 className="h-3.5 w-3.5" />
          New Report
        </Link>
      </div>
    </div>
  );
}
