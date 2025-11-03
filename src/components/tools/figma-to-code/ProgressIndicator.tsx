'use client';

interface ProgressIndicatorProps {
  stage: string;
  message: string;
}

export default function ProgressIndicator({ stage, message }: ProgressIndicatorProps) {
  const stages = [
    { id: 'connecting', label: 'Connecting', icon: '🔌' },
    { id: 'fetching', label: 'Fetching', icon: '📥' },
    { id: 'translating', label: 'Translating', icon: '🔄' },
    { id: 'assets', label: 'Assets', icon: '🖼️' },
    { id: 'finalizing', label: 'Finalizing', icon: '✨' },
  ];

  const currentIndex = stages.findIndex((s) => s.id === stage);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 mb-8">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {message}
        </h3>
        <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span className="animate-pulse">⏳</span>
          Processing your Figma file...
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {stages.map((s, index) => (
          <div key={s.id} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 transition-all duration-300 ${
                  index <= currentIndex
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 scale-110'
                    : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                }`}
              >
                {s.icon}
              </div>
              <span
                className={`text-xs mt-2 font-medium ${
                  index <= currentIndex
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {s.label}
              </span>
            </div>

            {/* Connecting Line */}
            {index < stages.length - 1 && (
              <div
                className={`w-16 h-1 mx-2 transition-all duration-300 ${
                  index < currentIndex
                    ? 'bg-blue-500'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Animated Progress Bar */}
      <div className="mt-6 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
          style={{
            width: `${((currentIndex + 1) / stages.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
