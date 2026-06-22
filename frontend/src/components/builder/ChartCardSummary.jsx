import React from 'react';

/**
 * ChartCardSummary component displays a single line of summary information at the bottom of a chart card.
 * @param {Object} props
 * @param {string} props.value - The main metric value
 * @param {string|null} props.delta - The percentage change (optional)
 * @param {string} props.context - Contextual text (e.g., peak performance info)
 */
export default function ChartCardSummary({ value, delta, context }) {
  const isPositive = delta && delta.startsWith('+');
  const isNegative = delta && delta.startsWith('-');

  return (
    <div className="flex items-center justify-between w-full text-xs border-t border-slate-100 pt-2 mt-2">
      <span className="font-semibold text-slate-800">{value}</span>
      {delta && (
        <span
          className={`font-medium ml-1.5 px-1.5 py-0.5 rounded-full ${
            isPositive
              ? 'text-emerald-700 bg-emerald-50'
              : isNegative
              ? 'text-rose-700 bg-rose-50'
              : 'text-slate-600 bg-slate-50'
          }`}
        >
          {delta}
        </span>
      )}
      <span className="text-slate-500 truncate max-w-[120px] text-right ml-auto" title={context}>
        {context}
      </span>
    </div>
  );
}
