type ResultsPageProps = {
  testPassed: boolean;
  finalWPM: number;
  finalAccuracy: number;
  finalTime: number;
  totalWords: number;
  hasTimeLimit: boolean;
  requiredWPM: number;
  resetGame: () => void;
  formatTime: (totalSeconds: number) => string;
};

const ResultsPage = ({
  testPassed,
  finalWPM,
  finalAccuracy,
  finalTime,
  totalWords,
  hasTimeLimit,
  requiredWPM,
  resetGame,
  formatTime,
}: ResultsPageProps) => {
  return (
    <div className="min-h-screen bg-gray-950 p-2 sm:p-4 md:p-6 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            {testPassed ? (
              <div>
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3">🎉</div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Test Completed!
                </h1>
              </div>
            ) : (
              <div>
                <div className="text-5xl sm:text-6xl md:text-7xl mb-4">⏰</div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  Time&apos;s Up!
                </h1>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
            {/* WPM */}
            <div className="bg-slate-900/50 rounded-2xl p-4 sm:p-5 md:p-6 border border-slate-700/50">
              <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mb-2">
                Words Per Minute
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-400">
                {finalWPM}
              </p>
            </div>

            {/* Accuracy */}
            <div className="bg-slate-900/50 rounded-2xl p-4 sm:p-5 md:p-6 border border-slate-700/50">
              <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mb-2">
                Accuracy
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-400">
                {finalAccuracy.toFixed(1)}%
              </p>
            </div>

            {/* Time Taken */}
            <div className="bg-slate-900/50 rounded-2xl p-4 sm:p-5 md:p-6 border border-slate-700/50">
              <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mb-2">
                Time Taken
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-400">
                {formatTime(finalTime)}
              </p>
            </div>

            {/* Total Words */}
            <div className="bg-slate-900/50 rounded-2xl p-4 sm:p-5 md:p-6 border border-slate-700/50">
              <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mb-2">
                Total Words
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-400">
                {totalWords}
              </p>
            </div>
          </div>

          {/* Pass/Fail Status */}
          {hasTimeLimit && requiredWPM > 0 && (
            <div
              className={`p-4 sm:p-5 md:p-6 rounded-2xl mb-4 border ${
                testPassed
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}
            >
              <p
                className={`text-center text-sm sm:text-base md:text-lg font-semibold ${
                  testPassed ? "text-green-400" : "text-red-400"
                }`}
              >
                Required WPM: {requiredWPM} | Your WPM: {finalWPM}
                {testPassed ? " ✓ Passed!" : " ✗ Did not meet requirement"}
              </p>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={resetGame}
            className="w-full py-4 sm:py-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl text-base sm:text-lg md:text-xl font-bold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-2xl hover:scale-[1.02]"
          >
            Take Another Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
