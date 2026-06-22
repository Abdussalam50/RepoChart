export function ColumnMapper({ columns, value, onChange }) {
  if (!columns || columns.length === 0) return null;

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-slate-700 mb-1">X-Axis (Label)</label>
        <select
          value={value.x || ''}
          onChange={(e) => onChange({ ...value, x: e.target.value })}
          className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="" disabled>Select column</option>
          {columns.map((col) => (
            <option key={col.name} value={col.name}>
              {col.name} ({col.type})
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-slate-700 mb-1">Y-Axis (Value)</label>
        <select
          value={value.y || ''}
          onChange={(e) => onChange({ ...value, y: e.target.value })}
          className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="" disabled>Select column</option>
          {columns.filter(c => c.type === 'number').map((col) => (
            <option key={col.name} value={col.name}>
              {col.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
