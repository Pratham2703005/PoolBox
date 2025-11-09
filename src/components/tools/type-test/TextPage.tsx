type TextPageProps = {
  difficulty: string;
  length: string;
  customText: string;
  setDifficulty: (diff: string) => void;
  setLength: (len: string) => void;
  setCustomText: (text: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePage1Next: () => void;
  canProceedFromPage1: () => string | boolean;
  countWords: (text: string) => number;
}
const TextPage = ({ difficulty, length, customText, setDifficulty, setLength, setCustomText, handleFileUpload, handlePage1Next, canProceedFromPage1, countWords }: TextPageProps) => {
  return (
   <div className="min-h-screen bg-gray-950 p-4 md:p-5 flex justify-center">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-6 flex gap-4">
            <div className="flex items-center">
              {/* <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-2xl shadow-2xl"> */}
                <svg className="size-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              {/* </div> */}
            </div>
            <h1 className="text-4xl md:text-5xl text-gray-200 font-bold py-2">
              TypeSpeed
            </h1>
          </div>

          {/* Main Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-8 md:p-10 space-y-8">
              
              {/* Difficulty Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                  <label className="text-xl font-bold text-white">Difficulty Level</label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'easy', label: 'Easy', color: 'from-green-500 to-emerald-500' },
                    { value: 'medium', label: 'Medium', color: 'from-yellow-500 to-orange-500' },
                    { value: 'hard', label: 'Hard', color: 'from-red-500 to-pink-500' }
                  ].map(diff => (
                    <button
                      key={diff.value}
                      onClick={() => {
                        setDifficulty(diff.value);
                        setCustomText('');
                      }}
                      className={`relative py-4 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-102 ${
                        difficulty === diff.value
                          ? `bg-gradient-to-br ${diff.color} text-white shadow-lg`
                          : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700 border border-slate-600'
                      }`}
                    >
                      {difficulty === diff.value && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                  <label className="text-xl font-bold text-white">Text Length</label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'short', label: 'Short' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'long', label: 'Long' }
                  ].map(len => (
                    <button
                      key={len.value}
                      onClick={() => {
                        setLength(len.value);
                        setCustomText('');
                      }}
                      className={`relative py-4 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-102 ${
                        length === len.value
                          ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700 border border-slate-600'
                      }`}
                    >
                      {length === len.value && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {len.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-slate-800 text-gray-400 font-semibold text-sm uppercase tracking-wider">
                    Or
                  </span>
                </div>
              </div>

              {/* Custom Upload Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                  <label className="text-xl font-bold text-white">Custom Text</label>
                </div>
                <div className="relative">
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="w-full px-6 py-4 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-xl text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-purple-500 file:text-white hover:file:opacity-90 file:cursor-pointer focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  {customText && (
                    <div className="mt-3 flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
                      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Custom text loaded ({countWords(customText)} words)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Button */}
              {canProceedFromPage1() && (
                <button
                  onClick={handlePage1Next}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-102 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Start Test
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
  )
}

export default TextPage
