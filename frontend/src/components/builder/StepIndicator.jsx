/**
 * Horizontal step indicator for the chart builder workflow.
 * @param {{ currentStep: number }} props - currentStep is 1-indexed (1-4)
 */

const STEPS = [
  { label: 'Upload CSV' },
  { label: 'Deteksi Platform' },
  { label: 'Chart Builder' },
  { label: 'Export PDF' },
];

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ChevronRight = () => (
  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

export default function StepIndicator({ currentStep = 1 }) {
  return (
    <nav className="flex items-center gap-1" aria-label="Langkah-langkah">
      {STEPS.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        const isFuture = stepNum > currentStep;

        return (
          <div key={step.label} className="flex items-center gap-1">
            <div className="flex items-center gap-1.5">
              {/* Circle */}
              <div
                className={[
                  'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all',
                  isCompleted
                    ? 'bg-violet-600 text-white'
                    : isActive
                    ? 'border-2 border-violet-600 text-violet-600 bg-white'
                    : 'bg-gray-100 text-gray-400 border border-gray-200',
                ].join(' ')}
              >
                {isCompleted ? <CheckIcon /> : <span>{stepNum}</span>}
              </div>

              {/* Label */}
              <span
                className={[
                  'text-sm font-medium whitespace-nowrap',
                  isCompleted ? 'text-violet-600' : isActive ? 'text-violet-700' : 'text-gray-400',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>

            {/* Arrow separator */}
            {idx < STEPS.length - 1 && <ChevronRight />}
          </div>
        );
      })}
    </nav>
  );
}
