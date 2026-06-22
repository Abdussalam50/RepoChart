import { Link } from 'react-router-dom';

export function QuickActionCard({ icon: Icon, label, description, to, onClick, color = 'violet' }) {
  const colorMap = {
    violet: 'bg-violet-50 text-violet-600 group-hover:bg-violet-100',
    blue:   'bg-blue-50   text-blue-600   group-hover:bg-blue-100',
    emerald:'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
    amber:  'bg-amber-50  text-amber-600  group-hover:bg-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100',
  };

  const inner = (
    <div className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${colorMap[color] ?? colorMap.violet}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="font-semibold text-slate-900 text-sm">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
    </div>
  );

  if (onClick) return <button onClick={onClick} className="w-full text-left">{inner}</button>;
  return <Link to={to}>{inner}</Link>;
}
