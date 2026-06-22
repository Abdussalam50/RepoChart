import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function PageWrapper({ children, title, subtitle, actions }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-8 py-8">
            {(title || actions) && (
              <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  {title && <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>}
                  {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center gap-3">{actions}</div>}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
