import React from 'react';

/**
 * Multi-step upload progress bar with 5 stages.
 * @param {{ currentStep: string, platform: string|null, confidence: number }} props
 */
const STEPS = [
  {
    key: 'uploading',
    label: 'Uploading',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    key: 'parsing',
    label: 'Membaca kolom',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    key: 'detecting',
    label: 'Mendeteksi platform',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
  },
  {
    key: 'preparing',
    label: 'Menyiapkan chart',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    key: 'done',
    label: 'Selesai!',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function UploadProgressBar({ currentStep, platform = null, confidence = 0 }) {
  const currentIdx = STEPS.findIndex(s => s.key === currentStep);

  return (
    <div className="w-full space-y-4">
      {/* Stepper row */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIdx;
          const isActive = idx === currentIdx;
          const isFuture = idx > currentIdx;

          return (
            <React.Fragment key={step.key}>
              {/* Step node */}
              <div className="flex flex-col items-center gap-1.5 min-w-0">
                <div
                  className={[
                    'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0',
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-violet-600 text-white ring-4 ring-violet-200 animate-pulse'
                      : 'bg-gray-100 text-gray-400 border border-gray-200',
                  ].join(' ')}
                >
                  {isCompleted ? <CheckIcon /> : step.icon}
                </div>
                <span
                  className={[
                    'text-xs font-medium text-center leading-tight hidden sm:block',
                    isCompleted ? 'text-green-600' : isActive ? 'text-violet-700' : 'text-gray-400',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-2 h-0.5 rounded-full transition-all duration-500"
                  style={{
                    background: idx < currentIdx
                      ? '#22c55e'
                      : idx === currentIdx
                      ? 'linear-gradient(to right, #8b5cf6 50%, #e5e7eb 50%)'
                      : '#e5e7eb',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Platform badge */}
      {platform && currentStep !== 'uploading' && currentStep !== 'parsing' && (
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
            {platform}
            {confidence > 0 && (
              <span className="ml-1 text-violet-400 font-normal">
                {Math.round(confidence * 100)}%
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
