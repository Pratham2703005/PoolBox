type ConfigPageProps = {
  totalWords: number;
  hasTimeLimit: boolean;
  setHasTimeLimit: (value: boolean) => void;
  minutes: string;
  setMinutes: (value: string) => void;
  seconds: string;
  setSeconds: (value: string) => void;
  requiredWPM: number;
  handlePage2Next: () => void;
}

const ConfigPage = ({
  totalWords,
  hasTimeLimit,
  setHasTimeLimit,
  minutes,
  setMinutes,
  seconds,
  setSeconds,
  requiredWPM,
  handlePage2Next
}: ConfigPageProps) => {
  return (
     <div className="min-h-screen bg-gray-950 p-4 md:p-5 flex justify-center">
        <div className="max-w-3xl w-full">
          {/* Header */}
          <div className="text-center mb-6 flex gap-4">
            <div className="flex items-center">
              {/* <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-2xl shadow-2xl"> */}
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              {/* </div> */}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-200 py-2">
              Configure Test
            </h1>
          </div>

          {/* Main Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-8 md:p-10 space-y-8">
              
              {/* Word Count Display */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 p-8">
                <div className="text-center">
                  <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Words</p>
                  <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    {totalWords}
                  </p>
                </div>
              </div>

              {/* Time Limit Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                  <label className="text-xl font-bold text-white">Time Limit</label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setHasTimeLimit(false)}
                    className={`relative py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-102 ${
                      !hasTimeLimit
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700 border border-slate-600'
                    }`}
                  >
                    {!hasTimeLimit && (
                      <div className="absolute top-3 right-3">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      No Time Limit
                    </div>
                  </button>
                  <button
                    onClick={() => setHasTimeLimit(true)}
                    className={`relative py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-102 ${
                      hasTimeLimit
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700 border border-slate-600'
                    }`}
                  >
                    {hasTimeLimit && (
                      <div className="absolute top-3 right-3">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Set Time Limit
                    </div>
                  </button>
                </div>
              </div>

              {/* Time Input Section */}
              {hasTimeLimit && (
                <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/50">
                  <div className="flex items-center gap-3 mb-6">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <label className="text-lg font-bold text-white">Set Time Duration</label>
                  </div>
                  <div className="flex gap-6 items-center justify-center">
                    <div className="flex flex-col items-center">
                      <label className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Minutes</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        placeholder="00"
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                        className="w-28 px-4 py-4 text-center text-3xl font-bold bg-slate-800 text-white border-2 border-slate-600 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <span className="text-4xl font-bold text-gray-500 mt-6">:</span>
                    <div className="flex flex-col items-center">
                      <label className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Seconds</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        placeholder="00"
                        value={seconds}
                        onChange={(e) => setSeconds(e.target.value)}
                        className="w-28 px-4 py-4 text-center text-3xl font-bold bg-slate-800 text-white border-2 border-slate-600 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                </div>
              )}

              {/* Start Button */}
              <div>

              <button
                onClick={handlePage2Next}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
              >
                Begin Typing Test
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              {requiredWPM > 0 && (
                    // <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4">
                      <div className="flex items-center justify-center gap-2 mt-1 text-green-500">
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                          Minimum speed required: {requiredWPM} WPM to pass
                      </div>
                    // </div>
                  )}
              </div>

             
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            Configure your test settings and start when ready
          </div>
        </div>
      </div>
  );
};

export default ConfigPage;
